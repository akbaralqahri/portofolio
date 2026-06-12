/* ===============================================
   PORTFOLIO APP — theme, nav, scenes, gallery
   =============================================== */
(function () {
    'use strict';

    var prefersReducedMotion = false;
    try { prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    /* ---------- THEME SWITCHER ---------- */
    var THEMES = ['noir', 'midnight', 'emerald', 'violet', 'crimson', 'ember', 'silver'];

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
       3D STARFIELD BACKGROUND
       - true perspective projection
       - camera yaw/pitch follows the cursor
       - warp (fly-through) when scrolled to top
       - cursor constellations, click bursts,
         nav-warp boosts, random meteors
       =============================================== */
    function initBackground() {
        var canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var W = 0, H = 0, cx = 0, cy = 0, FOCAL = 500;
        var raf = 0, t = 0;
        var accent = [212, 175, 55];

        // --- world ---
        var SPREAD = 1100, MAXZ = 1600;
        var DRIFT = 0.7, WARP = 22;
        var stars = [];
        var speed = DRIFT, atTop = true, navBoost = 0;

        // --- camera ---
        var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0;
        var hasMouse = window.matchMedia('(pointer: fine)').matches;
        var mouse = { x: -9999, y: -9999 };

        // --- effects ---
        var bursts = [];          // click particle sparks
        var meteor = null, nextMeteor = 400;
        var nebulae = [];

        function readTheme() {
            var style = getComputedStyle(document.documentElement);
            var rgb = style.getPropertyValue('--accent-rgb').split(',').map(function (n) { return parseInt(n, 10); });
            if (rgb.length === 3 && !rgb.some(isNaN)) accent = rgb;
        }

        function spawnStar(far) {
            return {
                x: (Math.random() - 0.5) * 2 * SPREAD,
                y: (Math.random() - 0.5) * 2 * SPREAD * 0.7,
                z: far ? MAXZ * (0.85 + Math.random() * 0.15) : Math.random() * MAXZ,
                tint: Math.random() < 0.3,
                px: null, py: null
            };
        }

        function build() {
            var count = W < 700 ? 220 : 420;
            stars = [];
            for (var i = 0; i < count; i++) stars.push(spawnStar(false));
            nebulae = [];
            for (var n = 0; n < 3; n++) {
                nebulae.push({
                    x: Math.random() * W, y: Math.random() * H * 0.85,
                    r: 200 + Math.random() * 280, a: 0.05 + Math.random() * 0.05
                });
            }
        }

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            cx = W / 2; cy = H / 2;
            FOCAL = H * 1.05;
            build();
            if (prefersReducedMotion) frameOnce();
        }

        /* ---------- main frame ---------- */
        function frame() {
            t++;

            // speed: warp at top of page, gentle drift elsewhere (+ nav boost)
            var target = (atTop ? WARP : DRIFT) + navBoost;
            if (navBoost > 0) navBoost *= 0.94;
            speed += (target - speed) * 0.035;

            // camera follows cursor (mouse left => look left)
            yaw += (tYaw - yaw) * 0.055;
            pitch += (tPitch - pitch) * 0.055;
            if (!hasMouse) { tYaw = Math.sin(t * 0.0015) * 0.07; tPitch = Math.cos(t * 0.0011) * 0.05; }

            ctx.clearRect(0, 0, W, H);
            var ac = accent.join(',');

            // nebula glow (screen space, slight camera parallax)
            for (var n = 0; n < nebulae.length; n++) {
                var nb = nebulae[n];
                var nx = nb.x - yaw * 320, ny = nb.y - pitch * 320;
                var g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nb.r);
                g.addColorStop(0, 'rgba(' + ac + ',' + nb.a + ')');
                g.addColorStop(1, 'rgba(' + ac + ',0)');
                ctx.fillStyle = g;
                ctx.fillRect(nx - nb.r, ny - nb.r, nb.r * 2, nb.r * 2);
            }

            var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
            var cosP = Math.cos(pitch), sinP = Math.sin(pitch);
            var warping = speed > 4;
            var near = []; // candidates for constellation

            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.z -= speed;
                if (s.z < 8) { stars[i] = spawnStar(true); continue; }

                // rotate world around camera (yaw then pitch)
                var x1 = s.x * cosY - s.z * sinY;
                var z1 = s.x * sinY + s.z * cosY;
                var y1 = s.y * cosP - z1 * sinP;
                var z2 = s.y * sinP + z1 * cosP;
                if (z2 < 8) { s.px = null; continue; }

                var sx = cx + (x1 / z2) * FOCAL;
                var sy = cy + (y1 / z2) * FOCAL;
                if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) { s.px = null; continue; }

                var depth = 1 - z2 / MAXZ;
                if (depth < 0) depth = 0;
                var size = 0.3 + depth * 2.1;
                var alpha = 0.15 + depth * 0.85;
                var color = s.tint ? ac : '255,255,255';

                if (warping && s.px !== null) {
                    // motion streak
                    ctx.strokeStyle = 'rgba(' + color + ',' + (alpha * 0.9) + ')';
                    ctx.lineWidth = size;
                    ctx.beginPath();
                    ctx.moveTo(s.px, s.py);
                    ctx.lineTo(sx, sy);
                    ctx.stroke();
                } else {
                    var tw = 0.7 + 0.3 * Math.sin(i * 1.7 + t * 0.03);
                    ctx.beginPath();
                    ctx.arc(sx, sy, size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + color + ',' + (alpha * tw) + ')';
                    ctx.fill();
                }
                s.px = sx; s.py = sy;

                // collect near-cursor stars for constellation
                if (hasMouse && !warping && depth > 0.45 && near.length < 28) {
                    var dx = sx - mouse.x, dy = sy - mouse.y;
                    if (dx * dx + dy * dy < 19600) near.push([sx, sy]); // 140px radius
                }
            }

            // constellation lines around the cursor
            if (near.length > 1) {
                for (var a = 0; a < near.length; a++) {
                    for (var b = a + 1; b < near.length; b++) {
                        var ddx = near[a][0] - near[b][0], ddy = near[a][1] - near[b][1];
                        var dd = ddx * ddx + ddy * ddy;
                        if (dd < 12100) { // 110px
                            ctx.beginPath();
                            ctx.moveTo(near[a][0], near[a][1]);
                            ctx.lineTo(near[b][0], near[b][1]);
                            ctx.strokeStyle = 'rgba(' + ac + ',' + (0.35 * (1 - dd / 12100)) + ')';
                            ctx.lineWidth = 0.8;
                            ctx.stroke();
                        }
                    }
                }
            }

            // meteor (random shooting star, screen space)
            if (!meteor && t > nextMeteor && !warping) {
                meteor = {
                    x: Math.random() * W * 0.7 + W * 0.15,
                    y: Math.random() * H * 0.3,
                    vx: (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 5),
                    vy: 2.5 + Math.random() * 2,
                    life: 1
                };
            }
            if (meteor) {
                meteor.x += meteor.vx; meteor.y += meteor.vy; meteor.life -= 0.016;
                var tail = 14;
                var mg = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail);
                mg.addColorStop(0, 'rgba(255,255,255,' + (0.9 * Math.max(meteor.life, 0)) + ')');
                mg.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = mg;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(meteor.x, meteor.y);
                ctx.lineTo(meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail);
                ctx.stroke();
                if (meteor.life <= 0 || meteor.x < -60 || meteor.x > W + 60 || meteor.y > H + 60) {
                    meteor = null;
                    nextMeteor = t + 300 + Math.random() * 500;
                }
            }

            // click particle bursts
            for (var p = bursts.length - 1; p >= 0; p--) {
                var pt = bursts[p];
                pt.x += pt.vx; pt.y += pt.vy;
                pt.vx *= 0.96; pt.vy *= 0.96;
                pt.life -= 0.022;
                if (pt.life <= 0) { bursts.splice(p, 1); continue; }
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.r * pt.life, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + (pt.tint ? ac : '255,255,255') + ',' + (pt.life * 0.9) + ')';
                ctx.fill();
            }

            raf = requestAnimationFrame(frame);
        }

        function frameOnce() {
            // static render for reduced motion: dots only, no warp
            ctx.clearRect(0, 0, W, H);
            var ac = accent.join(',');
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                if (s.z < 8) continue;
                var sx = cx + (s.x / s.z) * FOCAL;
                var sy = cy + (s.y / s.z) * FOCAL;
                if (sx < 0 || sx > W || sy < 0 || sy > H) continue;
                var depth = 1 - s.z / MAXZ;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.3 + depth * 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + (s.tint ? ac : '255,255,255') + ',' + (0.2 + depth * 0.8) + ')';
                ctx.fill();
            }
        }

        /* ---------- events ---------- */
        window.addEventListener('resize', resize);

        window.addEventListener('mousemove', function (e) {
            mouse.x = e.clientX; mouse.y = e.clientY;
            // mouse left => camera turns left (scene shifts right)
            tYaw = (e.clientX / Math.max(W, 1) - 0.5) * 0.55;
            tPitch = (e.clientY / Math.max(H, 1) - 0.5) * 0.4;
        }, { passive: true });

        window.addEventListener('scroll', function () {
            atTop = window.scrollY < 60;
        }, { passive: true });
        atTop = window.scrollY < 60;

        // click burst (only on empty space)
        document.addEventListener('click', function (e) {
            if (prefersReducedMotion) return;
            if (e.target.closest('a, button, input, nav, #mobile-nav, #theme-menu, .dash-card, #lightbox')) return;
            for (var i = 0; i < 20; i++) {
                var ang = Math.random() * Math.PI * 2;
                var v = 1.5 + Math.random() * 4;
                bursts.push({
                    x: e.clientX, y: e.clientY,
                    vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
                    r: 1 + Math.random() * 2, life: 1, tint: Math.random() < 0.5
                });
            }
        });

        // nav warp boost
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function () {
                if (!prefersReducedMotion) navBoost = 30;
            });
        });

        document.addEventListener('visibilitychange', function () {
            if (prefersReducedMotion) return;
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });

        window.__bg = {
            onThemeChange: function () {
                readTheme();
                if (prefersReducedMotion) frameOnce();
            }
        };

        readTheme();
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
