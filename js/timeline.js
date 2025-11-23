// js/timeline.js - Fixed z-index handling for blackhole
document.addEventListener("DOMContentLoaded", () => {

    // ------------------------
    // DOM elements
    // ------------------------
    const canvas = document.getElementById("timelineCanvas");
    const ctx = canvas.getContext("2d");
    const instructionEl = document.querySelector(".instruction");
    const energyCounterEl = document.querySelector(".energy-counter");
    const closeButton = document.querySelector(".close-button");
    const timelineContentEl = document.querySelector(".timeline-content");
    const blackHoleCenterEl = document.querySelector(".blackhole-center");

    // ------------------------
    // Animation state machine
    // ------------------------
    const STATE = {
        IDLE: "idle",          // waiting for first click
        COLLECTING: "collecting", // gathering energy
        BLACKHOLE: "blackhole",   // blackhole growth
        EXPLODING: "exploding",   // explosion phase
        COMPLETE: "complete"      // timeline revealed
    };

    let energyWaves = [];
    let explosionParticles = [];
    let shockwave = null;
    let energyLevel = 0;
    let phase = STATE.IDLE;
    let animationId = null;
    let clipPathRadius = 0;
    let maxClipRadius = 0;
    let centerX = 0;
    let centerY = 0;

    // ------------------------
    // Canvas setup + resizing
    // ------------------------
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Calculate center of screen
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        // Calculate maximum clip radius (diagonal of screen)
        maxClipRadius = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2;
        
        // Update clip path if needed
        if (phase === STATE.BLACKHOLE || phase === STATE.EXPLODING) {
            updateClipPath(clipPathRadius);
        }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Update clip-path of timeline content
    const updateClipPath = (radius) => {
        timelineContentEl.style.clipPath = `circle(${radius}px at ${centerX}px ${centerY}px)`;
    };

    // ==============================
    // Classes
    // ==============================

    // ------------------------
    // EnergyWave (during collection phase)
    // ------------------------
    class EnergyWave {
        constructor(x, y, targetX, targetY) {
            this.x = x;
            this.y = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.progress = 0;
            this.speed = 0.005 + Math.random() * 0.005;
            this.amplitude = 15 + Math.random() * 20;
            this.phaseShift = Math.random() * Math.PI * 2;
            this.width = 2 + Math.random() * 2;

            // Random blue or orange tone
            const isBlue = Math.random() > 0.5;
            this.hue = isBlue ? 210 + Math.random() * 30 : 30 + Math.random() * 20;
            this.saturation = "100%";
            this.lightness = `${60 + Math.random() * 10}%`;

            this.completed = false;
        }

        update() {
            if (this.completed) return;
            this.progress += this.speed;

            if (this.progress >= 1) {
                this.completed = true;

                // Increment energy only if below 100
                if (energyLevel < 100) {
                    energyLevel++;
                    updateState();
                }
            }
        }

        draw() {
            if (this.completed) return;

            ctx.save();
            ctx.lineWidth = this.width;
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsla(${this.hue}, ${this.saturation}, 70%, 0.7)`;
            ctx.strokeStyle = `hsl(${this.hue}, ${this.saturation}, ${this.lightness})`;
            ctx.beginPath();

            for (let t = 0; t <= 1; t += 0.02) {
                const px = this.x + (this.targetX - this.x) * t * this.progress;
                const py = this.y + (this.targetY - this.y) * t * this.progress;
                const waveOffset =
                    Math.sin((t * 10) + this.phaseShift + this.progress * 10) *
                    this.amplitude * (1 - t);

                if (t === 0) ctx.moveTo(px, py + waveOffset);
                else ctx.lineTo(px, py + waveOffset);
            }

            ctx.stroke();
            ctx.restore();
        }
    }

    // ------------------------
    // ExplosionParticle (during explosion)
    // ------------------------
    class ExplosionParticle {
        constructor(x, y, angle, speed, color) {
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = 2 + Math.random() * 3;
            this.color = color;
            this.opacity = 1;
            this.fadeSpeed = 0.01 + Math.random() * 0.01;
            this.life = 1; // controls gravitational pull
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= this.fadeSpeed;
            this.size *= 0.99;

            // Weak gravitational pull towards center
            if (this.life > 0.5) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const dx = centerX - this.x;
                const dy = centerY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 10) {
                    const pullFactor = 0.005;
                    this.vx += (dx / dist) * pullFactor;
                    this.vy += (dy / dist) * pullFactor;
                }
            }

            this.life -= this.fadeSpeed * 0.5;
        }

        draw() {
            if (this.opacity <= 0 || this.size <= 0.1) return;

            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ==============================
    // Shockwave helpers
    // ==============================
    const createShockwave = (centerX, centerY) => {
        shockwave = {
            x: centerX,
            y: centerY,
            radius: 0,
            maxRadius: Math.max(canvas.width, canvas.height) * 0.7,
            speed: 10,
            opacity: 1
        };
    };

    const updateShockwave = () => {
        if (!shockwave) return;
        shockwave.radius += shockwave.speed;
        shockwave.opacity -= 0.01;
        if (shockwave.opacity <= 0 || shockwave.radius > shockwave.maxRadius) {
            shockwave = null;
        }
    };

    const drawShockwave = () => {
        if (!shockwave) return;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, shockwave.opacity * 0.8)})`;
        ctx.lineWidth = 5 + (1 - shockwave.opacity) * 15;
        ctx.shadowBlur = 30 * shockwave.opacity;
        ctx.shadowColor = `rgba(255, 255, 255, ${Math.max(0, shockwave.opacity)})`;
        ctx.beginPath();
        ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    // ==============================
    // State transitions
    // ==============================
    const updateState = () => {
        energyCounterEl.textContent = `Energy: ${Math.min(Math.round(energyLevel), 100)}%`;
        energyCounterEl.classList.add("visible");

        if (energyLevel >= 25 && phase === STATE.COLLECTING) {
            phase = STATE.BLACKHOLE;
            startBlackHoleGrowth();
        } else if (energyLevel >= 100 && phase === STATE.BLACKHOLE) {
            phase = STATE.EXPLODING;
            explodeBlackHole();
        }
    };

    // Blackhole growth
    const startBlackHoleGrowth = () => {
        blackHoleCenterEl.classList.add("visible");
        
        // Show timeline content behind blackhole but keep it clipped
        timelineContentEl.classList.add("active");
        
        const interval = setInterval(() => {
            if (phase !== STATE.BLACKHOLE) {
                clearInterval(interval);
                return;
            }
            const size = Math.min(200, ((energyLevel - 25) / 75) * 200);
            blackHoleCenterEl.style.width = `${size}px`;
            blackHoleCenterEl.style.height = `${size}px`;
            
            // Update clip path to match blackhole size
            clipPathRadius = size / 2;
            updateClipPath(clipPathRadius);
        }, 100);
    };

    // ==============================
    // Explosion sequence
    // ==============================
    const explodeBlackHole = () => {
        // Reduce z-index of blackhole so timeline content is on top
        // Hide blackhole circle for visual effect
        blackHoleCenterEl.classList.remove("visible");
        blackHoleCenterEl.style.opacity = "0";
        blackHoleCenterEl.style.zIndex = "5";

        // Shockwave
        createShockwave(centerX, centerY);

        // Flash effect
        document.body.style.transition = "background-color 0.1s";
        document.body.style.backgroundColor = "#fff";
        setTimeout(() => {
            document.body.style.backgroundColor = "#000";
            document.body.style.transition = "";
        }, 100);

        // Particles
        for (let i = 0; i < 500; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 15;
            const colorHue = Math.random() > 0.5 ? (210 + Math.random() * 30) : (30 + Math.random() * 20);
            const color = `hsl(${colorHue}, 100%, 70%)`;
            explosionParticles.push(new ExplosionParticle(centerX, centerY, angle, speed, color));
        }

        // Animate the clip-path expansion
        const startTime = Date.now();
        const duration = 2000; // 2 seconds
        const startRadius = clipPathRadius;
        
        const animateClipExpansion = () => {
            if (phase !== STATE.EXPLODING) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out function for smooth animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            clipPathRadius = startRadius + (maxClipRadius - startRadius) * easeProgress;
            updateClipPath(clipPathRadius);
            
            if (progress < 1) {
                requestAnimationFrame(animateClipExpansion);
            } else {
                // Animation complete
                phase = STATE.COMPLETE;
                closeButton.classList.add("visible");
            }
        };
        
        animateClipExpansion();
    };

    // ==============================
    // Main animation loop
    // ==============================
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dark background for trails
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Energy waves
        energyWaves.forEach(wave => { wave.update(); wave.draw(); });
        if (phase !== STATE.EXPLODING) {
            energyWaves = energyWaves.filter(wave => !wave.completed);
        }

        // Particles
        if (phase === STATE.EXPLODING) {
            explosionParticles.forEach(p => { p.update(); p.draw(); });
            explosionParticles = explosionParticles.filter(p => p.opacity > 0 && p.size > 0.1);
        }

        // Shockwave
        updateShockwave();
        drawShockwave();

        animationId = requestAnimationFrame(animate);
    };

    // ==============================
    // Reset animation
    // ==============================
    const resetAnimation = () => {
        if (animationId) cancelAnimationFrame(animationId);

        energyWaves = [];
        explosionParticles = [];
        shockwave = null;
        energyLevel = 0;
        phase = STATE.IDLE;
        clipPathRadius = 0;

        // Reset UI
        instructionEl.classList.add("visible");
        energyCounterEl.classList.remove("visible");
        timelineContentEl.classList.remove("active");
        closeButton.classList.remove("visible");
        blackHoleCenterEl.classList.remove("visible", "behind");
        blackHoleCenterEl.style.width = "0px";
        blackHoleCenterEl.style.height = "0px";
        blackHoleCenterEl.style.opacity = "1";
        
        // Reset clip path
        updateClipPath(0);

        animate();
    };

    // ==============================
    // Event listeners
    // ==============================
    canvas.addEventListener("click", (e) => {
        // Block clicks if timeline complete or energy full
        if (phase === STATE.COMPLETE || energyLevel >= 100) return;

        if (phase === STATE.IDLE) {
            phase = STATE.COLLECTING;
            instructionEl.classList.remove("visible");
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Add energy waves only if energy is below 100
        if (energyLevel < 100) {
            for (let i = 0; i < 3; i++) {
                const targetX = centerX + (Math.random() * 20 - 10);
                const targetY = centerY + (Math.random() * 20 - 10);
                energyWaves.push(new EnergyWave(e.clientX, e.clientY, targetX, targetY));
            }
        }
    });

    closeButton.addEventListener("click", resetAnimation);

    // ==============================
    // Init
    // ==============================
    resetAnimation();
});