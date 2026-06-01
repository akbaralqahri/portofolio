// ===============================================
// MAIN APPLICATION
// ===============================================

class PortfolioApp {
    constructor() {
        this.initialized = false;
        this.components = {};
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }
    
    start() {
        console.log('🚀 Portfolio App Starting...');
        
        try {
            // Cache DOM elements first
            DOM.cache();
            
            // Initialize utility classes
            this.initUtilities();
            
            // Initialize core components
            this.initComponents();
            
            // Initialize effects and animations
            this.initEffects();
            
            // Setup event listeners
            this.setupGlobalEvents();
            
            this.initialized = true;
            console.log('✅ Portfolio App Initialized Successfully');
            
        } catch (error) {
            console.error('❌ Error initializing portfolio app:', error);
        }
    }
    
    initUtilities() {
        // Performance monitoring
        this.components.performanceMonitor = new PerformanceMonitor();
        
        // Error handling
        this.components.errorHandler = new ErrorHandler();
        
        // Theme management
        this.components.themeManager = new ThemeManager();
        
        // Accessibility
        this.components.accessibilityManager = new AccessibilityManager();
        
        // Lazy loading
        this.components.lazyLoader = new LazyLoader();
    }
    
    initComponents() {
        // Navigation
        this.components.navigation = new Navigation();
        
        // Custom cursor
        if (!UTILS.isMobile() && CONFIG.performance.enableCursor) {
            this.components.customCursor = new CustomCursor();
        }
        
        // Particle system (Three.js)
        if (CONFIG.performance.enableParticles) {
            this.components.particleSystem = new ParticleSystem();
        }
        
        // Scroll to top
        if (typeof ScrollToTop !== 'undefined') {
            this.components.scrollToTop = new ScrollToTop();
        }
    }
    
    initEffects() {
        // Animation controller (GSAP)
        if (typeof AnimationController !== 'undefined') {
            this.components.animationController = new AnimationController();
        }
        
        // Initialize typing effects immediately after DOM is cached
        if (typeof initTypingEffects === 'function') {
            initTypingEffects();
        }
    }
    
    setupGlobalEvents() {
        // Window resize handler
        window.addEventListener('resize', UTILS.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Window focus/blur for performance optimization
        window.addEventListener('focus', () => this.handleFocus());
        window.addEventListener('blur', () => this.handleBlur());
        
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
        
        // Before unload cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Rocket Scroll Effect (Warp Speed)
        window.addEventListener('wheel', (e) => {
            if (window.scrollY <= 0 && e.deltaY < 0) {
                if (this.components.particleSystem) {
                    this.components.particleSystem.triggerWarp(25); // Trigger strong forward velocity
                }
            }
        });
    }
    
    handleResize() {
        // Update mobile detection
        const wasMobile = UTILS.isMobile();
        
        // Reinitialize cursor if needed
        if (wasMobile !== UTILS.isMobile()) {
            if (this.components.customCursor) {
                this.components.customCursor.destroy();
                delete this.components.customCursor;
            }
            
            if (!UTILS.isMobile() && CONFIG.performance.enableCursor) {
                this.components.customCursor = new CustomCursor();
            }
        }
        
        // Update canvas size for particle system
        if (this.components.particleSystem) {
            this.components.particleSystem.setupCanvas();
            this.components.particleSystem.createParticles();
        }
    }
    
    handleFocus() {
        // Resume animations when window is focused
        if (this.components.particleSystem) {
            this.components.particleSystem.start();
        }
        
        if (typingEffect && !typingEffect.isRunning) {
            typingEffect.start();
        }
    }
    
    handleBlur() {
        // Pause heavy animations when window loses focus for performance
        if (this.components.particleSystem) {
            this.components.particleSystem.stop();
        }
    }
    
    handlePageHidden() {
        // Page is hidden, pause all animations
        this.pauseAnimations();
    }
    
    handlePageVisible() {
        // Page is visible again, resume animations
        this.resumeAnimations();
    }
    
    pauseAnimations() {
        if (this.components.particleSystem) {
            this.components.particleSystem.stop();
        }
        
        if (typingEffect) {
            typingEffect.stop();
        }
    }
    
    resumeAnimations() {
        if (this.components.particleSystem) {
            this.components.particleSystem.start();
        }
        
        if (typingEffect) {
            typingEffect.start();
        }
    }
    
    // Public API methods
    getComponent(name) {
        return this.components[name];
    }
    
    getPerformanceMetrics() {
        return this.components.performanceMonitor ? 
            this.components.performanceMonitor.getMetrics() : null;
    }
    
    toggleTheme() {
        if (this.components.themeManager) {
            this.components.themeManager.toggleTheme();
        }
    }
    
    // Cleanup method
    cleanup() {
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components = {};
        this.initialized = false;
    }
    
    // Debug methods (for development)
    debug() {
        console.log('📊 Portfolio App Debug Info:');
        console.log('✅ Initialized:', this.initialized);
        console.log('🔧 Components:', Object.keys(this.components));
        console.log('⚡ Performance:', this.getPerformanceMetrics());
        console.log('⚙️ Config:', CONFIG);
        console.log('🎯 DOM Elements:', Object.keys(DOM.elements));
        console.log('📱 Is Mobile:', UTILS.isMobile());
        console.log('🖱️ Touch Device:', UTILS.isTouchDevice());
    }
}

// Initialize the application
const portfolioApp = new PortfolioApp();

// Make app available globally for debugging (only in development)
if (typeof window !== 'undefined') {
    window.portfolioApp = portfolioApp;
    
    // Add debug command
    window.debugPortfolio = () => portfolioApp.debug();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}


// Global World Shatter for Big Bang
window.triggerWorldShatter = function() {
    if (document.body.classList.contains('shattered')) return;
    document.body.classList.add('shattered');
    
    document.body.style.overflow = 'hidden';
    
    // Exclude nav from the general shatter list
    const elementsToShatter = document.querySelectorAll('section > div, section > h2, .hero-content > *, footer');
    
    const appContainer = document.body;
    appContainer.animate([
        { transform: 'translate(10px, 10px) rotate(1deg)' },
        { transform: 'translate(-10px, -10px) rotate(-1deg)' },
        { transform: 'translate(10px, -10px) rotate(1deg)' },
        { transform: 'translate(-10px, 10px) rotate(-1deg)' },
        { transform: 'translate(0px, 0px) rotate(0deg)' }
    ], { duration: 500, iterations: 2 });
    
    if (typeof gsap !== 'undefined') {
        // 1. General Elements (No Stagger)
        gsap.to(elementsToShatter, {
            y: () => window.innerHeight + 500,
            rotation: () => (Math.random() - 0.5) * 360,
            scale: () => 0.5 + Math.random(),
            duration: 2.5,
            ease: "power4.in",
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(elementsToShatter, {
                        y: 0,
                        rotation: 0,
                        scale: 1,
                        duration: 2.5,
                        ease: "elastic.out(1, 0.4)",
                        onComplete: () => {
                            document.body.classList.remove('shattered');
                            document.body.style.overflow = '';
                            gsap.set(elementsToShatter, { clearProps: "all" });
                        }
                    });
                }, 500);
            }
        });

        // 2. Navbar Split Logic
        const nav = document.querySelector('nav');
        if (nav) {
            const navLeft = nav.cloneNode(true);
            const navRight = nav.cloneNode(true);
            
            navLeft.id = 'nav-left-clone';
            navRight.id = 'nav-right-clone';
            
            // Clip them exactly in half
            navLeft.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
            navRight.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
            
            // Ensure they sit perfectly on top
            navLeft.style.position = 'fixed';
            navRight.style.position = 'fixed';
            navLeft.style.zIndex = '9999';
            navRight.style.zIndex = '9999';
            navLeft.style.top = nav.getBoundingClientRect().top + 'px';
            navRight.style.top = nav.getBoundingClientRect().top + 'px';
            navLeft.style.width = '100%';
            navRight.style.width = '100%';
            
            document.body.appendChild(navLeft);
            document.body.appendChild(navRight);
            
            // Hide original
            nav.style.visibility = 'hidden';
            
            // Throw Left Half
            gsap.to(navLeft, {
                x: -window.innerWidth / 2,
                y: window.innerHeight + 500,
                rotation: -60,
                duration: 2.5,
                ease: "power4.in"
            });
            
            // Throw Right Half
            gsap.to(navRight, {
                x: window.innerWidth / 2,
                y: window.innerHeight + 500,
                rotation: 60,
                duration: 2.5,
                ease: "power4.in",
                onComplete: () => {
                    setTimeout(() => {
                        // Recover Halves
                        gsap.to([navLeft, navRight], {
                            x: 0,
                            y: 0,
                            rotation: 0,
                            duration: 2.5,
                            ease: "elastic.out(1, 0.4)",
                            onComplete: () => {
                                nav.style.visibility = 'visible';
                                navLeft.remove();
                                navRight.remove();
                            }
                        });
                    }, 500);
                }
            });
        }
    }
};

// Magnetic Glitch + Forcefield Mechanic
window.isNameHovered = false;

document.addEventListener('DOMContentLoaded', () => {
    // Hint Terminal Entrance Animation (Tech/CRT Style)
    const terminalCard = document.getElementById('hint-terminal');
    if (terminalCard && typeof gsap !== 'undefined') {
        // Hide initially
        gsap.set(terminalCard, { scaleY: 0.01, scaleX: 0.01, opacity: 0, filter: "brightness(2) contrast(2)" });
        
        document.addEventListener('terminalBootFinished', () => {
            const tl = gsap.timeline({ delay: 0.3 });
            
            // 1. A tiny dot appears
            tl.to(terminalCard, { opacity: 1, duration: 0.1 })
            // 2. Expands horizontally like a laser line
              .to(terminalCard, { scaleX: 1, duration: 0.2, ease: "power4.in" })
            // 3. Expands vertically to reveal terminal
              .to(terminalCard, { scaleY: 1, duration: 0.3, ease: "power2.out" })
            // 4. Glitch / Flicker effect
              .to(terminalCard, { opacity: 0.3, duration: 0.05, repeat: 3, yoyo: true })
            // 5. Settle into normal state
              .to(terminalCard, { filter: "brightness(1) contrast(1)", duration: 0.3 });
        });
    }

    const nameEl = document.getElementById('clickable-name');
    if (nameEl) {
        let interval = null;
        
        nameEl.addEventListener('mousemove', (e) => {
            const rect = nameEl.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            nameEl.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        nameEl.addEventListener('mouseenter', () => {
            window.isNameHovered = true;
            nameEl.style.color = '#D4AF37'; // Gold
            nameEl.style.textShadow = '0 0 20px rgba(212,175,55,0.8)';
            const originalText = 'Muhammad Ali Akbar Al-Qahri';
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=";
            let iterations = 0;
            
            clearInterval(interval);
            interval = setInterval(() => {
                nameEl.innerText = originalText.split('').map((letter, index) => {
                    if(index < iterations || letter === ' ') return originalText[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                }).join('');
                if(iterations >= originalText.length) clearInterval(interval);
                iterations += 1/3;
            }, 30);
        });
        
        nameEl.addEventListener('mouseleave', () => {
            window.isNameHovered = false;
            nameEl.style.transform = 'translate(0, 0)';
            nameEl.style.color = '';
            nameEl.style.textShadow = '';
            clearInterval(interval);
            nameEl.innerText = 'Muhammad Ali Akbar Al-Qahri';
        });
    }
});
