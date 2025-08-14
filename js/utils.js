// ===============================================
// UTILITIES
// ===============================================

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            fps: 0
        };
        
        this.init();
    }
    
    init() {
        this.measureLoadTime();
        this.measureFPS();
    }
    
    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`Portfolio loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    }
    
    measureFPS() {
        let frames = 0;
        let lastTime = performance.now();
        
        const countFPS = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(countFPS);
        };
        
        requestAnimationFrame(countFPS);
    }
    
    getMetrics() {
        return this.metrics;
    }
}

// Error handler
class ErrorHandler {
    constructor() {
        this.init();
    }
    
    init() {
        window.addEventListener('error', (e) => {
            this.logError('JavaScript Error', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.logError('Unhandled Promise Rejection', e.reason);
        });
    }
    
    logError(type, error) {
        console.error(`${type}:`, error);
        
        // In production, you might want to send errors to a logging service
        if (process?.env?.NODE_ENV === 'production') {
            // Send to logging service
        }
    }
}

// Local storage utilities
class StorageUtils {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
            return false;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
            return false;
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    }
}

// Theme utilities
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.init();
    }
    
    init() {
        // Load saved theme
        const savedTheme = StorageUtils.get('portfolio-theme', 'dark');
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        
        StorageUtils.set('portfolio-theme', theme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Accessibility utilities
class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.handleReducedMotion();
        this.improveKeyboardNavigation();
    }
    
    handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable animations for users who prefer reduced motion
            document.body.classList.add('reduce-motion');
            CONFIG.performance.enableAnimations = false;
            CONFIG.performance.enableParticles = false;
        }
        
        prefersReducedMotion.addEventListener('change', () => {
            if (prefersReducedMotion.matches) {
                document.body.classList.add('reduce-motion');
                CONFIG.performance.enableAnimations = false;
            } else {
                document.body.classList.remove('reduce-motion');
                CONFIG.performance.enableAnimations = true;
            }
        });
    }
    
    improveKeyboardNavigation() {
        // Add focus styles for keyboard navigation
        const style = document.createElement('style');
        style.textContent = `
            .btn:focus,
            .nav-links a:focus,
            .contact-link:focus,
            .skill-tag:focus {
                outline: 2px solid var(--accent-color);
                outline-offset: 2px;
            }
            
            .reduce-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Image lazy loading utility
class LazyLoader {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            });
            
            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }
    
    observeImages() {
        const lazyImages = document.querySelectorAll('[data-src]');
        lazyImages.forEach(img => this.observer.observe(img));
    }
    
    loadImage(img) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
    }
    
    loadAllImages() {
        const lazyImages = document.querySelectorAll('[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
    
    static validateRequired(value) {
        return value && value.trim().length > 0;
    }
    
    static validateLength(value, min, max) {
        const length = value ? value.length : 0;
        return length >= min && length <= max;
    }
}

// Initialize utility classes
let performanceMonitor = null;
let errorHandler = null;
let themeManager = null;
let accessibilityManager = null;
let lazyLoader = null;