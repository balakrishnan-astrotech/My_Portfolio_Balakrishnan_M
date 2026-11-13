/* =========================================================
   Portfolio — site script
   1. Welcome screen exit
   2. Mobile navigation + active link
   3. Footer year
   4. Starfield canvas
   5. Brand underline toggle
   ========================================================= */
(function() {
  'use strict';

  var WELCOME_DELAY = 3000; /* ms — unchanged from the original timing */

  /* Run fn once the DOM is ready (works with or without `defer`). */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* Keep one failing feature from stopping the others. */
  function safely(fn) {
    try { fn(); } catch (err) {
      if (window.console && console.error) console.error(err);
    }
  }

  /* ---- 1. welcome screen ---- */
  function initWelcome() {
    var welcome = document.getElementById('welcome');
    if (!welcome) return; /* only the home page has a welcome screen */

    /* Already played this session (flag set by the inline script in <head>). */
    if (document.documentElement.classList.contains('welcome-seen')) {
      welcome.remove();
      return;
    }

    setTimeout(function() {
      welcome.classList.add('hide');
      try { sessionStorage.setItem('welcomeSeen', '1'); } catch (e) { }
    }, WELCOME_DELAY);
  }

  /* ---- 2. navigation ---- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');

    if (toggle && links) {
      var setOpen = function(open) {
        links.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (toggle.textContent == "Menu") {
          toggle.innerHTML = `X`;
          
        }
        else {
          toggle.innerHTML = "Menu";
        }
      };

      toggle.addEventListener('click', function() {
        setOpen(!links.classList.contains('open'));
      });

      /* One delegated listener instead of one per link. */
      links.addEventListener('click', function(e) {
        if (e.target.closest && e.target.closest('a')) setOpen(false);
      });

      /* Reset the menu state when the layout switches to desktop. */
      if (window.matchMedia) {
        var desktop = window.matchMedia('(min-width: 981px)');
        var onChange = function(e) { if (e.matches) setOpen(false); };
        if (desktop.addEventListener) desktop.addEventListener('change', onChange);
        else if (desktop.addListener) desktop.addListener(onChange);
      }
    }

    /* active link highlighting */
    var current = (document.body.getAttribute('data-page') || '').trim();
    if (current) {
      var items = document.querySelectorAll('.nav-links a[data-page]');
      for (var i = 0; i < items.length; i++) {
        if (items[ i ].getAttribute('data-page') === current) {
          items[ i ].classList.add('active');
          items[ i ].setAttribute('aria-current', 'page');
        }
      }
    }
  }

  /* ---- 3. footer year ---- */
  function initYear() {
    var year = String(new Date().getFullYear());
    var els = document.querySelectorAll('[data-year]');
    for (var i = 0; i < els.length; i++) els[ i ].textContent = year;
  }

  /* ---- 4. starfield ---- */
  function initStarfield() {
    var canvas = document.getElementById('starfield');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TWO_PI = Math.PI * 2;
    var stars = [];
    var w = 0, h = 0, dpr = 1;
    var resizeTimer = 0;

    function resize() {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.round(vw * dpr);
      h = canvas.height = Math.round(vh * dpr);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';

      /* Resizing a canvas resets its state, so set the fill once here
         and vary only globalAlpha per star (no per-frame string building). */
      ctx.fillStyle = 'rgb(231,236,246)';

      var count = Math.floor((vw * vh) / 9000);
      stars = new Array(count);
      for (var i = 0; i < count; i++) {
        stars[ i ] = {
          x: Math.random() * w,
          y: Math.random() * h,
          r: (Math.random() * 1.1 + 0.3) * dpr,
          base: Math.random() * 0.5 + 0.25,
          phase: Math.random() * TWO_PI,
          speed: Math.random() * 0.006 + 0.002
        };
      }
      /* In reduced-motion mode nothing animates, so repaint after a resize. */
      if (reduceMotion) draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[ i ];
        var a = reduceMotion ? s.base : s.base + Math.sin(t * s.speed + s.phase) * 0.25;
        ctx.globalAlpha = a < 0 ? 0 : (a > 1 ? 1 : a);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TWO_PI);
        ctx.fill();
      }
    }

    function frame(t) {
      draw(t);
      requestAnimationFrame(frame);
    }

    /* Debounced: regenerate the field once resizing settles, not on every event. */
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  /* ---- 5. brand underline ---- */
  function initBrand() {
    var brand = document.querySelector('.brand');
    if (!brand) return;
    brand.addEventListener('click', function() {
      brand.classList.toggle('clicked');
    });
  }

  onReady(function() {
    safely(initWelcome);
    safely(initNav);
    safely(initYear);
    safely(initStarfield);
    safely(initBrand);
  });
})();