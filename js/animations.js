// ===============================================
// ANIMATIONS
// ===============================================

// ===============================================
// ANIMATIONS
// ===============================================

class AnimationController {
    constructor() {
        this.observer = null;
        this.countersAnimated = false;
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupMagneticButtons();
        this.setupParallaxEffect();
        this.setupCounterAnimations();
        this.setupTimelineAnimations();
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: CONFIG.scroll.observerOffset
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counter animation for stats section
                    if (entry.target.classList.contains('stats-grid') && !this.countersAnimated) {
                        this.animateCounters();
                        this.countersAnimated = true;
                    }
                }
            });
        }, observerOptions);
        
        // Observe fade-in elements
        DOM.elements.fadeInElements.forEach(el => {
            this.observer.observe(el);
        });
        
        // Observe stats grid
        if (DOM.elements.statsGrid) {
            this.observer.observe(DOM.elements.statsGrid);
        }
    }
    
    setupMagneticButtons() {
        DOM.elements.magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                if (UTILS.isMobile()) return;
                
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
    
    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.hero-bg-text');
        
        window.addEventListener('scroll', UTILS.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = scrolled * 0.5;
                element.style.transform = `translate(-50%, calc(-50% + ${speed}px))`;
            });
        }, 16));
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.textContent);
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target % 1 !== 0 ? target.toFixed(2) : target;
                    if (target > 10) {
                        counter.textContent += '+';
                    }
                    clearInterval(timer);
                } else {
                    counter.textContent = current % 1 !== 0 ? current.toFixed(2) : Math.floor(current);
                }
            }, 20);
        });
    }
    
    setupTimelineAnimations() {
        DOM.elements.timelineItems.forEach((item, index) => {
            item.style.setProperty('--item-index', index);
        });
    }
    
    // Project card hover effects
    setupProjectCardAnimations() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!UTILS.isMobile()) {
                    this.style.transform = 'translateY(-10px) rotateX(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) rotateX(0)';
            });
        });
    }
    
    // Skill tag animations
    setupSkillTagAnimations() {
        const skillTags = document.querySelectorAll('.skill-tag');
        
        skillTags.forEach(tag => {
            tag.addEventListener('mouseenter', function() {
                if (!UTILS.isMobile()) {
                    this.style.transform = 'scale(1.05) rotateZ(2deg)';
                }
            });
            
            tag.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotateZ(0)';
            });
        });
    }
    
    // Text reveal animation
    revealText(element) {
        const text = element.textContent;
        element.innerHTML = '';
        
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.setProperty('--char-index', index);
            span.classList.add('reveal-char');
            element.appendChild(span);
        });
        
        element.classList.add('text-reveal');
    }
    
    // Stagger animation for lists
    staggerAnimation(elements, delay = 100) {
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * delay}ms`;
        });
    }
    
    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Loading screen animation
class LoadingScreen {
    constructor() {
        this.loaderWrapper = DOM.elements.loaderWrapper;
        this.init();
    }
    
    init() {
        if (!this.loaderWrapper) return;
        
        // Hide loader after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 2000);
        });
    }
    
    hide() {
        if (this.loaderWrapper) {
            this.loaderWrapper.classList.add('hidden');
            
            // Remove from DOM after animation
            setTimeout(() => {
                this.loaderWrapper.remove();
            }, 500);
        }
    }
}

// Scroll to top button
class ScrollToTop {
    constructor() {
        this.button = null;
        this.createButton();
        this.bindEvents();
    }
    
    createButton() {
        this.button = document.createElement('button');
        this.button.innerHTML = '↑';
        this.button.className = 'scroll-top-btn';
        this.button.setAttribute('aria-label', 'Scroll to top');
        
        // Styles
        Object.assign(this.button.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--gradient-1)',
            border: 'none',
            color: 'var(--primary-color)',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s',
            zIndex: '1000',
            boxShadow: '0 10px 30px rgba(212, 165, 116, 0.3)'
        });
        
        document.body.appendChild(this.button);
    }
    
    bindEvents() {
        // Show/hide based on scroll position
        window.addEventListener('scroll', UTILS.throttle(() => {
            if (window.pageYOffset > 500) {
                this.show();
            } else {
                this.hide();
            }
        }, 100));
        
        // Click to scroll to top
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    show() {
        this.button.style.opacity = '1';
        this.button.style.visibility = 'visible';
    }
    
    hide() {
        this.button.style.opacity = '0';
        this.button.style.visibility = 'hidden';
    }
}

// Initialize animation components
let animationController = null;
let loadingScreen = null;
let scrollToTop = null;