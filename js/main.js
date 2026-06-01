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