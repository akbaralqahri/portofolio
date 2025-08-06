// ===============================================
// CUSTOM CURSOR
// ===============================================

class CustomCursor {
    constructor() {
        this.cursor = null;
        this.isVisible = false;
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.init();
    }
    
    init() {
        if (UTILS.isMobile() || !CONFIG.performance.enableCursor) {
            document.body.style.cursor = 'auto';
            return;
        }
        
        this.cursor = DOM.elements.cursor;
        if (!this.cursor) return;
        
        this.bindEvents();
        this.animate();
    }
    
    bindEvents() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
            
            if (!this.isVisible) {
                this.show();
            }
        });
        
        // Mouse enter/leave window
        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());
        
        // Interactive elements hover
        DOM.elements.interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.setHover(true));
            el.addEventListener('mouseleave', () => this.setHover(false));
        });
        
        // Mouse down/up
        document.addEventListener('mousedown', () => this.setPressed(true));
        document.addEventListener('mouseup', () => this.setPressed(false));
    }
    
    show() {
        if (!this.cursor) return;
        this.isVisible = true;
        this.cursor.style.opacity = '1';
        this.cursor.style.visibility = 'visible';
    }
    
    hide() {
        if (!this.cursor) return;
        this.isVisible = false;
        this.cursor.style.opacity = '0';
        this.cursor.style.visibility = 'hidden';
    }
    
    setHover(isHovering) {
        if (!this.cursor) return;
        
        if (isHovering) {
            this.cursor.classList.add('hover');
        } else {
            this.cursor.classList.remove('hover');
        }
    }
    
    setPressed(isPressed) {
        if (!this.cursor) return;
        
        if (isPressed) {
            this.cursor.style.transform = `translate(-50%, -50%) scale(0.8)`;
        } else {
            this.cursor.style.transform = `translate(-50%, -50%) scale(1)`;
        }
    }
    
    animate() {
        if (!this.cursor) return;
        
        // Smooth cursor following with easing
        this.currentX = UTILS.lerp(this.currentX, this.targetX, 0.15);
        this.currentY = UTILS.lerp(this.currentY, this.targetY, 0.15);
        
        this.cursor.style.left = this.currentX + 'px';
        this.cursor.style.top = this.currentY + 'px';
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
        document.body.style.cursor = 'auto';
    }
}

// Initialize cursor
let customCursor = null;