/* ===============================================
   PORTFOLIO APP — theme, nav, scenes, gallery
   =============================================== */
(function () {
    'use strict';

    var prefersReducedMotion = false;
    try { prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    /* ---------- THEME SWITCHER ---------- */
    var THEMES = ['noir', 'midnight', 'emerald', 'light'];

    function applyTheme(name) {
        if (THEMES.indexOf(name) === -1) name = 'noir';
        document.documentElement.setAttribute('data-theme', name);
        try { localStorage.setItem('portfolio-theme', name); } catch (e) {}
        document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-set-theme') === name);
        });
        if (window.__bg) window.__bg.onThemeChange();
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

        var finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            try { sessionStorage.setItem('boot-seen', '1'); } catch (e) {}
            setTimeout(function () { loader.style.display = 'none'; }, 500);
        }

        // hard failsafe: never let the loader block the page
        setTimeout(finish, 3500);
        loader.addEventListener('click', finish);

        if (seen || prefersReducedMotion) { finish(); return; }

        var body = loader.querySelector('.loader-body');
        var lines = [
            '> init portfolio.sys ............ <span class="ok">OK</span>',
            '> load projects & dashboards .... <span class="ok">OK</span>',
            '> welcome, visitor <span class="ok">▊</span>'
        ];
        var i = 0;
        var timer = setInterval(function () {
            if (finished || i >= lines.length) {
                clearInterval(timer);
                setTimeout(finish, 420);
                return;
            }
            var div = document.createElement('div');
            div.className = 'ln';
            div.innerHTML = lines[i++];
            if (body) body.appendChild(div);
        }, 320);
    }

    /* ---------- NAVBAR ---------- */
    function initNav() {
        var navbar = document.getElementById('navbar');
        var hamburger = document.getElementById('hamburger');
        var mobileNav = document.getElementById('mobile-nav');

        if (navbar) {
            window.addEventListener('scroll', function () {
                navbar.classList.toggle('scrolled', window.scrollY > 30);
            }, { passive: true });
        }

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

    /* ===============================================
       THEMED BACKGROUND SCENES
       dark themes  -> deep space (stars, nebula, shooting stars)
       light theme  -> daytime sky (sun, drifting clouds)
       =============================================== */
    function initBackground() {
        var canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var W = 0, H = 0, raf = 0, t = 0;
        var mouse = { x: 0.5, y: 0.5 }; // normalized
        var accent = [212, 175, 55];
        var mode = 'space';

        var stars = [], nebulae = [], shooting = null, nextShot = 0;
        var clouds = [], sun = { x: 0, y: 0, r: 46 };

        function readTheme() {
            var style = getComputedStyle(document.documentElement);
            var rgb = style.getPropertyValue('--accent-rgb').split(',').map(function (n) { return parseInt(n, 10); });
            if (rgb.length === 3 && !rgb.some(isNaN)) accent = rgb;
            mode = document.documentElement.getAttribute('data-theme') === 'light' ? 'sky' : 'space';
        }

        /* ---------- SPACE SCENE ---------- */
        function buildSpace() {
            var count = W < 700 ? 90 : 180;
            stars = [];
            for (var i = 0; i < count; i++) {
                var depth = Math.random();
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: 0.4 + depth * 1.4,
                    depth: 0.2 + depth * 0.8,
                    phase: Math.random() * Math.PI * 2,
                    tw: 0.4 + Math.random() * 1.4,
                    tinted: Math.random() < 0.3,
                    drift: 0.02 + Math.random() * 0.05
                });
            }
            nebulae = [];
            for (var n = 0; n < 3; n++) {
                nebulae.push({
                    x: Math.random() * W,
                    y: Math.random() * H * 0.8,
                    r: 180 + Math.random() * 260,
                    a: 0.05 + Math.random() * 0.05
                });
            }
            shooting = null;
            nextShot = t + 200;
        }

        function drawSpace() {
            ctx.clearRect(0, 0, W, H);
            var ac = accent.join(',');
            var px = (mouse.x - 0.5), py = (mouse.y - 0.5);

            for (var n = 0; n < nebulae.length; n++) {
                var nb = nebulae[n];
                var nx = nb.x + px * 30, ny = nb.y + py * 30;
                var g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nb.r);
                g.addColorStop(0, 'rgba(' + ac + ',' + nb.a + ')');
                g.addColorStop(1, 'rgba(' + ac + ',0)');
                ctx.fillStyle = g;
                ctx.fillRect(nx - nb.r, ny - nb.r, nb.r * 2, nb.r * 2);
            }

            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.y += s.drift;
                if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
                var twinkle = 0.55 + 0.45 * Math.sin(s.phase + t * 0.02 * s.tw);
                var sx = s.x + px * 24 * s.depth;
                var sy = s.y + py * 24 * s.depth;
                ctx.beginPath();
                ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.tinted
                    ? 'rgba(' + ac + ',' + (twinkle * 0.9) + ')'
                    : 'rgba(255,255,255,' + (twinkle * 0.85) + ')';
                ctx.fill();
                if (s.r > 1.5 && twinkle > 0.9) {
                    ctx.strokeStyle = 'rgba(255,255,255,' + ((twinkle - 0.9) * 3) + ')';
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(sx - s.r * 3, sy); ctx.lineTo(sx + s.r * 3, sy);
                    ctx.moveTo(sx, sy - s.r * 3); ctx.lineTo(sx, sy + s.r * 3);
                    ctx.stroke();
                }
            }

            if (!shooting && t > nextShot) {
                shooting = {
                    x: Math.random() * W * 0.7 + W * 0.15,
                    y: Math.random() * H * 0.3,
                    vx: 6 + Math.random() * 5,
                    vy: 2.5 + Math.random() * 2,
                    life: 1
                };
                if (Math.random() < 0.5) { shooting.vx *= -1; }
            }
            if (shooting) {
                var sh = shooting;
                sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.016;
                var tail = 14;
                var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * tail, sh.y - sh.vy * tail);
                grad.addColorStop(0, 'rgba(255,255,255,' + (0.9 * Math.max(sh.life, 0)) + ')');
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(sh.x, sh.y);
                ctx.lineTo(sh.x - sh.vx * tail, sh.y - sh.vy * tail);
                ctx.stroke();
                if (sh.life <= 0 || sh.x < -50 || sh.x > W + 50 || sh.y > H + 50) {
                    shooting = null;
                    nextShot = t + 250 + Math.random() * 400;
                }
            }
        }

        /* ---------- SKY SCENE ---------- */
        function makeCloud(scale) {
            var w = Math.max(2, Math.round(300 * scale)), h = Math.max(2, Math.round(140 * scale));
            var off = document.createElement('canvas');
            off.width = w; off.height = h;
            var c = off.getContext('2d');
            if (!c) return off;
            var puffs = [
                [0.28, 0.62, 0.20], [0.42, 0.46, 0.26], [0.58, 0.42, 0.24],
                [0.72, 0.55, 0.22], [0.60, 0.68, 0.26], [0.40, 0.72, 0.24], [0.18, 0.72, 0.15]
            ];
            for (var i = 0; i < puffs.length; i++) {
                var p = puffs[i];
                var cx = p[0] * w, cy = p[1] * h, r = p[2] * w;
                var g = c.createRadialGradient(cx, cy - r * 0.15, r * 0.1, cx, cy, r);
                g.addColorStop(0, 'rgba(255,255,255,0.95)');
                g.addColorStop(0.65, 'rgba(255,255,255,0.75)');
                g.addColorStop(1, 'rgba(255,255,255,0)');
                c.fillStyle = g;
                c.beginPath();
                c.arc(cx, cy, r, 0, Math.PI * 2);
                c.fill();
            }
            return off;
        }

        function buildSky() {
            sun.x = W * 0.8; sun.y = H * 0.16; sun.r = Math.max(38, Math.min(54, W * 0.035));
            clouds = [];
            var count = W < 700 ? 6 : 10;
            for (var i = 0; i < count; i++) {
                var scale = 0.5 + Math.random() * 1.1;
                clouds.push({
                    img: makeCloud(scale),
                    x: Math.random() * (W + 300) - 300,
                    y: Math.random() * H * 0.55,
                    v: 0.12 + Math.random() * 0.3,
                    depth: 0.3 + Math.random() * 0.7,
                    alpha: 0.55 + Math.random() * 0.4
                });
            }
        }

        function drawSky() {
            var g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, '#5fb2e6');
            g.addColorStop(0.55, '#9ed4f2');
            g.addColorStop(1, '#dff2fc');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);

            var px = (mouse.x - 0.5), py = (mouse.y - 0.5);
            var sx = sun.x + px * 10, sy = sun.y + py * 10;

            var halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, sun.r * 7);
            halo.addColorStop(0, 'rgba(255,214,120,0.55)');
            halo.addColorStop(0.4, 'rgba(255,214,120,0.18)');
            halo.addColorStop(1, 'rgba(255,214,120,0)');
            ctx.fillStyle = halo;
            ctx.fillRect(sx - sun.r * 7, sy - sun.r * 7, sun.r * 14, sun.r * 14);

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(t * 0.0012);
            for (var r = 0; r < 12; r++) {
                ctx.rotate(Math.PI / 6);
                var pulse = 1 + 0.08 * Math.sin(t * 0.03 + r);
                var rg = ctx.createLinearGradient(0, sun.r * 1.15, 0, sun.r * 2.1 * pulse);
                rg.addColorStop(0, 'rgba(255,200,87,0.5)');
                rg.addColorStop(1, 'rgba(255,200,87,0)');
                ctx.fillStyle = rg;
                ctx.beginPath();
                ctx.moveTo(-2.5, sun.r * 1.15);
                ctx.lineTo(2.5, sun.r * 1.15);
                ctx.lineTo(0, sun.r * 2.1 * pulse);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            var disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, sun.r);
            disc.addColorStop(0, '#fff7d6');
            disc.addColorStop(0.7, '#ffd95e');
            disc.addColorStop(1, '#ffc83d');
            ctx.fillStyle = disc;
            ctx.beginPath();
            ctx.arc(sx, sy, sun.r, 0, Math.PI * 2);
            ctx.fill();

            for (var i = 0; i < clouds.length; i++) {
                var cl = clouds[i];
                cl.x += cl.v * cl.depth;
                if (cl.x > W + 60) { cl.x = -cl.img.width - 60; cl.y = Math.random() * H * 0.55; }
                ctx.globalAlpha = cl.alpha;
                ctx.drawImage(cl.img, cl.x + px * 18 * cl.depth, cl.y + py * 12 * cl.depth);
                ctx.globalAlpha = 1;
            }
        }

        /* ---------- engine ---------- */
        function rebuild() {
            readTheme();
            if (mode === 'sky') buildSky(); else buildSpace();
        }

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            rebuild();
            if (prefersReducedMotion) drawOnce();
        }

        function frame() {
            t++;
            try {
                if (mode === 'sky') drawSky(); else drawSpace();
            } catch (e) {
                cancelAnimationFrame(raf);
                return;
            }
            raf = requestAnimationFrame(frame);
        }

        function drawOnce() {
            try { if (mode === 'sky') drawSky(); else drawSpace(); } catch (e) {}
        }

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', function (e) {
            mouse.x = e.clientX / Math.max(W, 1);
            mouse.y = e.clientY / Math.max(H, 1);
        }, { passive: true });
        document.addEventListener('visibilitychange', function () {
            if (prefersReducedMotion) return;
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });

        window.__bg = {
            onThemeChange: function () {
                rebuild();
                if (prefersReducedMotion) drawOnce();
            }
        };

        resize();
        if (!prefersReducedMotion) raf = requestAnimationFrame(frame);
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
        function addCard(src) {
            var card = document.createElement('div');
            card.className = 'dash-card reveal visible';
            var img = document.createElement('img');
            img.src = src;
            img.loading = 'lazy';
            img.alt = 'Power BI Dashboard ' + idx;
            card.appendChild(img);
            var cap = document.createElement('div');
            cap.className = 'dash-cap';
            cap.textContent = 'DASHBOARD — ' + (idx < 10 ? '0' + idx : idx);
            card.appendChild(cap);
            card.addEventListener('click', function () { openLb(src); });
            gallery.appendChild(card);
            idx++;
            loadNext();
        }
        function loadNext() {
            // try modern webp first, fall back to png
            var webp = 'dashboard/' + idx + '.webp';
            var png = 'dashboard/' + idx + '.png';
            var probe = new Image();
            probe.src = webp;
            probe.onload = function () { addCard(webp); };
            probe.onerror = function () {
                var probe2 = new Image();
                probe2.src = png;
                probe2.onload = function () { addCard(png); };
                probe2.onerror = function () { /* stop: no more images */ };
            };
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


    /* ---------- 3D TILT ON TILES (subtle) ---------- */
    function initTilt() {
        if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
        var MAX = 3; // degrees
        document.querySelectorAll('.tile').forEach(function (tile) {
            tile.addEventListener('mousemove', function (e) {
                var r = tile.getBoundingClientRect();
                var nx = (e.clientX - r.left) / r.width - 0.5;
                var ny = (e.clientY - r.top) / r.height - 0.5;
                tile.style.setProperty('--ry', (nx * MAX) + 'deg');
                tile.style.setProperty('--rx', (-ny * MAX) + 'deg');
                tile.style.setProperty('--ty', '-3px');
            });
            tile.addEventListener('mouseleave', function () {
                tile.style.setProperty('--rx', '0deg');
                tile.style.setProperty('--ry', '0deg');
                tile.style.setProperty('--ty', '0px');
            });
        });
    }

    /* ---------- ANIMATED COUNTERS ---------- */
    function initCounters() {
        var els = document.querySelectorAll('.count[data-count]');
        if (!els.length) return;

        function animate(el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            if (isNaN(target)) return;
            if (prefersReducedMotion) { el.textContent = target.toFixed(decimals); return; }
            var dur = 1100, start = null;
            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = (target * eased).toFixed(decimals);
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    animate(en.target);
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: 0.4 });
        els.forEach(function (el) { obs.observe(el); });
    }

    /* ---------- LIVE CLOCK (WIB) ---------- */
    function initClock() {
        var el = document.getElementById('local-time');
        if (!el) return;
        var fmt;
        try {
            fmt = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
        } catch (e) { fmt = null; }
        function tick() {
            el.textContent = fmt ? fmt.format(new Date()) : new Date().toLocaleTimeString();
        }
        tick();
        setInterval(tick, 1000);
    }


    /* ---------- LANGUAGE TOGGLE (EN/ID) ---------- */
    var I18N = [
        ['.ed-title .line > span', [
            'Tentang Saya', 'Pengalaman', 'Karya Pilihan', 'Dashboard',
            'Tools & Bahasa', 'Sertifikasi', 'Penghargaan & Lainnya'
        ]],
        ['.ed-sub', [
            'Machine learning, otomasi, dan business intelligence — klik baris mana pun untuk membuka.',
            'Dashboard interaktif yang dibuat dengan Power BI dan tools visualisasi lainnya. Klik gambar untuk melihat ukuran penuh.'
        ]],
        ['.hero-desc', [
            'Mengubah data kompleks menjadi insight yang actionable melalui analitik lanjutan, machine learning, dan teknik visualisasi yang inovatif.'
        ]],
        ['.about-lede', [
            'Saya mengubah <em>data mentah</em> menjadi keputusan — lewat analisis, model, dan dashboard yang benar-benar dipakai orang.'
        ]],
        ['.about-body p', [
            'Lulusan Data Science dari <strong>Telkom University</strong> dengan pengalaman akademik dan organisasi yang kuat, termasuk <strong>publikasi jurnal terindeks Scopus</strong>. Terampil dalam analisis data, visualisasi, pemodelan statistik, dan manajemen basis data.',
            'Berpengalaman sebagai Data Visualization Intern di <strong>Bank Indonesia</strong>. Bersemangat mengembangkan karier di bidang analisis data dan big data analytics dengan menerapkan kemampuan teknis dan analitis di lingkungan kerja yang dinamis.'
        ]],
        ['.stat-cell small', ['IPK', 'Sertifikat', 'Proyek', 'Tahun Pengalaman']],
        ['.x-points li', [
            'Manajemen data end-to-end: mengekstrak dan memproses data mentah dari database MySQL untuk menjamin integritas dan kesiapan data untuk analisis.',
            'Melakukan transformasi dan pembersihan data kompleks untuk menyiapkan dataset pelaporan.',
            'Merancang dan memvisualisasikan metrik kinerja utama menggunakan Power BI, membangun dashboard interaktif untuk mendukung pengambilan keputusan strategis.',
            'Mengembangkan solusi berbasis AI menggunakan Google Gemini API dengan akurasi 92% dalam pemrosesan teks.',
            'Mengotomasi konversi 10K+ soal ujian untuk 200+ pengguna, memangkas waktu proses hingga 75%.',
            'Meningkatkan performa mahasiswa 30% melalui workshop Python dan SQL; mengevaluasi 500+ tugas.',
            'Menghasilkan 8 dashboard strategis dengan kepuasan stakeholder 85%, memengaruhi keputusan level C secara langsung.',
            'Memangkas waktu pelaporan 40% melalui otomasi Power BI di 5 kantor cabang regional.'
        ]],
        ['.p-desc', [
            'Bot keuangan pribadi yang mencatat transaksi ke Google Sheets dengan analitik AI: input bahasa natural, kategorisasi otomatis, pelacakan saldo real-time, dan laporan berkala dengan rekomendasi anggaran.',
            'Bot penjadwalan pintar: pembuatan acara dengan bahasa natural, analisis dan optimasi jadwal oleh AI, pengingat otomatis, dan dukungan zona waktu.',
            'Dashboard berbasis ML untuk analisis ketahanan pangan Indonesia (R² 85,1%) dengan validasi silang time-series: peramalan, feature importance, dan penilaian risiko provinsi.',
            'Laporan interaktif tiga halaman yang mengubah data transaksi kompleks menjadi insight strategis: tren kampanye, analisis produk, dan profil pelanggan 360°.',
            'Aplikasi dual-mode yang mengotomasi ekstraksi soal dari .txt, .pdf, dan .docx menjadi Excel terstruktur — parsing AI plus tiga mode manual untuk berbagai format ujian.',
            'Dashboard BI untuk perusahaan tambang batu bara di Jambi: integrasi data produksi dan konsumsi BBM real-time, menggantikan pelaporan manual yang terfragmentasi.',
            "Model ML untuk mengklasifikasi apakah harga penutupan saham akan melewati ambang batas — seleksi fitur Cramér's V, 1.023 kombinasi fitur. Dipublikasikan & meraih Best Paper di ICoDSA 2025."
        ]],
        ['.c-desc', [
            'Analitik data, Python, SQL, visualisasi data, analisis data statistik.',
            'Dasar-dasar data science: pemrosesan data, statistik dasar, dan Python untuk analisis data.',
            'Data wrangling, exploratory data analysis, dan pemrograman Python dalam konteks data science.',
            'Looker Studio untuk visualisasi data dan pelaporan business intelligence.',
            'Analisis data deret waktu menggunakan Python dan teknik peramalan statistik.',
            'Administrasi sistem, dasar jaringan, dan layanan infrastruktur TI.'
        ]],
        ['.a-points li', [
            'Diberikan untuk paper "Classification of Stocks with Potential to Reach Minimum Price Levels on the Indonesian Stock Exchange using SVM and XGBoost".',
            'Berkolaborasi dengan pembimbing akademik Bapak Deni Saepudin dari Telkom University.',
            'Menyoroti pemodelan prediktif dalam klasifikasi saham untuk edukasi dan riset.',
            'Salah satu dari 3 tim proyek akhir terbaik di antara peserta Batch 22.',
            'Program intensif 2 minggu mencakup SQL, Python, statistik, dan visualisasi data.',
            'Aplikasi command-line Python yang menyimulasikan Suit Gunting-Batu-Kertas dengan backend yang dapat dikonfigurasi sehingga admin dapat mengatur probabilitas menang pengguna.',
            'Alat edukasi yang menunjukkan bagaimana sistem judi online dapat dimanipulasi, meningkatkan kesadaran pelajar muda.',
            '<strong>Chairman of BPM HimaDS</strong> (Feb 2024 — Mar 2025): pemimpin utama Badan Perwakilan Mahasiswa, mengarahkan strategi dan mengawasi seluruh program kerja himpunan.',
            '<strong>Coordinator, Student Resource Development Division</strong> (Jul 2023 — Feb 2024): mengawasi program pengembangan kemampuan teknis dan soft skill mahasiswa.'
        ]],
        ['.contact-big .line > span', [
            'Mari ubah data', 'jadi <span class="accent">keputusan.</span>'
        ]],
        ['.contact-sub', [
            'Baik untuk peluang kerja, kolaborasi, atau sekadar terhubung — saya senang mendengar darimu.'
        ]],
        ['.skill-cat', ['Tools Utama', 'Library & Framework']],
        ['.contact-links .u-link:last-child', ['Unduh Resume <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>']]
    ];

    var currentLang = 'en';

    function setLang(lang) {
        currentLang = lang === 'id' ? 'id' : 'en';
        document.documentElement.setAttribute('lang', currentLang);
        try { localStorage.setItem('portfolio-lang', currentLang); } catch (e) {}

        I18N.forEach(function (pair) {
            var els = document.querySelectorAll(pair[0]);
            var idTexts = pair[1];
            els.forEach(function (el, i) {
                if (i >= idTexts.length) return;
                if (el.dataset.orig === undefined) el.dataset.orig = el.innerHTML;
                el.innerHTML = (currentLang === 'id') ? idTexts[i] : el.dataset.orig;
            });
        });

        var btn = document.getElementById('lang-btn');
        if (btn) btn.textContent = currentLang === 'en' ? 'ID' : 'EN';
    }

    function initLang() {
        var saved = null;
        try { saved = localStorage.getItem('portfolio-lang'); } catch (e) {}
        if (saved === 'id') setLang('id');
        var btn = document.getElementById('lang-btn');
        if (btn) {
            btn.addEventListener('click', function () {
                setLang(currentLang === 'en' ? 'id' : 'en');
            });
        }
    }

    /* ---------- BOOT (each module is isolated: one failure never blocks the rest) ---------- */
    function boot() {
        [initLoader, initTheme, initBackground, initNav, initScrollUx,
         initReveal, initTyping, initGallery, initCursor, initYear,
         initTilt, initCounters, initClock, initLang
        ].forEach(function (fn) {
            try { fn(); } catch (e) {
                if (window.console) console.error('init failed:', fn.name, e);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
