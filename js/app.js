/* ===============================================
   PORTFOLIO APP — theme, nav, effects, gallery
   =============================================== */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- THEME SWITCHER ---------- */
    var THEMES = ['noir', 'midnight', 'emerald', 'light'];

    function applyTheme(name) {
        if (THEMES.indexOf(name) === -1) name = 'noir';
        document.documentElement.setAttribute('data-theme', name);
        try { localStorage.setItem('portfolio-theme', name); } catch (e) {}
        // update active states
        document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-set-theme') === name);
        });
        // recolor particles
        if (window.__particles) window.__particles.refreshColor();
        // browser UI color
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    }

    function initTheme() {
        var saved = null;
        try { saved = localStorage.getItem('portfolio-theme'); } catch (e) {}
        applyTheme(saved || 'noir');

        var btn = document.getElementById('theme-btn');
        var menu = document.getElementById('theme-menu');
        if (btn && menu) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                menu.classList.toggle('open');
            });
            document.addEventListener('click', function () { menu.classList.remove('open'); });
        }
        document.querySelectorAll('[data-set-theme]').forEach(function (b) {
            b.addEventListener('click', function () {
                applyTheme(b.getAttribute('data-set-theme'));
            });
        });
    }

    /* ---------- LOADER (fast, once per session, skippable) ---------- */
    function initLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return;

        var seen = false;
        try { seen = sessionStorage.getItem('boot-seen') === '1'; } catch (e) {}

        function finish() {
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            try { sessionStorage.setItem('boot-seen', '1'); } catch (e) {}
            setTimeout(function () { loader.style.display = 'none'; }, 500);
        }

        if (seen || prefersReducedMotion) { finish(); return; }

        var body = loader.querySelector('.loader-body');
        var lines = [
            '> init portfolio.sys ............ <span class="ok">OK</span>',
            '> load projects & dashboards .... <span class="ok">OK</span>',
            '> welcome, visitor <span class="ok">▊</span>'
        ];
        var i = 0;
        var timer = setInterval(function () {
            if (i >= lines.length) {
                clearInterval(timer);
                setTimeout(finish, 420);
                return;
            }
            var div = document.createElement('div');
            div.className = 'ln';
            div.innerHTML = lines[i++];
            body.appendChild(div);
        }, 320);

        loader.addEventListener('click', function () {
            clearInterval(timer);
            finish();
        });
    }

    /* ---------- NAVBAR ---------- */
    function initNav() {
        var navbar = document.getElementById('navbar');
        var hamburger = document.getElementById('hamburger');
        var mobileNav = document.getElementById('mobile-nav');

        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
        }, { passive: true });

        if (hamburger && mobileNav) {
            hamburger.addEventListener('click', function () {
                hamburger.classList.toggle('open');
                mobileNav.classList.toggle('open');
                document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
            });
            mobileNav.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    hamburger.classList.remove('open');
                    mobileNav.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });
        }

        // active link highlight
        var links = document.querySelectorAll('.nav-menu a[href^="#"]');
        var map = {};
        links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting && map[en.target.id]) {
                    links.forEach(function (a) { a.classList.remove('active'); });
                    map[en.target.id].classList.add('active');
                }
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { obs.observe(s); });
    }

    /* ---------- SCROLL PROGRESS + TO TOP ---------- */
    function initScrollUx() {
        var bar = document.getElementById('scroll-progress');
        var toTop = document.getElementById('to-top');
        window.addEventListener('scroll', function () {
            var h = document.documentElement.scrollHeight - window.innerHeight;
            if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
            if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
        }, { passive: true });
        if (toTop) toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- REVEAL ON SCROLL ---------- */
    function initReveal() {
        var els = document.querySelectorAll('.reveal');
        if (prefersReducedMotion) {
            els.forEach(function (el) { el.classList.add('visible'); });
            return;
        }
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('visible');
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(function (el) { obs.observe(el); });
    }

    /* ---------- TYPING EFFECT ---------- */
    function initTyping() {
        var el = document.getElementById('typing-text');
        if (!el) return;
        var roles = [
            'Data Scientist',
            'Data Analyst',
            'Machine Learning Engineer',
            'BI Developer',
            'Data Engineer'
        ];
        if (prefersReducedMotion) { el.textContent = roles[0]; return; }
        var ri = 0, ci = 0, deleting = false;

        function tick() {
            var word = roles[ri];
            if (!deleting) {
                ci++;
                el.textContent = word.slice(0, ci);
                if (ci === word.length) { deleting = true; setTimeout(tick, 2200); return; }
                setTimeout(tick, 65);
            } else {
                ci--;
                el.textContent = word.slice(0, ci);
                if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, 350); return; }
                setTimeout(tick, 35);
            }
        }
        tick();
    }

    /* ---------- PARTICLE BACKGROUND (lightweight 2D) ---------- */
    function initParticles() {
        var canvas = document.getElementById('bg-canvas');
        if (!canvas || prefersReducedMotion) return;

        var ctx = canvas.getContext('2d');
        var dots = [], W, H, raf;
        var mouse = { x: -9999, y: -9999 };
        var color = { r: 212, g: 175, b: 55 };
        var alpha = 0.55;

        function refreshColor() {
            var style = getComputedStyle(document.documentElement);
            var rgb = style.getPropertyValue('--accent-rgb').split(',').map(function (n) { return parseInt(n, 10); });
            if (rgb.length === 3 && !rgb.some(isNaN)) color = { r: rgb[0], g: rgb[1], b: rgb[2] };
            var a = parseFloat(style.getPropertyValue('--particle-alpha'));
            if (!isNaN(a)) alpha = a;
        }

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            var count = W < 700 ? 36 : 72;
            dots = [];
            for (var i = 0; i < count; i++) {
                dots.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: Math.random() * 1.6 + 0.6
                });
            }
        }

        function frame() {
            ctx.clearRect(0, 0, W, H);
            var c = color.r + ',' + color.g + ',' + color.b;

            for (var i = 0; i < dots.length; i++) {
                var d = dots[i];
                d.x += d.vx; d.y += d.vy;

                // gentle repel from mouse
                var dx = d.x - mouse.x, dy = d.y - mouse.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    d.x += (dx / dist) * 0.6;
                    d.y += (dy / dist) * 0.6;
                }

                if (d.x < 0 || d.x > W) d.vx *= -1;
                if (d.y < 0 || d.y > H) d.vy *= -1;

                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + c + ',' + alpha * 0.7 + ')';
                ctx.fill();

                for (var j = i + 1; j < dots.length; j++) {
                    var o = dots[j];
                    var ddx = d.x - o.x, ddy = d.y - o.y;
                    var dd = ddx * ddx + ddy * ddy;
                    if (dd < 13000) {
                        ctx.beginPath();
                        ctx.moveTo(d.x, d.y);
                        ctx.lineTo(o.x, o.y);
                        ctx.strokeStyle = 'rgba(' + c + ',' + (alpha * 0.16 * (1 - dd / 13000)) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(frame);
        }

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });

        refreshColor();
        resize();
        raf = requestAnimationFrame(frame);
        window.__particles = { refreshColor: refreshColor };
    }

    /* ---------- DASHBOARD GALLERY + LIGHTBOX ---------- */
    function initGallery() {
        var gallery = document.getElementById('dashboard-gallery');
        var lightbox = document.getElementById('lightbox');
        var lbImg = lightbox ? lightbox.querySelector('img') : null;
        if (!gallery) return;

        function openLb(src) {
            if (!lightbox) return;
            lbImg.src = src;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeLb() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (lightbox) {
            lightbox.addEventListener('click', closeLb);
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
        }

        var idx = 1;
        function loadNext() {
            var src = 'dashboard/' + idx + '.png';
            var probe = new Image();
            probe.src = src;
            probe.onload = function () {
                var card = document.createElement('div');
                card.className = 'dash-card reveal visible';
                var img = document.createElement('img');
                img.src = src;
                img.loading = 'lazy';
                img.alt = 'Power BI Dashboard ' + idx;
                card.appendChild(img);
                card.addEventListener('click', function () { openLb(src); });
                gallery.appendChild(card);
                idx++;
                loadNext();
            };
            probe.onerror = function () { /* stop at first missing file */ };
        }
        loadNext();
    }

    /* ---------- CUSTOM CURSOR (subtle, desktop only) ---------- */
    function initCursor() {
        if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
        var dot = document.createElement('div');
        var ring = document.createElement('div');
        dot.className = 'cursor-dot';
        ring.className = 'cursor-ring';
        document.body.appendChild(dot);
        document.body.appendChild(ring);

        var x = -100, y = -100, rx = -100, ry = -100;
        window.addEventListener('mousemove', function (e) {
            x = e.clientX; y = e.clientY;
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
        }, { passive: true });

        (function follow() {
            rx += (x - rx) * 0.16;
            ry += (y - ry) * 0.16;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(follow);
        })();

        document.addEventListener('mouseover', function (e) {
            ring.classList.toggle('hovering', !!e.target.closest('a, button, .dash-card'));
        });
    }

    /* ---------- FOOTER YEAR ---------- */
    function initYear() {
        var y = document.getElementById('year');
        if (y) y.textContent = new Date().getFullYear();
    }

    /* ---------- BOOT ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        initLoader();
        initNav();
        initScrollUx();
        initReveal();
        initTyping();
        initParticles();
        initGallery();
        initCursor();
        initYear();
    });
})();
