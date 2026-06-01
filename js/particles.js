// ===============================================
// THREE.JS DATA NETWORK BACKGROUND
// ===============================================

class ParticleSystem {
    constructor() {
        this.canvasElement = document.getElementById('canvas-bg');
        if (!this.canvasElement || typeof THREE === 'undefined') return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvasElement, 
            alpha: true, 
            antialias: true 
        });
        
        this.particles = null;
        this.geometry = null;
        this.material = null;
        this.particleCount = 400;
        this.velocities = null;
        this.originalPositions = null;
        this.comet = null;
        this.cometActive = false;
        
        // Unified drift direction
        this.driftX = (Math.random() - 0.5) * 0.5;
        this.driftY = (Math.random() - 0.5) * 0.5;
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.camera.position.z = 300;
        
        this.createParticles();
        this.createComet();
        this.bindEvents();
        this.start();
    }
    
    createParticles() {
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        
        this.velocities = new Float32Array(this.particleCount * 3);
        this.originalPositions = new Float32Array(this.particleCount * 3);
        
        const color1 = new THREE.Color(0xD4AF37); // Gold
        const color2 = new THREE.Color(0xF5F5F5); // Off White
        
        for(let i = 0; i < this.particleCount * 3; i+=3) {
            const x = (Math.random() - 0.5) * 1200;
            const y = (Math.random() - 0.5) * 1200;
            const z = (Math.random() - 0.5) * 800;
            
            positions[i] = x;
            positions[i+1] = y;
            positions[i+2] = z;
            
            this.originalPositions[i] = x;
            this.originalPositions[i+1] = y;
            this.originalPositions[i+2] = z;
            
            this.velocities[i] = 0;
            this.velocities[i+1] = 0;
            this.velocities[i+2] = 0;
            
            // Mix colors
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i] = mixedColor.r;
            colors[i+1] = mixedColor.g;
            colors[i+2] = mixedColor.b;
        }
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Add custom glowing texture
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(212,175,55,1)');
        gradient.addColorStop(0.4, 'rgba(42,42,42,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 16, 16);
        const texture = new THREE.CanvasTexture(canvas);
        
        this.material = new THREE.PointsMaterial({
            size: 6,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particles);
    }
    
    createComet() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(256, 32, 0, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
        gradient.addColorStop(0.05, 'rgba(212, 175, 55, 0.9)'); 
        gradient.addColorStop(0.4, 'rgba(42, 42, 42, 0.4)'); 
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(256, 32);
        ctx.quadraticCurveTo(128, 0, 0, 32);
        ctx.quadraticCurveTo(128, 64, 256, 32);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true, 
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.comet = new THREE.Sprite(material);
        this.comet.scale.set(250, 40, 1); 
        this.scene.add(this.comet);
        
        this.resetComet();
        
        setInterval(() => {
            if (!this.cometActive && Math.random() > 0.4) {
                this.launchComet();
            }
        }, 4000);
    }
    
    resetComet() {
        this.cometActive = false;
        if (this.comet) {
            this.comet.position.set(9999, 9999, 9999);
        }
    }
    
    launchComet() {
        this.cometActive = true;
        const startX = (Math.random() > 0.5 ? 1 : -1) * 600;
        const startY = 300 + Math.random() * 200; 
        
        this.comet.position.set(startX, startY, -100 - Math.random()*200);
        
        const endX = -startX * (0.5 + Math.random());
        const endY = -400 - Math.random() * 200;
        
        const dx = endX - startX;
        const dy = endY - startY;
        
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = 15 + Math.random() * 15;
        
        this.comet.userData = {
            vx: (dx/dist) * speed,
            vy: (dy/dist) * speed
        };
        
        this.comet.material.rotation = Math.atan2(dy, dx);
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2);
            this.mouseY = (event.clientY - window.innerHeight / 2);
        });

        // Scatter effect on click
        document.addEventListener('click', (event) => {
            if (!this.geometry) return;
            
            const positions = this.geometry.attributes.position.array;
            
            // Convert mouse click to 3D space roughly
            const vector = new THREE.Vector3(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5
            );
            vector.unproject(this.camera);
            const dir = vector.sub(this.camera.position).normalize();
            const distance = -this.camera.position.z / dir.z;
            const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));

            // Push particles away
            for(let i = 0; i < this.particleCount * 3; i+=3) {
                const px = positions[i];
                const py = positions[i+1];
                
                const dx = px - pos.x;
                const dy = py - pos.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 400) { // Increased explosion radius
                    const force = (400 - dist) / 400;
                    this.velocities[i] += (dx / dist) * force * 30; // Stronger push
                    this.velocities[i+1] += (dy / dist) * force * 30;
                }
            }
        });
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.targetX = this.mouseX * 0.001;
        this.targetY = this.mouseY * 0.001;
        
        if (this.particles && this.geometry) {
            // Parallax
            this.particles.rotation.x += 0.05 * (this.targetY - this.particles.rotation.x);
            this.particles.rotation.y += 0.05 * (this.targetX - this.particles.rotation.y);

            // Update positions based on velocity and drift
            const positions = this.geometry.attributes.position.array;
            for(let i = 0; i < this.particleCount * 3; i+=3) {
                // Apply unified drift
                positions[i] += this.driftX;
                positions[i+1] += this.driftY;

                // Update original positions so the gravity target moves with the drift
                this.originalPositions[i] += this.driftX;
                this.originalPositions[i+1] += this.driftY;
                
                // Add explosion velocities
                positions[i] += this.velocities[i];
                positions[i+1] += this.velocities[i+1];
                positions[i+2] += this.velocities[i+2];

                // Add friction to explosion velocity
                this.velocities[i] *= 0.92;
                this.velocities[i+1] *= 0.92;
                this.velocities[i+2] *= 0.92;

                // Spring back to original positions slowly
                const dx = this.originalPositions[i] - positions[i];
                const dy = this.originalPositions[i+1] - positions[i+1];
                const dz = this.originalPositions[i+2] - positions[i+2];
                
                positions[i] += dx * 0.01;
                positions[i+1] += dy * 0.01;
                positions[i+2] += dz * 0.01;

            // Wrap around screen boundaries for endless drift
                if(this.originalPositions[i] > 600) { this.originalPositions[i] = -600; positions[i] -= 1200; }
                if(this.originalPositions[i] < -600) { this.originalPositions[i] = 600; positions[i] += 1200; }
                if(this.originalPositions[i+1] > 600) { this.originalPositions[i+1] = -600; positions[i+1] -= 1200; }
                if(this.originalPositions[i+1] < -600) { this.originalPositions[i+1] = 600; positions[i+1] += 1200; }
                
                // Warp speed effect (Z-axis)
                if (this.warpSpeed > 0.1) {
                    positions[i+2] += this.warpSpeed;
                    this.originalPositions[i+2] += this.warpSpeed;
                    
                    // If particle passes the camera (z ~ 300), loop it back to the far distance
                    if (positions[i+2] > 400) {
                        const zReset = -800 - Math.random() * 200;
                        positions[i+2] = zReset;
                        this.originalPositions[i+2] = zReset;
                    }
                }
            }
            this.geometry.attributes.position.needsUpdate = true;
            
            // Decay warp speed
            if (this.warpSpeed > 0) {
                this.warpSpeed *= 0.95;
            }
        }
        
        if (this.comet && this.cometActive) {
            this.comet.position.x += this.comet.userData.vx;
            this.comet.position.y += this.comet.userData.vy;
            
            if (Math.abs(this.comet.position.x) > 900 || this.comet.position.y < -700) {
                this.resetComet();
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }

    triggerWarp(intensity) {
        this.warpSpeed = intensity;
    }

    destroy() {
        this.stop();
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.renderer) this.renderer.dispose();
    }
}

window.ParticleSystem = ParticleSystem;
