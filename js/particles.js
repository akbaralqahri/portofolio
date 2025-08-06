// ===============================================
// PARTICLES ANIMATION
// ===============================================

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = CONFIG.mouse;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        if (!CONFIG.performance.enableParticles) return;
        
        this.canvas = DOM.elements.canvas;
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.createParticles();
        this.bindEvents();
        this.start();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width *= dpr;
        this.canvas.height *= dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }
    
    createParticles() {
        this.particles = [];
        const particleCount = UTILS.isMobile() ? 
            Math.floor(CONFIG.animations.particleCount / 2) : 
            CONFIG.animations.particleCount;
            
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle());
        }
    }
    
    bindEvents() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Window resize
        window.addEventListener('resize', UTILS.debounce(() => {
            this.setupCanvas();
            this.createParticles();
        }, 250));
        
        // Mouse leave
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    update() {
        this.particles.forEach(particle => particle.update());
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Draw connections
        this.drawConnections();
    }
    
    drawConnections() {
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a + 1; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < CONFIG.animations.particleConnectionDistance) {
                    const opacity = 1 - distance / CONFIG.animations.particleConnectionDistance;
                    this.ctx.strokeStyle = `rgba(212, 165, 116, ${opacity * 0.5})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    destroy() {
        this.stop();
        this.particles = [];
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = '#d4a574';
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Boundary collision
        if (this.x > window.innerWidth || this.x < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y > window.innerHeight || this.y < 0) {
            this.speedY = -this.speedY;
        }
        
        // Mouse interaction
        this.handleMouseInteraction();
    }
    
    handleMouseInteraction() {
        if (!CONFIG.mouse.x || !CONFIG.mouse.y) return;
        
        const dx = CONFIG.mouse.x - this.x;
        const dy = CONFIG.mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CONFIG.mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = CONFIG.mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * 5;
            const directionY = forceDirectionY * force * 5;
            
            this.x -= directionX;
            this.y -= directionY;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize particle system
let particleSystem = null;

// Export for use in other modules
window.ParticleSystem = ParticleSystem;