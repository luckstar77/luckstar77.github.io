// imallenlai.com：導覽列、文字輪播、數字計數、捲動進場動畫與聯絡表單。
// 沿用舊版網站（jQuery 外掛）的效果，改寫成不需要任何套件的 JavaScript。
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = 'luckstar77y@gmail.com';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var navbar = document.querySelector('.navbar');
    var collapse = document.getElementById('nav-collapse');
    var toggle = document.querySelector('.navbar-toggle');

    // 捲過導覽列的高度後，導覽列改成白底（舊版的 navbar-color）。
    function updateNavbar() {
      navbar.classList.toggle('navbar-color', window.scrollY >= 40);
    }
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    // 手機版的選單按鈕。
    toggle.addEventListener('click', function () {
      var open = collapse.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    collapse.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        collapse.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // 目前所在的區塊（舊版的 scrollspy）。
    var navItems = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (link) {
      navItems[link.getAttribute('href').slice(1)] = link.parentElement;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navItems).forEach(function (id) {
          navItems[id].classList.toggle('active', id === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navItems).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });

    // 首頁的文字輪播（舊版的 simple-text-rotator，dissolve 效果，每 3 秒換一句）。
    var rotate = document.querySelector('.rotate');
    if (rotate && rotate.dataset.phrases && !reduceMotion) {
      var phrases = rotate.dataset.phrases.split('|');
      var index = 0;
      window.setInterval(function () {
        index = (index + 1) % phrases.length;
        rotate.classList.add('fading');
        window.setTimeout(function () {
          rotate.textContent = phrases[index];
          rotate.classList.remove('fading');
        }, 450);
      }, 3000);
    }

    // 數字從 0 數到目標值（舊版的 countTo）。
    var counters = document.querySelectorAll('.num[data-to]');
    if (!reduceMotion && counters.length) {
      counters.forEach(function (el) { el.textContent = '0'; });
      var counted = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          var target = parseInt(entry.target.dataset.to, 10);
          var start = null;
          function step(time) {
            if (start === null) start = time;
            var progress = Math.min((time - start) / 1600, 1);
            entry.target.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) window.requestAnimationFrame(step);
          }
          window.requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counted.observe(el); });
    }

    // 捲到畫面裡才彈進來（舊版的 WOW.js＋animate.css）。
    var reveals = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var revealer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { revealer.observe(el); });
    }

    // 聯絡表單：組成一封信，交給訪客的郵件程式寄出（網站本身不收資料）。
    var form = document.getElementById('contact-form');
    var send = document.getElementById('send-email');
    if (form && send) {
      // 在輸入框按 Enter 時改成按「寄出」，不要送出表單。
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        send.click();
      });
      send.addEventListener('click', function (event) {
        var name = form.elements.name.value.trim();
        var email = form.elements.email.value.trim();
        var message = form.elements.message.value.trim();
        if (!name && !email && !message) return;
        event.preventDefault();
        var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
        var subject = name ? 'Message from imallenlai.com (' + name + ')' : 'Message from imallenlai.com';
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      });
    }

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
