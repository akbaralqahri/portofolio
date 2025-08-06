// ===============================================
// TYPING EFFECT
// ===============================================

class TypingEffect {
    constructor(element, texts) {
        this.element = element;
        this.texts = texts || CONFIG.typingTexts;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.isRunning = false;
        
        if (this.element) {
            this.start();
        }
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Start typing immediately
        setTimeout(() => {
            this.type();
        }, 500);
    }
    
    type() {
        if (!this.isRunning || !this.element) return;
        
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            // Deleting characters
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
            
            if (this.charIndex === 0) {
                this.isDeleting = false;
                this.textIndex = (this.textIndex + 1) % this.texts.length;
            }
        } else {
            // Typing characters
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
            
            if (this.charIndex === currentText.length) {
                this.isDeleting = true;
                // Wait before starting to delete
                setTimeout(() => {
                    if (this.isRunning) this.type();
                }, CONFIG.animations.delayBeforeDelete);
                return;
            }
        }
        
        const speed = this.isDeleting ? 
            CONFIG.animations.deletingSpeed : 
            CONFIG.animations.typingSpeed;
            
        setTimeout(() => {
            if (this.isRunning) this.type();
        }, speed);
    }
    
    stop() {
        this.isRunning = false;
    }
    
    restart() {
        this.stop();
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        setTimeout(() => this.start(), 100);
    }
    
    updateTexts(newTexts) {
        this.texts = newTexts;
        this.restart();
    }
}

// Hero title typing effect
class HeroTitleEffect {
    constructor(element) {
        this.element = element;
        this.originalText = '';
        
        if (this.element) {
            this.originalText = this.element.textContent;
            this.init();
        }
    }
    
    init() {
        this.element.textContent = '';
        
        // Start typing after a delay
        setTimeout(() => {
            this.typeTitle();
        }, 1000);
    }
    
    typeTitle() {
        let i = 0;
        const text = this.originalText;
        
        const typeWriter = () => {
            if (i < text.length) {
                this.element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            }
        };
        
        typeWriter();
    }
}

// Initialize typing effects when DOM is ready
function initTypingEffects() {
    const typingTextElement = document.getElementById('typing-text');
    const heroTitleElement = document.querySelector('.hero-title-main');
    
    // Main typing effect
    if (typingTextElement && CONFIG.typingTexts) {
        window.typingEffect = new TypingEffect(typingTextElement, CONFIG.typingTexts);
    }
    
    // Hero title effect
    if (heroTitleElement) {
        window.heroTitleEffect = new HeroTitleEffect(heroTitleElement);
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypingEffects);
} else {
    initTypingEffects();
}