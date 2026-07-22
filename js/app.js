/* ===============================================
   PORTFOLIO APP — theme, nav, scenes, gallery
   =============================================== */
(function () {
    'use strict';

    var prefersReducedMotion = false;
    try { prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    /* ---------- THEME SWITCHER ---------- */
    var THEMES = ['sunset', 'royal', 'aurora', 'ocean'];

    function applyTheme(name) {
        if (THEMES.indexOf(name) === -1) name = 'sunset';
        document.documentElement.setAttribute('data-theme', name);
        try { localStorage.setItem('portfolio-theme-v4', name); } catch (e) {}
        document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-set-theme') === name);
        });
        if (window.__bg) window.__bg.onThemeChange();
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    }

    function initTheme() {
        var saved = null;
        try { saved = localStorage.getItem('portfolio-theme-v4'); } catch (e) {}
        applyTheme(saved || 'sunset');

        var btn = document.getElementById('theme-btn');
        var menu = document.getElementById('theme-menu');
        if (btn && menu) {
            var setMenu = function (open) {
                menu.classList.toggle('open', open);
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            };
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                setMenu(!menu.classList.contains('open'));
            });
            document.addEventListener('click', function () { setMenu(false); });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && menu.classList.contains('open')) {
                    setMenu(false);
                    btn.focus();
                }
            });
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
        try { seen = localStorage.getItem('boot-seen') === '1'; } catch (e) {}

        var finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            try { localStorage.setItem('boot-seen', '1'); } catch (e) {}
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
                var isOpen = mobileNav.classList.contains('open');
                document.body.style.overflow = isOpen ? 'hidden' : '';
                hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
            mobileNav.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    hamburger.classList.remove('open');
                    mobileNav.classList.remove('open');
                    document.body.style.overflow = '';
                    hamburger.setAttribute('aria-expanded', 'false');
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
            'Data Analyst',
            'Data Scientist',
            'Data Engineer',
            'BI Developer',
            'Machine Learning Engineer'
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
       - forward warp at the top, reverse warp at the bottom
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
        var accent = [245, 201, 106];
        var accent2 = [167, 139, 250];
        var accent3 = [244, 114, 182];

        // --- world ---
        var SPREAD = 1100, MAXZ = 1600;
        var DRIFT = 0.7, WARP = 22;
        var stars = [];
        var speed = DRIFT, navBoost = 0, warpEnergy = 0;
        var sucking = 0;                       // black-hole suction easter egg
        var roll = 0;                          // cinematic camera roll (scroll-linked)
        var fpsCount = 0, fpsVal = 60, fpsLast = Date.now();

        // --- black hole (world object, far away) ---
        var BH = { x: 430, y: -150, z: 980, size: 150, particles: [] };
        (function () {
            for (var bi = 0; bi < 70; bi++) {
                BH.particles.push({
                    ang: Math.random() * Math.PI * 2,
                    rad: 1.25 + Math.random() * 1.15,
                    sp: 0.004 + Math.random() * 0.01,
                    sz: 0.6 + Math.random() * 1.4
                });
            }
        })();
        var bhSprite = null, BH_U = 120;

        // pre-render the soft haze layers once (blurred offscreen) for a photo-real glow
        function prerenderBH() {
            var U = BH_U, S = U * 9;
            var off = document.createElement('canvas');
            off.width = S; off.height = S;
            var c = off.getContext('2d');
            if (!c) return;
            var acc = accent.join(',');
            var acc2 = accent2.join(',');
            var acc3 = accent3.join(',');
            c.translate(S / 2, S / 2);

            // Multi-temperature ambient glow: violet/blue on the approaching
            // side, warmer magenta on the receding side, gold at the core.
            var g = c.createRadialGradient(0, 0, U * 0.5, 0, 0, U * 4.4);
            g.addColorStop(0, 'rgba(255,246,220,0.58)');
            g.addColorStop(0.18, 'rgba(' + acc + ',0.32)');
            g.addColorStop(0.52, 'rgba(' + acc2 + ',0.12)');
            g.addColorStop(1, 'rgba(' + acc + ',0)');
            c.fillStyle = g;
            c.fillRect(-S / 2, -S / 2, S, S);

            var blueHalo = c.createRadialGradient(-U * 1.25, -U * 0.1, 0, -U * 1.25, -U * 0.1, U * 2.9);
            blueHalo.addColorStop(0, 'rgba(' + acc2 + ',0.24)');
            blueHalo.addColorStop(1, 'rgba(' + acc2 + ',0)');
            c.fillStyle = blueHalo;
            c.fillRect(-S / 2, -S / 2, S, S);
            var redHalo = c.createRadialGradient(U * 1.35, U * 0.08, 0, U * 1.35, U * 0.08, U * 2.8);
            redHalo.addColorStop(0, 'rgba(' + acc3 + ',0.18)');
            redHalo.addColorStop(1, 'rgba(' + acc3 + ',0)');
            c.fillStyle = redHalo;
            c.fillRect(-S / 2, -S / 2, S, S);

            function haze(rx, ry, blur, fill) {
                c.save();
                try { c.filter = 'blur(' + blur + 'px)'; } catch (e) {}
                c.fillStyle = fill;
                c.beginPath();
                c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
                c.fill();
                c.restore();
            }

            // wide diffuse outer disk haze (deep accent)
            haze(U * 3.7, U * 0.95, 34, 'rgba(' + acc2 + ',0.28)');
            // warm mid haze
            haze(U * 2.7, U * 0.55, 20, 'rgba(' + acc + ',0.42)');
            // white-hot horizontal blade, Doppler-bright on the left
            var blade = c.createLinearGradient(-U * 3.4, 0, U * 3.4, 0);
            blade.addColorStop(0, 'rgba(255,255,255,0)');
            blade.addColorStop(0.1, 'rgba(' + acc2 + ',0.16)');
            blade.addColorStop(0.2, 'rgba(246,245,255,0.98)');
            blade.addColorStop(0.48, 'rgba(255,238,205,0.7)');
            blade.addColorStop(0.82, 'rgba(' + acc3 + ',0.5)');
            blade.addColorStop(1, 'rgba(' + acc3 + ',0)');
            c.save();
            try { c.filter = 'blur(9px)'; } catch (e) {}
            c.fillStyle = blade;
            c.beginPath();
            c.ellipse(0, 0, U * 3.3, U * 0.17, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

            bhSprite = off;
        }

        // --- camera ---
        var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0;
        var hasMouse = window.matchMedia('(pointer: fine)').matches;
        var mouse = { x: -9999, y: -9999 };

        // --- effects ---
        var bursts = [];          // click particle sparks
        var trail = [];           // comet tail following the cursor
        var meteor = null, nextMeteor = 400;
        var nebulae = [];

        function readTheme() {
            var style = getComputedStyle(document.documentElement);
            var rgb = style.getPropertyValue('--accent-rgb').split(',').map(function (n) { return parseInt(n, 10); });
            var rgb2 = style.getPropertyValue('--accent-2-rgb').split(',').map(function (n) { return parseInt(n, 10); });
            var rgb3 = style.getPropertyValue('--accent-3-rgb').split(',').map(function (n) { return parseInt(n, 10); });
            if (rgb.length === 3 && !rgb.some(isNaN)) accent = rgb;
            if (rgb2.length === 3 && !rgb2.some(isNaN)) accent2 = rgb2;
            if (rgb3.length === 3 && !rgb3.some(isNaN)) accent3 = rgb3;
        }

        function spawnStar(far) {
            // realistic stellar colors: white, theme accent, blue (O/B class), warm orange (K/M class)
            var r = Math.random();
            var col = r < 0.58 ? '255,255,255'
                    : r < 0.74 ? 'a'
                    : r < 0.89 ? '176,205,255'
                    : '255,200,152';
            return {
                x: (Math.random() - 0.5) * 2 * SPREAD,
                y: (Math.random() - 0.5) * 2 * SPREAD * 0.7,
                z: far ? MAXZ * (0.85 + Math.random() * 0.15) : Math.random() * MAXZ,
                col: col,
                px: null, py: null
            };
        }

        // Reverse warp moves stars away from the camera. Re-seed stars near
        // the viewer so the field stays dense instead of draining at MAXZ.
        function spawnNearStar() {
            var star = spawnStar(false);
            star.z = 36 + Math.random() * 90;
            star.x = (Math.random() - 0.5) * (W / Math.max(FOCAL, 1)) * star.z * 1.8;
            star.y = (Math.random() - 0.5) * (H / Math.max(FOCAL, 1)) * star.z * 1.8;
            return star;
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

            // Signed energy: positive flies forward, negative rewinds.
            if (Math.abs(warpEnergy) > 0.05) warpEnergy *= 0.965; else warpEnergy = 0;
            if (navBoost > 0) navBoost *= 0.94;
            var target = DRIFT + warpEnergy + navBoost;
            speed += (target - speed) * 0.06;

            // black-hole suction: stars spiral into the singularity, then the sky is reborn
            if (sucking > 0) {
                sucking--;
                for (var si = 0; si < stars.length; si++) {
                    var ss = stars[si];
                    ss.x += (BH.x - ss.x) * 0.055;
                    ss.y += (BH.y - ss.y) * 0.055;
                    ss.z += (BH.z - ss.z) * 0.055;
                    var sdx = ss.x - BH.x, sdy = ss.y - BH.y, sdz = ss.z - BH.z;
                    if (sdx * sdx + sdy * sdy + sdz * sdz < 3600) stars[si] = spawnStar(true);
                }
            }

            // camera follows cursor (mouse left => look left)
            yaw += (tYaw - yaw) * 0.055;
            pitch += (tPitch - pitch) * 0.055;
            if (!hasMouse) { tYaw = Math.sin(t * 0.0015) * 0.07; tPitch = Math.cos(t * 0.0011) * 0.05; }

            ctx.clearRect(0, 0, W, H);

            // cinematic camera roll tied to scroll position (max ~5deg)
            var dh = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            var rollTarget = (window.scrollY / dh) * 0.09;
            roll += (rollTarget - roll) * 0.04;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(roll);
            ctx.translate(-cx, -cy);

            var ac = accent.join(',');
            var ac2 = accent2.join(',');
            var ac3 = accent3.join(',');

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
            var warping = Math.abs(speed) > 4;
            var near = []; // candidates for constellation

            // --- black hole projection (world -> screen) ---
            var bhx1 = BH.x * cosY - BH.z * sinY;
            var bhz1 = BH.x * sinY + BH.z * cosY;
            var bhy1 = BH.y * cosP - bhz1 * sinP;
            var bhz2 = BH.y * sinP + bhz1 * cosP;
            var bhVisible = bhz2 > 60;
            var bx = 0, by = 0, R = 0;
            if (bhVisible) {
                bx = cx + (bhx1 / bhz2) * FOCAL;
                by = cy + (bhy1 / bhz2) * FOCAL;
                R = (BH.size / bhz2) * FOCAL * 0.5;
                if (bx < -R * 4 || bx > W + R * 4 || by < -R * 4 || by > H + R * 4) bhVisible = false;
                BH.sx = bx; BH.sy = by; BH.r = R;
            }

            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.z -= speed;
                if (s.z < 8) { stars[i] = spawnStar(true); continue; }
                if (s.z > MAXZ) { stars[i] = spawnNearStar(); continue; }

                // rotate world around camera (yaw then pitch)
                var x1 = s.x * cosY - s.z * sinY;
                var z1 = s.x * sinY + s.z * cosY;
                var y1 = s.y * cosP - z1 * sinP;
                var z2 = s.y * sinP + z1 * cosP;
                if (z2 < 8) { s.px = null; continue; }

                var sx = cx + (x1 / z2) * FOCAL;
                var sy = cy + (y1 / z2) * FOCAL;
                if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) { s.px = null; continue; }

                // gravitational lensing near the black hole
                if (bhVisible) {
                    var lxx = sx - bx, lyy = sy - by;
                    var ld = Math.sqrt(lxx * lxx + lyy * lyy);
                    if (ld < R * 1.15) { s.px = null; continue; } // swallowed by the horizon
                    if (ld < R * 3.5) {
                        var bend = (R * R * 1.15) / (ld * ld);
                        sx += lxx * bend;
                        sy += lyy * bend;
                    }
                }

                var depth = 1 - z2 / MAXZ;
                if (depth < 0) depth = 0;
                var size = 0.3 + depth * 2.1;
                var alpha = 0.15 + depth * 0.85;
                var color = s.col === 'a' ? ac : s.col;

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

            // --- draw the black hole (photo-real: haze sprite + dynamic rings) ---
            if (bhVisible) {
                var pulse = 1 + 0.025 * Math.sin(t * 0.018);
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(-0.3);

                // Low-opacity relativistic jets. Their turbulence moves slowly,
                // independently from the much faster accretion flow.
                var jetPulse = 0.7 + 0.3 * Math.sin(t * 0.009);
                var jet = ctx.createLinearGradient(0, -R * 4.7, 0, R * 4.7);
                jet.addColorStop(0, 'rgba(' + ac2 + ',0)');
                jet.addColorStop(0.34, 'rgba(' + ac2 + ',' + (0.12 * jetPulse) + ')');
                jet.addColorStop(0.48, 'rgba(255,250,235,0.18)');
                jet.addColorStop(0.52, 'rgba(255,250,235,0.18)');
                jet.addColorStop(0.66, 'rgba(' + ac3 + ',' + (0.1 * jetPulse) + ')');
                jet.addColorStop(1, 'rgba(' + ac3 + ',0)');
                ctx.fillStyle = jet;
                ctx.beginPath();
                ctx.moveTo(-R * 0.13, -R * 0.7);
                ctx.quadraticCurveTo(-R * 0.38, -R * 2.6, -R * 0.16, -R * 4.5);
                ctx.lineTo(R * 0.16, -R * 4.5);
                ctx.quadraticCurveTo(R * 0.38, -R * 2.6, R * 0.13, -R * 0.7);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-R * 0.13, R * 0.7);
                ctx.quadraticCurveTo(-R * 0.38, R * 2.6, -R * 0.16, R * 4.5);
                ctx.lineTo(R * 0.16, R * 4.5);
                ctx.quadraticCurveTo(R * 0.38, R * 2.6, R * 0.13, R * 0.7);
                ctx.closePath();
                ctx.fill();

                // pre-rendered soft haze (blurred offscreen sprite)
                if (!bhSprite) prerenderBH();
                if (bhSprite) {
                    var sc = (R / BH_U) * pulse;
                    var half = (bhSprite.width / 2) * sc;
                    ctx.globalAlpha = 0.95;
                    ctx.drawImage(bhSprite, -half, -half, bhSprite.width * sc, bhSprite.height * sc);
                    ctx.globalAlpha = 1;
                }

                var diskGrad = function (alpha) {
                    var g = ctx.createLinearGradient(-R * 3, 0, R * 3, 0);
                    g.addColorStop(0, 'rgba(' + ac2 + ',0)');
                    g.addColorStop(0.08, 'rgba(' + ac2 + ',' + (0.38 * alpha) + ')');
                    g.addColorStop(0.18, 'rgba(247,246,255,' + (0.98 * alpha) + ')');
                    g.addColorStop(0.33, 'rgba(255,240,215,' + (0.84 * alpha) + ')');
                    g.addColorStop(0.5, 'rgba(' + ac + ',' + (0.6 * alpha) + ')');
                    g.addColorStop(0.78, 'rgba(' + ac3 + ',' + (0.34 * alpha) + ')');
                    g.addColorStop(1, 'rgba(' + ac3 + ',0)');
                    return g;
                };

                // far side of the disk, lensed ABOVE the shadow
                ctx.lineWidth = R * 0.3;
                ctx.strokeStyle = diskGrad(0.85);
                ctx.beginPath();
                ctx.ellipse(0, -R * 0.06, R * 1.4, R * 1.28, 0, Math.PI * 1.03, Math.PI * 1.97);
                ctx.stroke();

                // far side lensed BELOW the shadow (fainter mirror arc)
                ctx.lineWidth = R * 0.16;
                ctx.strokeStyle = diskGrad(0.32);
                ctx.beginPath();
                ctx.ellipse(0, R * 0.06, R * 1.32, R * 1.18, 0, Math.PI * 0.08, Math.PI * 0.92);
                ctx.stroke();

                // sharp core of the flat disk
                ctx.lineWidth = R * 0.2;
                ctx.strokeStyle = diskGrad(1);
                ctx.beginPath();
                ctx.ellipse(0, 0, R * 2.15, R * 0.45, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Fine gas lanes create depth and differential rotation without
                // another expensive blur pass.
                for (var lane = 0; lane < 5; lane++) {
                    var lanePhase = t * (0.0022 + lane * 0.00035) + lane * 1.7;
                    ctx.lineWidth = Math.max(0.55, R * (0.012 + lane * 0.003));
                    ctx.strokeStyle = lane % 2
                        ? 'rgba(' + ac2 + ',' + (0.2 + lane * 0.025) + ')'
                        : 'rgba(' + ac3 + ',' + (0.15 + lane * 0.02) + ')';
                    ctx.beginPath();
                    ctx.ellipse(Math.sin(lanePhase) * R * 0.055, 0, R * (1.35 + lane * 0.23), R * (0.24 + lane * 0.055), 0, lanePhase, lanePhase + Math.PI * 1.45);
                    ctx.stroke();
                }

                // orbiting hot matter with motion trails (relativistic beaming)
                for (var q = 0; q < BH.particles.length; q++) {
                    var pp = BH.particles[q];
                    pp.ang += pp.sp * (warping ? 2.2 : 1) * (2.2 - pp.rad * 0.7);
                    var rx = R * pp.rad * 1.8, ry = R * pp.rad * 0.42;
                    var a1 = pp.ang, a0 = pp.ang - 0.24;
                    var x1q = Math.cos(a1) * rx, y1q = Math.sin(a1) * ry;
                    var x0q = Math.cos(a0) * rx, y0q = Math.sin(a0) * ry;
                    var approaching = Math.cos(a1) < 0;
                    var dop = 0.26 + 0.74 * (0.5 - 0.5 * Math.cos(a1));
                    var hot = pp.rad < 1.6;
                    ctx.strokeStyle = hot
                        ? 'rgba(255,247,230,' + (0.8 * dop) + ')'
                        : 'rgba(' + (approaching ? ac2 : ac3) + ',' + (0.58 * dop) + ')';
                    ctx.lineWidth = pp.sz * (R / 80);
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(x0q, y0q);
                    ctx.lineTo(x1q, y1q);
                    ctx.stroke();
                }
                ctx.lineCap = 'butt';

                // Secondary lensing halo marks the distorted photon sphere.
                ctx.lineWidth = R * 0.11;
                ctx.strokeStyle = 'rgba(' + ac2 + ',0.13)';
                ctx.beginPath();
                ctx.ellipse(0, 0, R * 1.18, R * 1.12, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Photon ring: razor-thin and hotter than the surrounding disk.
                ctx.lineWidth = R * 0.045;
                ctx.strokeStyle = 'rgba(255,253,246,' + (0.95 * pulse) + ')';
                ctx.shadowColor = 'rgba(' + ac + ',0.75)';
                ctx.shadowBlur = R * 0.18;
                ctx.beginPath();
                ctx.arc(0, 0, R * 1.07, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.lineWidth = R * 0.16;
                ctx.strokeStyle = 'rgba(255,244,224,0.22)';
                ctx.beginPath();
                ctx.arc(0, 0, R * 1.07, 0, Math.PI * 2);
                ctx.stroke();

                // event horizon: pure black, crisp edge
                var horizon = ctx.createRadialGradient(-R * 0.18, -R * 0.2, R * 0.05, 0, 0, R);
                horizon.addColorStop(0, '#000000');
                horizon.addColorStop(0.82, '#010005');
                horizon.addColorStop(1, 'rgb(8,3,14)');
                ctx.fillStyle = horizon;
                ctx.beginPath();
                ctx.arc(0, 0, R, 0, Math.PI * 2);
                ctx.fill();

                // NEAR side of the disk passing IN FRONT of the shadow
                // (the bright crescent across the lower half — like the reference photo)
                ctx.lineWidth = R * 0.3;
                var front = ctx.createLinearGradient(-R * 1.2, 0, R * 1.2, 0);
                front.addColorStop(0, 'rgba(' + ac2 + ',0.64)');
                front.addColorStop(0.28, 'rgba(249,247,255,0.98)');
                front.addColorStop(0.55, 'rgba(255,246,220,0.94)');
                front.addColorStop(1, 'rgba(' + ac3 + ',0.66)');
                ctx.strokeStyle = front;
                ctx.beginPath();
                ctx.ellipse(0, R * 0.16, R * 1.0, R * 0.46, 0, Math.PI * 0.1, Math.PI * 0.9);
                ctx.stroke();
                // its soft inner reflection on the sphere
                ctx.lineWidth = R * 0.5;
                ctx.strokeStyle = 'rgba(255,244,226,0.18)';
                ctx.beginPath();
                ctx.ellipse(0, R * 0.22, R * 0.82, R * 0.4, 0, Math.PI * 0.15, Math.PI * 0.85);
                ctx.stroke();

                // thin rim light hugging the shadow's upper-left edge
                ctx.lineWidth = R * 0.04;
                ctx.strokeStyle = 'rgba(255,250,238,0.45)';
                ctx.beginPath();
                ctx.arc(0, 0, R * 1.005, Math.PI * 0.95, Math.PI * 1.75);
                ctx.stroke();

                ctx.restore();
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

            // comet tail behind the cursor
            for (var tr = trail.length - 1; tr >= 0; tr--) {
                var tp = trail[tr];
                tp.x += tp.vx; tp.y += tp.vy;
                tp.life -= 0.05;
                if (tp.life <= 0) { trail.splice(tr, 1); continue; }
                ctx.beginPath();
                ctx.arc(tp.x, tp.y, tp.r * tp.life, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + ac + ',' + (0.5 * tp.life) + ')';
                ctx.fill();
            }

            ctx.restore(); // end camera-roll transform

            // live system readout (footer)
            fpsCount++;
            var nowMs = Date.now();
            if (nowMs - fpsLast >= 1000) { fpsVal = fpsCount; fpsCount = 0; fpsLast = nowMs; }
            if (t % 30 === 0) {
                var ro = document.getElementById('sys-readout');
                if (ro) ro.textContent = fpsVal + 'fps · ' + stars.length + '★ · yaw ' + yaw.toFixed(2) + ' · v' + (speed < 10 ? speed.toFixed(1) : Math.round(speed));
            }

            raf = requestAnimationFrame(frame);
        }

        function frameOnce() {
            // static render for reduced motion: dots only, no warp
            ctx.clearRect(0, 0, W, H);

            // cinematic camera roll tied to scroll position (max ~5deg)
            var dh = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            var rollTarget = (window.scrollY / dh) * 0.09;
            roll += (rollTarget - roll) * 0.04;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(roll);
            ctx.translate(-cx, -cy);

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

            // Preserve the composition for people who request reduced motion:
            // the black hole remains visible, but every layer is fully static.
            var sbx = cx + (BH.x / BH.z) * FOCAL;
            var sby = cy + (BH.y / BH.z) * FOCAL;
            var sr = (BH.size / BH.z) * FOCAL * 0.5;
            if (sbx > -sr * 4 && sbx < W + sr * 4 && sby > -sr * 4 && sby < H + sr * 4) {
                var sac2 = accent2.join(','), sac3 = accent3.join(',');
                ctx.save();
                ctx.translate(sbx, sby);
                ctx.rotate(-0.3);
                if (!bhSprite) prerenderBH();
                if (bhSprite) {
                    var ssc = sr / BH_U;
                    var shalf = (bhSprite.width / 2) * ssc;
                    ctx.drawImage(bhSprite, -shalf, -shalf, bhSprite.width * ssc, bhSprite.height * ssc);
                }
                var sdg = ctx.createLinearGradient(-sr * 2.4, 0, sr * 2.4, 0);
                sdg.addColorStop(0, 'rgba(' + sac2 + ',0)');
                sdg.addColorStop(0.2, 'rgba(248,247,255,0.94)');
                sdg.addColorStop(0.5, 'rgba(' + ac + ',0.74)');
                sdg.addColorStop(0.82, 'rgba(' + sac3 + ',0.55)');
                sdg.addColorStop(1, 'rgba(' + sac3 + ',0)');
                ctx.lineWidth = sr * 0.26;
                ctx.strokeStyle = sdg;
                ctx.beginPath();
                ctx.ellipse(0, -sr * 0.05, sr * 1.42, sr * 1.26, 0, Math.PI * 1.03, Math.PI * 1.97);
                ctx.stroke();
                ctx.lineWidth = sr * 0.2;
                ctx.beginPath();
                ctx.ellipse(0, 0, sr * 2.12, sr * 0.44, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(0, 0, sr, 0, Math.PI * 2);
                ctx.fill();
                ctx.lineWidth = sr * 0.045;
                ctx.strokeStyle = 'rgba(255,253,246,0.96)';
                ctx.beginPath();
                ctx.arc(0, 0, sr * 1.07, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = sr * 0.29;
                ctx.strokeStyle = sdg;
                ctx.beginPath();
                ctx.ellipse(0, sr * 0.16, sr, sr * 0.46, 0, Math.PI * 0.1, Math.PI * 0.9);
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        }

        /* ---------- events ---------- */
        window.addEventListener('resize', resize);

        window.addEventListener('mousemove', function (e) {
            mouse.x = e.clientX; mouse.y = e.clientY;
            // mouse left => camera turns left (scene shifts right)
            tYaw = (e.clientX / Math.max(W, 1) - 0.5) * 0.55;
            tPitch = (e.clientY / Math.max(H, 1) - 0.5) * 0.4;
            // comet tail
            if (!prefersReducedMotion && hasMouse && trail.length < 70) {
                trail.push({
                    x: e.clientX, y: e.clientY,
                    vx: (Math.random() - 0.5) * 0.7,
                    vy: (Math.random() - 0.5) * 0.7 + 0.35,
                    r: 1 + Math.random() * 1.6,
                    life: 1
                });
            }
        }, { passive: true });

        // Boundary warp: keep scrolling past the top to fly forward, or
        // past the bottom to rewind through the star field.
        window.addEventListener('wheel', function (e) {
            if (prefersReducedMotion) return;
            var maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
            if (window.scrollY <= 1 && e.deltaY < 0) {
                warpEnergy = Math.min(warpEnergy + 7, WARP);
            } else if (window.scrollY >= maxScroll - 1 && e.deltaY > 0) {
                warpEnergy = Math.max(warpEnergy - 7, -WARP);
            }
        }, { passive: true });
        var lastTouchY = null;
        window.addEventListener('touchstart', function (e) {
            if (e.touches.length) lastTouchY = e.touches[0].clientY;
        }, { passive: true });
        window.addEventListener('touchmove', function (e) {
            if (prefersReducedMotion || !e.touches.length || lastTouchY === null) return;
            var y = e.touches[0].clientY;
            var maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
            if (window.scrollY <= 1 && y > lastTouchY + 4) {
                warpEnergy = Math.min(warpEnergy + 5, WARP);
            } else if (window.scrollY >= maxScroll - 1 && y < lastTouchY - 4) {
                warpEnergy = Math.max(warpEnergy - 5, -WARP);
            }
            lastTouchY = y;
        }, { passive: true });

        // click burst (only on empty space)
        document.addEventListener('click', function (e) {
            if (prefersReducedMotion) return;
            if (e.target.closest('a, button, input, nav, #mobile-nav, #theme-menu, .dash-card, #lightbox')) return;
            // clicked on the black hole? -> star suction easter egg
            if (BH.sx !== undefined && BH.r) {
                var bdx = e.clientX - BH.sx, bdy = e.clientY - BH.sy;
                if (bdx * bdx + bdy * bdy < (BH.r * 2.3) * (BH.r * 2.3)) {
                    sucking = 170;
                    return;
                }
            }
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
                bhSprite = null; // re-render haze in the new accent color
                if (prefersReducedMotion) frameOnce();
            },
            getMotionState: function () {
                return {
                    speed: speed,
                    warpEnergy: warpEnergy,
                    direction: speed < -4 ? 'reverse' : (speed > 4 ? 'forward' : 'drift')
                };
            }
        };

        readTheme();
        resize();
        if (!prefersReducedMotion) raf = requestAnimationFrame(frame);
    }

    /* ---------- DASHBOARD GALLERY + LIGHTBOX ---------- */
    var DASH_META = [
        { title: 'EdTech Users & Revenue Monitoring', tool: 'POWER BI', src: 'dashboard/1.webp' },
        { title: 'JadiPCPM User & Revenue Overview', tool: 'POWER BI', src: 'dashboard/2.webp' },
        { title: 'JadiPCPM User Segmentation Analysis', tool: 'POWER BI', src: 'dashboard/3.webp' },
        { title: 'Competitor Benchmark Analysis', tool: 'POWER BI', src: 'dashboard/4.webp' },
        { title: 'Customer Feedback & Sentiment Monitoring', tool: 'POWER BI', src: 'dashboard/7.webp' },
        { title: 'Platform Users & Revenue Monitoring', tool: 'POWER BI', src: 'dashboard/8.webp' },
        { title: 'Learning & Simulation Activity Analysis', tool: 'POWER BI', src: 'dashboard/9.webp' },
        { title: 'Revenue & Payment Transactions Analysis', tool: 'POWER BI', src: 'dashboard/10.webp' },
        { title: 'Report Status & Rating Monitoring', tool: 'POWER BI', src: 'dashboard/11.webp' },
        {
            title: 'Executive Summary',
            tool: 'LOOKER STUDIO',
            platform: 'looker',
            projectId: 'inteko-sales',
            projectNumber: '01',
            projectTitle: 'Inteko Test — Product Sales Analysis',
            projectSummary: 'Multi-channel sales analysis covering revenue performance, geographic distribution, product-time trends, and operational alerts.',
            liveUrl: 'https://datastudio.google.com/reporting/cd986a66-89ae-4b9b-ad3e-fba534743faf',
            src: 'dashboard/looker-inteko-01.webp',
            page: 1,
            pageTotal: 5
        },
        {
            title: 'Online vs Offline', tool: 'LOOKER STUDIO', platform: 'looker', projectId: 'inteko-sales',
            src: 'dashboard/looker-inteko-02.webp', page: 2, pageTotal: 5
        },
        {
            title: 'Geographic Analysis', tool: 'LOOKER STUDIO', platform: 'looker', projectId: 'inteko-sales',
            src: 'dashboard/looker-inteko-03.webp', page: 3, pageTotal: 5
        },
        {
            title: 'Product & Time', tool: 'LOOKER STUDIO', platform: 'looker', projectId: 'inteko-sales',
            src: 'dashboard/looker-inteko-04.webp', page: 4, pageTotal: 5
        },
        {
            title: 'Alerts & Monitoring', tool: 'LOOKER STUDIO', platform: 'looker', projectId: 'inteko-sales',
            src: 'dashboard/looker-inteko-05.webp', page: 5, pageTotal: 5
        },
        {
            title: 'Campaign Growth',
            tool: 'LOOKER STUDIO',
            platform: 'looker',
            projectId: 'sales-performance',
            projectNumber: '02',
            projectTitle: 'Sales Performance Dashboard',
            projectSummary: 'Sales performance dashboard covering campaign growth, product-level results, and customer transaction behavior.',
            liveUrl: 'https://datastudio.google.com/reporting/8be24cab-ed62-4dfb-8fc1-91bf6e0e97fc',
            src: 'dashboard/looker-sales-01.webp',
            page: 1,
            pageTotal: 3
        },
        {
            title: 'Product Performance', tool: 'LOOKER STUDIO', platform: 'looker', projectId: 'sales-performance',
            src: 'dashboard/looker-sales-02.webp', page: 2, pageTotal: 3
        },
        {
            title: 'Customer Analysis', tool: 'LOOKER STUDIO', platform: 'looker', projectId: 'sales-performance',
            src: 'dashboard/looker-sales-03.webp', page: 3, pageTotal: 3
        },
        {
            title: 'Product Task Management & Collaboration',
            tool: 'GOOGLE SHEETS APP',
            platform: 'internal',
            src: 'dashboard/internal-task-tracker.svg',
            summary: 'Assignment, revisions, deadlines, workload, comments, and task-level communication.',
            demo: true
        },
        {
            title: 'Freelance Teacher Quota Monitoring',
            tool: 'GOOGLE SHEETS APP',
            platform: 'internal',
            src: 'dashboard/internal-guru-freelance.svg',
            summary: 'Project capacity, question quotas, teacher allocation, progress, and fee monitoring.',
            demo: true
        },
        {
            title: 'Selection Momentum & Event Calendar',
            tool: 'APPS SCRIPT',
            platform: 'internal',
            src: 'dashboard/internal-momentum.svg',
            summary: 'Registration, test, announcement, status distribution, and annual momentum timeline.',
            demo: true
        },
        {
            title: 'Live Class Operations Monitoring',
            tool: 'APPS SCRIPT',
            platform: 'internal',
            src: 'dashboard/internal-liveclass.svg',
            summary: 'Schedules, mentors, PIC follow-up, class status, conflicts, analytics, and exports.',
            demo: true
        }
    ];
    var DASH_COUNT = DASH_META.length;

    function initGallery() {
        var gallery = document.getElementById('dashboard-gallery');
        var platformTabs = document.querySelectorAll('[data-dash-filter]');
        var lightbox = document.getElementById('lightbox');
        var lbImg = lightbox ? lightbox.querySelector('img') : null;
        var lbClose = lightbox ? lightbox.querySelector('.lb-close') : null;
        if (!gallery) return;

        var lastFocus = null;
        function openLb(src) {
            if (!lightbox) return;
            lastFocus = document.activeElement;
            lbImg.src = src;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (lbClose && lbClose.focus) lbClose.focus();
        }
        function closeLb() {
            if (!lightbox.classList.contains('open')) return;
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        if (lightbox) {
            lightbox.addEventListener('click', closeLb);
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
        }

        var renderedProjects = {};

        // all cards are appended at once; the browser fetches them in
        // parallel and loading="lazy" defers offscreen ones
        for (var i = 1; i <= DASH_COUNT; i++) {
            (function (idx) {
                var meta = DASH_META[idx - 1] || {};
                var src = meta.src || ('dashboard/' + idx + '.webp');
                var title = meta.title || ('Dashboard ' + idx);
                var platform = meta.platform || (meta.tool === 'LOOKER STUDIO' ? 'looker' : 'powerbi');

                if (platform === 'looker' && meta.projectId && !renderedProjects[meta.projectId]) {
                    renderedProjects[meta.projectId] = true;
                    var projectHead = document.createElement('div');
                    projectHead.className = 'dash-project-intro reveal visible';
                    projectHead.setAttribute('data-platform', platform);
                    projectHead.setAttribute('data-project', meta.projectId);

                    var projectCopy = document.createElement('div');
                    projectCopy.className = 'dash-project-copy';
                    var projectEyebrow = document.createElement('span');
                    projectEyebrow.className = 'dash-project-eyebrow';
                    projectEyebrow.textContent = 'LOOKER STUDIO PROJECT · ' + (meta.projectNumber || '');
                    var projectTitle = document.createElement('h3');
                    projectTitle.textContent = meta.projectTitle || title;
                    var projectSummary = document.createElement('p');
                    projectSummary.textContent = meta.projectSummary || '';
                    projectCopy.appendChild(projectEyebrow);
                    projectCopy.appendChild(projectTitle);
                    projectCopy.appendChild(projectSummary);
                    projectHead.appendChild(projectCopy);

                    if (meta.liveUrl) {
                        var projectLink = document.createElement('a');
                        projectLink.className = 'dash-project-link';
                        projectLink.href = meta.liveUrl;
                        projectLink.target = '_blank';
                        projectLink.rel = 'noopener noreferrer';
                        projectLink.textContent = 'OPEN LIVE DASHBOARD ↗';
                        projectHead.appendChild(projectLink);
                    }
                    gallery.appendChild(projectHead);
                }

                var card = document.createElement('div');
                card.className = 'dash-card reveal visible';
                card.setAttribute('data-platform', platform);
                if (meta.projectId) card.setAttribute('data-project', meta.projectId);
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-label', 'View "' + title + '" full size');
                var media = document.createElement('div');
                media.className = 'dash-media';
                var img = document.createElement('img');
                img.src = src;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.alt = title;
                img.addEventListener('error', function () { card.remove(); });
                media.appendChild(img);
                card.appendChild(media);
                var cap = document.createElement('div');
                cap.className = 'dash-cap';
                var capTitle = document.createElement('span');
                capTitle.className = 'dc-title';
                capTitle.textContent = title;
                var capTool = document.createElement('span');
                capTool.className = 'dc-tool';
                capTool.textContent = meta.page
                    ? 'PAGE ' + String(meta.page).padStart(2, '0') + '/' + String(meta.pageTotal).padStart(2, '0')
                    : (meta.tool || 'POWER BI') + (meta.demo ? ' · DEMO' : '') + ' — ' + (idx < 10 ? '0' + idx : idx);
                cap.appendChild(capTitle);
                cap.appendChild(capTool);
                if (meta.summary) {
                    var capSummary = document.createElement('span');
                    capSummary.className = 'dc-summary';
                    capSummary.textContent = meta.summary;
                    cap.appendChild(capSummary);
                }
                card.appendChild(cap);
                card.addEventListener('click', function () { openLb(src); });
                card.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(src); }
                });
                gallery.appendChild(card);
            })(i);
        }

        var cards = gallery.querySelectorAll('.dash-card');
        var platformItems = gallery.querySelectorAll('[data-platform]');

        function applyPlatform(platform) {
            gallery.setAttribute('data-active-platform', platform);
            platformItems.forEach(function (item) {
                var hidden = item.getAttribute('data-platform') !== platform;
                item.classList.toggle('df-hide', hidden);
                item.setAttribute('aria-hidden', hidden ? 'true' : 'false');
                if (item.classList.contains('dash-card')) item.setAttribute('tabindex', hidden ? '-1' : '0');
            });
            platformTabs.forEach(function (btn) {
                var active = btn.getAttribute('data-dash-filter') === platform;
                btn.classList.toggle('active', active);
                btn.setAttribute('aria-selected', active ? 'true' : 'false');
                btn.setAttribute('tabindex', active ? '0' : '-1');
                if (active && btn.id) gallery.setAttribute('aria-labelledby', btn.id);
            });
        }

        platformTabs.forEach(function (btn) {
            var platform = btn.getAttribute('data-dash-filter');
            var count = 0;
            if (platform === 'looker') {
                var projects = {};
                cards.forEach(function (card) {
                    if (card.getAttribute('data-platform') === platform) {
                        projects[card.getAttribute('data-project') || 'looker'] = true;
                    }
                });
                count = Object.keys(projects).length;
            } else {
                cards.forEach(function (card) {
                    if (card.getAttribute('data-platform') === platform) count++;
                });
            }
            var countEl = btn.querySelector('.dash-tab-count');
            if (countEl) countEl.textContent = '(' + count + (platform === 'looker' ? ' projects' : '') + ')';

            btn.addEventListener('click', function () { applyPlatform(platform); });
            btn.addEventListener('keydown', function (e) {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                var tabs = Array.prototype.slice.call(platformTabs);
                var current = tabs.indexOf(btn);
                var next = e.key === 'ArrowRight'
                    ? (current + 1) % tabs.length
                    : (current - 1 + tabs.length) % tabs.length;
                tabs[next].focus();
                tabs[next].click();
            });
        });

        applyPlatform('powerbi');
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


    /* ---------- LANGUAGE TOGGLE (EN/ID) ----------
       Every translatable element carries data-i18n="key" in the HTML.
       English is read from the DOM (cached on first switch); Indonesian
       lives in this dictionary. Content can be added or reordered
       without silently shifting translations. */
    var I18N_ID = {
        't.about': 'Tentang Saya',
        't.experience': 'Pengalaman',
        't.projects': 'Karya Pilihan',
        't.dashboards': 'Dashboard',
        't.skills': 'Tools & Bahasa',
        't.certifications': 'Sertifikasi',
        't.awards': 'Penghargaan & Lainnya',

        'sub.projects': 'Proyek pilihan dari GitHub saya dan diberi label berdasarkan peran. Deployment publik dilengkapi live preview; karya internal privat memakai preview sintetis yang diberi label jelas.',

        't.intel': 'Data Intelligence',
        'sub.intel': 'Satu orang, tiga peran — siklus hidup data end-to-end dari pipeline, model, hingga keputusan. Klik salah satu peran untuk melihat proyeknya.',
        'pl.da.h': 'Insight & Business Intelligence',
        'pl.da.1': '<strong>8 dashboard strategis</strong> di Bank Indonesia — kepuasan stakeholder 85%, masukan langsung untuk keputusan level C.',
        'pl.da.2': 'Waktu pelaporan terpangkas <strong>40%</strong> melalui otomasi Power BI di 5 kantor cabang regional.',
        'pl.ds.h': 'Machine Learning & Pemodelan',
        'pl.ds.1': '<strong>Best Paper Award, ICoDSA 2025</strong> — klasifikasi saham XGBoost/SVM, publikasi terindeks Scopus.',
        'pl.ds.2': 'Model peramalan ketahanan pangan dengan <strong>R² 85,1%</strong> menggunakan validasi silang time-series.',
        'pl.de.h': 'Pipeline & Otomasi',
        'pl.de.1': 'Manajemen data <strong>MySQL end-to-end</strong> di Cerebrum — ekstraksi, transformasi, dan integritas data.',
        'pl.de.2': 'Otomasi <strong>10K+ records</strong> dengan Gemini API untuk 200+ pengguna — waktu proses turun 75%.',
        'pl.link': 'lihat proyeknya →',
        'sub.dashboards': 'Jelajahi karya Power BI dan Looker Studio asli yang dikelompokkan berdasarkan platform dan proyek. Preview aplikasi internal tetap memakai data sintetis yang aman.',

        'hero.desc': 'Satu orang untuk seluruh siklus hidup data — membangun pipeline, memodelkan prediksi, dan menghadirkan dashboard tempat keputusan dibuat.',

        'about.lede': 'Saya mengubah <em>data mentah</em> menjadi keputusan — lewat analisis, model, dan dashboard yang benar-benar dipakai orang.',
        'about.p1': 'Lulusan Data Science dari <strong>Telkom University</strong> dengan pengalaman akademik dan organisasi yang kuat, termasuk <strong>publikasi jurnal terindeks Scopus</strong>. Terampil dalam analisis data, visualisasi, pemodelan statistik, dan manajemen basis data.',
        'about.p2': 'Berpengalaman sebagai Data Visualization Intern di <strong>Bank Indonesia</strong>. Bersemangat mengembangkan karier di bidang analisis data dan big data analytics dengan menerapkan kemampuan teknis dan analitis di lingkungan kerja yang dinamis.',

        'stat.gpa': 'IPK',
        'stat.certs': 'Sertifikat',
        'stat.projects': 'Proyek',
        'stat.years': 'Tahun Pengalaman',

        'xp.cereb.1': 'Merombak arsitektur pengambilan data forecasting dari transfer jutaan baris mentah di sisi aplikasi menjadi agregat SQL harian di data warehouse MySQL — setiap penarikan metrik kini hanya sekitar tiga record per hari.',
        'xp.cereb.2': 'Membangun layanan forecasting multivariat berbasis Prophet dengan FastAPI: rolling-origin cross-validation, deteksi fase event, skenario what-if, dan caching persisten.',
        'xp.cereb.3': 'Menyiapkan, mentransformasi, dan memodelkan data MySQL untuk dashboard KPI Power BI yang mendukung pemantauan operasional dan pelaporan strategis.',
        'xp.garda.1': 'Mengembangkan solusi berbasis AI menggunakan Google Gemini API dengan akurasi 92% dalam pemrosesan teks.',
        'xp.garda.2': 'Mengotomasi konversi 10K+ soal ujian untuk 200+ pengguna, memangkas waktu proses hingga 75%.',
        'xp.ta.1': 'Meningkatkan performa mahasiswa 30% melalui workshop Python dan SQL; mengevaluasi 500+ tugas.',
        'xp.bi.1': 'Menghasilkan 8 dashboard strategis dengan kepuasan stakeholder 85%, memengaruhi keputusan level C secara langsung.',
        'xp.bi.2': 'Memangkas waktu pelaporan 40% melalui otomasi Power BI di 5 kantor cabang regional.',

        'proj.1': 'Bot keuangan pribadi yang mencatat transaksi ke Google Sheets dengan analitik AI: input bahasa natural, kategorisasi otomatis, pelacakan saldo real-time, dan laporan berkala dengan rekomendasi anggaran.',
        'proj.2': 'Bot penjadwalan pintar: pembuatan acara dengan bahasa natural, analisis dan optimasi jadwal oleh AI, pengingat otomatis, dan dukungan zona waktu.',
        'proj.4': 'Laporan interaktif tiga halaman yang mengubah data transaksi kompleks menjadi insight strategis: tren kampanye, analisis produk, dan profil pelanggan 360°.',
        'proj.5': 'Aplikasi dual-mode yang mengotomasi ekstraksi soal dari .txt, .pdf, dan .docx menjadi Excel terstruktur — parsing AI plus tiga mode manual untuk berbagai format ujian.',
        'proj.6': 'Dashboard BI untuk perusahaan tambang batu bara di Jambi: integrasi data produksi dan konsumsi BBM real-time, menggantikan pelaporan manual yang terfragmentasi.',
        'proj.7': "Model ML untuk mengklasifikasi apakah harga penutupan saham akan melewati ambang batas — seleksi fitur Cramér's V, 1.023 kombinasi fitur. Dipublikasikan & meraih Best Paper di ICoDSA 2025.",
        'proj.ipo': 'Terminal riset IPO interaktif untuk membandingkan enam emiten Indonesia berdasarkan valuasi, kebutuhan modal, skenario ARA, kalender listing, dan scorecard investor.',
        'proj.maganghub': 'Studi kasus end-to-end yang mencakup ETL multi-database, data warehouse dimensional, empat dashboard Power BI produksi, dan rekam jejak 120 tugas magang.',
        'proj.cvats': 'Pembuat CV yang mengutamakan privasi dengan render PDF langsung, tiga template ramah ATS, pencocokan deskripsi pekerjaan, autosave lokal, serta ekspor PDF dan LaTeX.',
        'proj.pddikti': 'Dashboard geospasial offline yang memetakan 5.433 perguruan tinggi di 38 provinsi dan 514 kabupaten/kota, didukung pipeline data terverifikasi dengan 34 pemeriksaan kualitas independen.',
        'proj.poverty-indonesia': 'Platform intelijen kemiskinan end-to-end yang mengharmonisasi data BPS 2015–2025, memvalidasi forecast provinsi 2026, serta menyajikan pola spasial, analisis skenario, dan perbandingan provinsi dalam peta interaktif.',
        'proj.sppggeo': 'Portal intelijen geospasial untuk menjelajahi persebaran SPPG, cakupan wilayah, proxy demand gap, dan kesiapan data di Indonesia melalui peta nasional yang dapat difilter.',
        'proj.qc-agent': 'Sistem otomasi browser internal yang mengambil kunci jawaban, menjalankan quality control prapublish, memvalidasi skor sempurna, menyimpan checkpoint tiap paket, dan menghasilkan laporan Excel yang dapat diaudit.',
        'proj.financial-planner': 'Pusat kendali keuangan pribadi untuk anggaran, alokasi, tujuan finansial, dana darurat, pelunasan utang, dan simulasi FIRE dengan skor kesehatan finansial instan.',
        'proj.snpmb-analyst': 'Dashboard interaktif SNBT dan SNBP dengan data daya tampung serta peminat 2021–2026, eksplorasi PTN dan program studi, simulasi peluang, rekomendasi, dan wishlist pribadi.',
        'proj.ypc-emas': 'Workspace analisis teknikal untuk instrumen emas dan perak dengan sinyal multi-strategi, RSI, MACD, Bollinger Bands, moving average, analisis performa, dan modul belajar.',
        'proj.ypc-saham': 'Aplikasi analisis saham Indonesia dengan pencarian emiten, indikator teknikal, strategi trading yang dapat diatur, ringkasan sinyal dan return, grafik interaktif, rekomendasi, serta modul belajar investor.',
        'proj.food-security': 'Dashboard berbasis ML untuk analisis ketahanan pangan Indonesia (R² 85,1%) dengan validasi silang time-series, validasi data otomatis, peramalan, feature importance, dan penilaian risiko provinsi.',
        'proj.cerebrum-forecasting': 'Platform forecasting multivariat berorientasi produksi yang memadukan Prophet, rolling-origin cross-validation, deteksi fase event, simulasi what-if, dan agregasi harian SQL dari data warehouse MySQL melalui FastAPI.',
        'action.live': 'Lihat demo <span aria-hidden="true">↗</span>',
        'note.cold': '≈30 dtk cold start (hosting gratis)',
        'note.sites-auth': 'ChatGPT Sites · mungkin memerlukan login',
        'preview.synthetic': 'PRIVAT · PREVIEW AMAN',
        'repo.private': 'Repository privat',
        'note.synthetic': 'Data sintetis · tanpa data perusahaan',

        'cs.toggle': 'Studi kasus — masalah → pendekatan → dampak',
        'cs.poverty.1': '<strong>Masalah.</strong> Data kemiskinan provinsi melewati perubahan cakupan administrasi dan jendela pengukuran, sehingga peringkat langsung dapat menyamarkan perbedaan semesta data serta pengelompokan geografis.',
        'cs.poverty.2': '<strong>Pendekatan.</strong> Mengharmonisasi data BPS menjadi semesta analisis 38/34/32 provinsi, memvalidasi ensemble 50% naive lag-1 dan 50% Ridge melalui walk-forward testing, mengukur autokorelasi spasial, lalu mengemas hasilnya dalam portal Next.js/Vinext.',
        'cs.poverty.3': '<strong>Dampak.</strong> Tren nasional, profil provinsi, empat mode spasial, diagnostik model, dan forecast eksperimental 2026 kini dapat diperiksa dalam satu antarmuka tanpa menampilkan proyeksi sebagai angka resmi BPS.',
        'cs.pddikti.1': '<strong>Masalah.</strong> Data pendidikan tinggi Indonesia tersebar dan penamaan wilayahnya tidak konsisten, sehingga perguruan tinggi sulit dibandingkan antar provinsi dan kota.',
        'cs.pddikti.2': '<strong>Pendekatan.</strong> Membangun pipeline Node.js yang memetakan 5.433 perguruan tinggi ke batas wilayah resmi Kemendagri, dijaga 34 pemeriksaan kualitas data independen, dirilis sebagai dashboard Leaflet siap offline.',
        'cs.pddikti.3': '<strong>Dampak.</strong> Akreditasi, median biaya, dan cakupan 38 provinsi serta 514 kabupaten/kota kini bisa dijelajahi dalam satu peta — setiap angka dapat ditelusuri ke pipeline yang tervalidasi.',
        'cs.sppg.1': '<strong>Masalah.</strong> Data SPPG nasional sulit dibandingkan ketika cakupan geografis, kualitas alamat, dan presisi lokasi berbeda-beda antarwilayah.',
        'cs.sppg.2': '<strong>Pendekatan.</strong> Membangun portal Leaflet responsif dengan marker cluster, filter yang dapat dibagikan, skor kesiapan data, perbandingan provinsi, metode demand gap, serta lapisan admin Supabase opsional yang dilindungi RLS dan audit log.',
        'cs.sppg.3': '<strong>Dampak.</strong> Persebaran, konsentrasi cakupan, masalah data, dan konteks operasional dapat diperiksa dalam satu antarmuka publik dengan fallback snapshot statis untuk akses yang andal.',
        'cs.qc.1': '<strong>Masalah.</strong> Pengambilan kunci dan QC prapublish terpisah antara script browser serta file manual, sehingga rawan kunci basi dan ketidaksesuaian skema.',
        'cs.qc.2': '<strong>Pendekatan.</strong> Menyatukan dua agent browser dalam satu worker Playwright, memindahkan kunci melalui SQLite tanpa file perantara, serta menambahkan checkpoint per paket, resume, monitoring lokal, dan pelaporan yang reproducible.',
        'cs.qc.3': '<strong>Dampak.</strong> Alur kini bergerak langsung dari pengambilan kunci ke QC otomatis dan validasi skor sempurna, dengan verifikasi live pada beberapa struktur paket.',
        'cs.maganghub.1': '<strong>Masalah.</strong> Pelaporan kinerja regional disusun manual dari banyak sistem sumber — lambat, tidak konsisten, dan sulit diaudit.',
        'cs.maganghub.2': '<strong>Pendekatan.</strong> Merancang ETL multi-database ke data warehouse berskema star dan membangun ulang pelaporan menjadi empat dashboard Power BI produksi, terdokumentasi dalam 120 tugas magang.',
        'cs.maganghub.3': '<strong>Dampak.</strong> Waktu pelaporan turun sekitar 40% di lima kantor cabang, dan delapan dashboard strategis mencapai kepuasan stakeholder 85% dengan masukan langsung ke keputusan level C.',
        'cs.food.1': '<strong>Masalah.</strong> Perencanaan ketahanan pangan provinsi butuh sinyal risiko ke depan, tetapi indikator dasarnya bising, tidak lengkap, dan jarang tervalidasi.',
        'cs.food.2': '<strong>Pendekatan.</strong> Melatih peramal Random Forest dengan validasi silang time-series dan validasi data otomatis, lalu menyajikan peramalan, feature importance, dan skor risiko provinsi di Streamlit.',
        'cs.food.3': '<strong>Dampak.</strong> Mencapai R² 85,1% di 34 provinsi — perencana mendapat pandangan dini yang bisa diperiksa, bukan spreadsheet statis.',

        'cert.verify': 'Verifikasi kredensial <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>',
        'cert.1': 'Analitik data, Python, SQL, visualisasi data, analisis data statistik.',
        'cert.2': 'Dasar-dasar data science: pemrosesan data, statistik dasar, dan Python untuk analisis data.',
        'cert.3': 'Data wrangling, exploratory data analysis, dan pemrograman Python dalam konteks data science.',
        'cert.4': 'Looker Studio untuk visualisasi data dan pelaporan business intelligence.',
        'cert.5': 'Analisis data deret waktu menggunakan Python dan teknik peramalan statistik.',
        'cert.6': 'Administrasi sistem, dasar jaringan, dan layanan infrastruktur TI.',

        'awd.1.link': 'Terbit di IEEE Xplore — DOI <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>',
        'awd.1.1': 'Diberikan untuk paper "Classification of Stocks with Potential to Reach Minimum Price Levels on the Indonesian Stock Exchange using SVM and XGBoost".',
        'awd.1.2': 'Berkolaborasi dengan pembimbing akademik Bapak Deni Saepudin dari Telkom University.',
        'awd.1.3': 'Menyoroti pemodelan prediktif dalam klasifikasi saham untuk edukasi dan riset.',
        'awd.2.1': 'Salah satu dari 3 tim proyek akhir terbaik di antara peserta Batch 22.',
        'awd.2.2': 'Program intensif 2 minggu mencakup SQL, Python, statistik, dan visualisasi data.',
        'pat.1': 'Aplikasi command-line Python yang menyimulasikan Suit Gunting-Batu-Kertas dengan backend yang dapat dikonfigurasi sehingga admin dapat mengatur probabilitas menang pengguna.',
        'pat.2': 'Alat edukasi yang menunjukkan bagaimana sistem judi online dapat dimanipulasi, meningkatkan kesadaran pelajar muda.',
        'org.1': '<strong>Chairman of BPM HimaDS</strong> (Feb 2024 — Mar 2025): pemimpin utama Badan Perwakilan Mahasiswa, mengarahkan strategi dan mengawasi seluruh program kerja himpunan.',
        'org.2': '<strong>Coordinator, Student Resource Development Division</strong> (Jul 2023 — Feb 2024): mengawasi program pengembangan kemampuan teknis dan soft skill mahasiswa.',

        'contact.line1': 'Mari ubah data',
        'contact.line2': 'jadi <span class="accent">keputusan.</span>',
        'contact.sub': 'Baik untuk peluang kerja, kolaborasi, atau sekadar terhubung — saya senang mendengar darimu.',
        'contact.resume': 'Unduh Resume <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>',

        'softcopy.title': 'Bawa portofolio lengkap ini bersamamu.',
        'softcopy.desc': 'Ringkasan ramah rekruter mengenai pengalaman, dampak terukur, produk yang sudah di-deploy, dashboard, dan kemampuan teknis saya.',

        'cat.da': '— insight & BI',
        'cat.ds': '— ML & pemodelan',
        'cat.de': '— pipeline & otomasi'
    };

    var currentLang = 'en';

    function setLang(lang) {
        currentLang = lang === 'id' ? 'id' : 'en';
        document.documentElement.setAttribute('lang', currentLang);
        try { localStorage.setItem('portfolio-lang', currentLang); } catch (e) {}

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var idHtml = I18N_ID[el.getAttribute('data-i18n')];
            if (idHtml === undefined) return;
            if (el.dataset.orig === undefined) el.dataset.orig = el.innerHTML;
            el.innerHTML = (currentLang === 'id') ? idHtml : el.dataset.orig;
        });

        var btn = document.getElementById('lang-btn');
        if (btn) {
            btn.textContent = currentLang === 'en' ? 'ID' : 'EN';
            btn.setAttribute('aria-label', currentLang === 'en' ? 'Switch language to Indonesian' : 'Ganti bahasa ke Inggris');
        }
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

    /* ---------- MAGNETIC INTERACTIVE ELEMENTS ---------- */
    function initMagnetic() {
        if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
        var els = document.querySelectorAll('.u-link, .contact-mail, .softcopy-btn, #theme-btn, #lang-btn, #to-top');
        els.forEach(function (el) {
            el.style.transition = 'transform 0.25s cubic-bezier(0.3, 1.4, 0.6, 1)';
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var dx = e.clientX - (r.left + r.width / 2);
                var dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = 'translate(' + (dx * 0.25) + 'px,' + (dy * 0.25) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });
    }

    /* ---------- PROJECT ROLE FILTER ----------
       Rows carry data-roles="da|ds|de". Filter buttons live above the list;
       hero chips and pillar cards carry data-filter-link to jump + filter. */
    function initProjectFilter() {
        var rows = document.querySelectorAll('#projects .project-card, #projects .p-row');
        var btns = document.querySelectorAll('.pf-btn');
        if (!rows.length || !btns.length) return;

        var counts = { all: rows.length, da: 0, ds: 0, de: 0 };
        rows.forEach(function (r) {
            (r.getAttribute('data-roles') || '').split(/\s+/).forEach(function (k) {
                if (counts[k] !== undefined) counts[k]++;
            });
        });
        btns.forEach(function (b) {
            var n = b.querySelector('.pf-n');
            var c = counts[b.getAttribute('data-filter')];
            if (n && c !== undefined) n.textContent = '(' + c + ')';
        });

        function apply(f) {
            btns.forEach(function (b) {
                var on = b.getAttribute('data-filter') === f;
                b.classList.toggle('active', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            rows.forEach(function (r) {
                var rr = r.getAttribute('data-roles') || '';
                r.classList.toggle('pf-hide', f !== 'all' && rr.indexOf(f) === -1);
            });
        }

        btns.forEach(function (b) {
            b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
        });

        document.querySelectorAll('[data-filter-link]').forEach(function (el) {
            el.addEventListener('click', function () {
                apply(el.getAttribute('data-filter-link'));
                var s = document.getElementById('projects');
                if (s) s.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });
    }

    /* ---------- SIDE DOT NAVIGATION ---------- */
    function initDotNav() {
        var ids = ['intelligence', 'about', 'experience', 'projects', 'powerbi', 'skills', 'certifications', 'awards', 'contact'];
        var labels = {
            intelligence: 'Roles', about: 'About', experience: 'Experience', projects: 'Projects', powerbi: 'Dashboards',
            skills: 'Skills', certifications: 'Certifications', awards: 'Achievements', contact: 'Contact'
        };
        var nav = document.createElement('aside');
        nav.id = 'dot-nav';
        nav.setAttribute('aria-label', 'Section navigation');
        ids.forEach(function (id) {
            var s = document.getElementById(id);
            if (!s) return;
            var b = document.createElement('button');
            b.className = 'dot';
            b.setAttribute('data-label', labels[id]);
            b.setAttribute('aria-label', 'Go to ' + labels[id]);
            b.__target = id;
            b.addEventListener('click', function () {
                s.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
            nav.appendChild(b);
        });
        document.body.appendChild(nav);

        var dots = nav.querySelectorAll('.dot');
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                dots.forEach(function (d) {
                    d.classList.toggle('active', d.__target === en.target.id);
                });
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        ids.forEach(function (id) {
            var s = document.getElementById(id);
            if (s) obs.observe(s);
        });
    }

    /* ---------- BOOT (each module is isolated: one failure never blocks the rest) ---------- */
    function boot() {
        [initLoader, initTheme, initBackground, initNav, initScrollUx,
         initReveal, initTyping, initGallery, initCursor, initYear,
         initTilt, initCounters, initClock, initLang, initMagnetic, initDotNav,
         initProjectFilter
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
