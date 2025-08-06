// ===============================================
// CONFIGURATION
// ===============================================

// Global configuration object
const CONFIG = {
    // Animation settings
    animations: {
        typingSpeed: 100,
        deletingSpeed: 50,
        delayBeforeDelete: 2000,
        particleCount: 100,
        particleConnectionDistance: 100
    },
    
    // Typing text array
    typingTexts: [
        "Data Scientist",
        "Machine Learning Engineer", 
        "Data Analyst",
        "Data Engineer",
        "Business Intelligence Developer",
        "Statistical Analyst"
    ],
    
    // Mouse interaction settings
    mouse: {
        x: null,
        y: null,
        radius: 150
    },
    
    // Performance settings
    performance: {
        enableParticles: true,
        enableCursor: true,
        enableAnimations: true
    },
    
    // Responsive breakpoints
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    },
    
    // Scroll settings
    scroll: {
        offset: 100, // Offset for navbar scroll effect
        observerOffset: '-100px' // Intersection observer offset
    }
};

// Utility functions
const UTILS = {
    // Check if device is mobile
    isMobile: () => window.innerWidth <= CONFIG.breakpoints.mobile,
    
    // Check if device supports touch
    isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },
    
    // Get random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Linear interpolation
    lerp: (start, end, factor) => start + (end - start) * factor
};

// DOM elements cache
const DOM = {
    // Will be populated by main.js
    elements: {},
    
    // Cache DOM elements
    cache: () => {
        DOM.elements = {
            navbar: document.getElementById('navbar'),
            hamburger: document.getElementById('hamburger'),
            mobileNav: document.getElementById('mobileNav'),
            typingText: document.getElementById('typing-text'),
            cursor: document.querySelector('.cursor'),
            canvas: document.getElementById('canvas-bg'),
            loaderWrapper: document.querySelector('.loader-wrapper'),
            heroTitle: document.querySelector('.hero-title-main'),
            statsGrid: document.querySelector('.stats-grid'),
            fadeInElements: document.querySelectorAll('.fade-in'),
            magneticButtons: document.querySelectorAll('.magnetic-btn'),
            interactiveElements: document.querySelectorAll('a, button, .btn, .skill-tag, .stat-card, .project-card, .certification-card, .award-card'),
            scrollLinks: document.querySelectorAll('a[href^="#"]'),
            mobileNavLinks: document.querySelectorAll('.mobile-nav-links a'),
            timelineItems: document.querySelectorAll('.timeline-item, .org-item')
        };
    }
};