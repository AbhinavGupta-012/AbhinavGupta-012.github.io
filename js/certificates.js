/**
 * CERTIFICATES SYSTEM
 * 1. CertificatePreview: Existing logic for the About section previews.
 * 2. CosmicRiftEngine: New logic for the Certificates Page hover effects using Canvas.
 */

/* =========================================
   1. EXISTING PREVIEW SYSTEM
   ========================================= */
class CertificatePreview {
    constructor() {
        this.previewElements = [];
        this.isMobile = this.detectMobile();
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.preloadImages();
    }

    detectMobile() {
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }

    cacheElements() {
        this.previewElements = document.querySelectorAll('.cert-with-preview');
        
        if (this.isMobile) {
            this.createMobileOverlay();
        }
    }

    createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'cert-mobile-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
            z-index: 999; opacity: 0; visibility: hidden;
            transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;
        `;
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hideAllPreviews();
        });

        document.body.appendChild(overlay);
        this.mobileOverlay = overlay;
    }

    bindEvents() {
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const frame = element.querySelector('.cert-preview-frame');
            
            if (this.isMobile) {
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePreview(element);
                });
            } else {
                icon.addEventListener('mouseenter', () => this.showPreview(element));
                icon.addEventListener('mouseleave', () => this.hidePreview(element));
                frame.addEventListener('mouseenter', () => this.keepPreviewVisible(element));
                frame.addEventListener('mouseleave', () => this.hidePreview(element));
            }

            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.togglePreview(element);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideAllPreviews();
        });

        if (this.isMobile) {
            window.addEventListener('scroll', () => this.hideAllPreviews());
        }
    }

    showPreview(element) {
        this.hideAllPreviews();
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        icon.classList.add('active');
        frame.classList.add('active');
        this.animateEntrance(frame);
    }

    hidePreview(element) {
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        icon.classList.remove('active');
        frame.classList.remove('active');
    }

    togglePreview(element) {
        const frame = element.querySelector('.cert-preview-frame');
        if (frame.classList.contains('active')) {
            this.hidePreview(element);
            if (this.isMobile && this.mobileOverlay) {
                this.mobileOverlay.style.opacity = '0';
                this.mobileOverlay.style.visibility = 'hidden';
            }
        } else {
            this.showPreview(element);
            if (this.isMobile && this.mobileOverlay) {
                this.mobileOverlay.style.opacity = '1';
                this.mobileOverlay.style.visibility = 'visible';
            }
        }
    }

    hideAllPreviews() {
        this.previewElements.forEach(element => this.hidePreview(element));
        if (this.isMobile && this.mobileOverlay) {
            this.mobileOverlay.style.opacity = '0';
            this.mobileOverlay.style.visibility = 'hidden';
        }
    }

    keepPreviewVisible(element) {
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        icon.classList.add('active');
        frame.classList.add('active');
    }

    animateEntrance(frame) {
        frame.style.transform = 'translateY(-50%) scale(0.95)';
        frame.style.opacity = '0';
        requestAnimationFrame(() => {
            frame.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            frame.style.transform = 'translateY(-50%) scale(1)';
            frame.style.opacity = '1';
        });
    }

    preloadImages() {
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const imgSrc = icon.getAttribute('data-preview-src');
            if (imgSrc) {
                const img = new Image();
                img.src = imgSrc;
            }
        });
    }

    refresh() {
        this.cacheElements();
        this.bindEvents();
    }
}

/* =========================================
   2. COSMIC RIFT ENGINE (Canvas Animation)
   ========================================= */
class CosmicRiftEngine {
    constructor() {
        this.cards = document.querySelectorAll('.cosmic-card');
        this.init();
    }

    init() {
        // Define colors per class
        const config = {
  'card-courses': { color: '#00f7ff', shadow: 'rgba(0, 247, 255, 0.6)' },   // blue
  'card-participation': { color: '#bc13fe', shadow: 'rgba(188, 19, 254, 0.6)' }, // purple
  'card-achievements': { color: '#ffd700', shadow: 'rgba(255, 215, 0, 0.6)' },  // gold
  'card-archive': { color: '#00e0b0', shadow: 'rgba(0, 224, 176, 0.6)' }       // green
};



        this.cards.forEach(card => {
            // Determine config based on class
            let theme = { color: '#ffffff', shadow: 'rgba(255,255,255,0.5)' }; // fallback
            for (const [cls, cfg] of Object.entries(config)) {
                if (card.classList.contains(cls)) theme = cfg;
            }

            // Create Canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'cosmic-rift-canvas';
            card.appendChild(canvas);
            
            // Attach Rift Controller to this card
            new CardRift(card, canvas, theme);
        });
    }
}

class CardRift {
    constructor(card, canvas, theme) {
        this.card = card;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.theme = theme;
        
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.animationId = null;
        this.isHovering = false;
        this.time = 0;

        this.resize();
        this.bindEvents();
    }

    bindEvents() {
        // Resize observer to handle responsive card changes
        const observer = new ResizeObserver(() => this.resize());
        observer.observe(this.card);

        this.card.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.startAnimation();
        });

        this.card.addEventListener('mouseleave', () => {
            this.isHovering = false;
            // Don't stop immediately, let particles fade out
        });
    }

    resize() {
        // We want the canvas to cover the card + bleed area
        // The CSS sets width/height to calc(100% + 20px)
        const rect = this.card.getBoundingClientRect();
        // Add padding account (10px each side = 20px total)
        this.width = rect.width + 20;
        this.height = rect.height + 20;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    startAnimation() {
        if (!this.animationId) {
            this.loop();
        }
    }

    loop() {
        this.time += 0.05;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Logic: If hovering, spawn new energy streams
        if (this.isHovering) {
            this.spawnEnergy();
        }

        // Update and draw all particles
        this.updateParticles();

        // Stop loop if no particles left and not hovering
        if (this.particles.length === 0 && !this.isHovering) {
            this.animationId = null;
            return;
        }

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    spawnEnergy() {
        // Chance to spawn a "rift line"
        if (Math.random() > 0.3) return; 

        // 4 Corners relative to canvas (10px padding)
        // Card content is at 10,10 to width-10, height-10
        const corners = [
            { x: 10, y: 10, vx: 1, vy: 1 },                   // Top Left
            { x: this.width - 10, y: 10, vx: -1, vy: 1 },     // Top Right
            { x: 10, y: this.height - 10, vx: 1, vy: -1 },    // Bottom Left
            { x: this.width - 10, y: this.height - 10, vx: -1, vy: -1 } // Bottom Right
        ];

        // Pick random corner
        const corner = corners[Math.floor(Math.random() * corners.length)];
        
        // Determine "Edge Travel" direction
        // Either horizontal or vertical
        const isHorizontal = Math.random() > 0.5;

        this.particles.push({
            x: corner.x,
            y: corner.y,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03,
            path: [], // History of points for lightning effect
            direction: isHorizontal ? 'h' : 'v',
            signX: corner.vx,
            signY: corner.vy,
            wobbleOffset: Math.random() * 100
        });
    }

    updateParticles() {
        this.ctx.lineCap = 'round';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.theme.shadow;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Move particle
            const speed = 4; // Speed of rift growth
            
            if (p.direction === 'h') {
                p.x += speed * p.signX;
            } else {
                p.y += speed * p.signY;
            }

            // Calculate "Jitter" (The Rift Effect)
            // Use Sine waves + random noise
            const jitter = Math.sin(this.time * 2 + p.wobbleOffset) * 2 + (Math.random() - 0.5) * 3;
            
            // Store path
            if (p.direction === 'h') {
                p.path.push({ x: p.x, y: p.y + jitter });
            } else {
                p.path.push({ x: p.x + jitter, y: p.y });
            }

            // Draw
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.theme.color;
            this.ctx.lineWidth = 2 * p.life;
            this.ctx.globalAlpha = p.life;

            if (p.path.length > 1) {
                this.ctx.moveTo(p.path[0].x, p.path[0].y);
                for (let j = 1; j < p.path.length; j++) {
                    this.ctx.lineTo(p.path[j].x, p.path[j].y);
                }
                this.ctx.stroke();
            }

            // Decay
            p.life -= p.decay;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Reset context
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Init existing preview system
    window.certificatePreview = new CertificatePreview();
    
    // 2. Init new Canvas Rift System
    window.cosmicRiftEngine = new CosmicRiftEngine();
});