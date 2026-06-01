// ===============================================
// ADVANCED ANIMATIONS (GSAP & SCROLLTRIGGER)
// ===============================================

class AnimationController {
    constructor() {
        this.countersAnimated = false;
        this.init();
    }
    
    init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
        
        this.setupGSAPAnimations();
        this.setupMagneticButtons();
        this.setupCounterAnimations();
        this.setupTimelineAnimations();
        this.setupSkillTagAnimations();
    }
    
    setupGSAPAnimations() {
        // Fade in sections smoothly (Shortened Duration)
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => {
            gsap.fromTo(el, 
                { y: 30, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.5, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Horizontal scroll removed per user request
    }
    
    setupMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.magnetic-btn');
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, {
                    x: x * 0.2,
                    y: y * 0.2,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }
    
    setupCounterAnimations() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        ScrollTrigger.create({
            trigger: statsGrid,
            start: "top 80%",
            onEnter: () => {
                if (!this.countersAnimated) {
                    this.animateCounters();
                    this.countersAnimated = true;
                }
            }
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const text = counter.textContent;
            const isPlus = text.includes('+');
            const target = parseFloat(text);
            
            gsap.fromTo(counter, 
                { innerHTML: 0 }, 
                { 
                    innerHTML: target, 
                    duration: 1.5, 
                    ease: "power2.out",
                    snap: { innerHTML: target % 1 === 0 ? 1 : 0.01 },
                    onUpdate: function() {
                        counter.innerHTML = isPlus ? this.targets()[0].innerHTML + '+' : this.targets()[0].innerHTML;
                    }
                }
            );
        });
    }
    
    setupTimelineAnimations() {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            gsap.from(item, {
                opacity: 0,
                x: -30,
                duration: 0.4,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%"
                }
            });
        });
    }
    
    setupSkillTagAnimations() {
        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach((tag, index) => {
            gsap.from(tag, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                scrollTrigger: {
                    trigger: tag.parentElement,
                    start: "top 90%"
                }
            });
        });
    }
}

// Scroll to top button
class ScrollToTop {
    constructor() {
        this.button = document.createElement('button');
        this.button.innerHTML = '↑';
        this.button.className = 'scroll-top-btn';
        
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
            boxShadow: '0 10px 30px var(--accent-glow)'
        });
        
        document.body.appendChild(this.button);
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
            } else {
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
            }
        });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Expose to global for initialization
window.AnimationController = AnimationController;
window.ScrollToTop = ScrollToTop;