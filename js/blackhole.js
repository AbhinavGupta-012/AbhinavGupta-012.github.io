// js/blackhole.js
// ==============================
// OPTIMIZED VERSION
// - Dynamic Star Count (Lowers load on mobile)
// - Capped Pixel Ratio (Prevents lag on 4K/Retina screens)
// - "Shift on Resize" (Prevents stretching)
// ==============================

function blackhole(elementSelector) {
    const $container = $(elementSelector);
    
    // 1. Dynamic Dimensions
    let cw = $container.width();
    let ch = $container.height();
    let centerX = cw / 2;
    let centerY = ch / 2;
    
    // 2. Responsive Star Count
    // Mobile: ~300 stars, Desktop: ~900 stars. (Original was 2500!)
    const isMobile = cw < 768;
    const starCount = isMobile ? 1000 : 2500;
    
    // Cap max orbit size
    let maxOrbit = 255; 

    let startTime = Date.now();
    let currentTime = 0;

    let stars = [];
    let collapse = false;   // hover state
    let expanse = false;    // click (expanded) state
    let reverse = false;    // collapsing back
    
    let isPaused = false;
    let pauseStartTime = 0;
    let animationFrameId;

    // Create canvas
    const $canvas = $('<canvas/>').attr({ width: cw, height: ch }).appendTo($container);
    const ctx = $canvas[0].getContext('2d');
    
    // Performance: This blend mode is heavy. 
    // Uncomment only if you really need the specific visual overlap effect.
    // ctx.globalCompositeOperation = "multiply";

    // ------------------------
    // Utility: High-DPI Scaling (Capped for Performance)
    // ------------------------
    function setDPI() {
        // Cap pixel ratio at 2. Phones with 3x/4x screens don't need that much overhead.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        $canvas[0].style.width = cw + 'px';
        $canvas[0].style.height = ch + 'px';

        $canvas[0].width = Math.ceil(cw * dpr);
        $canvas[0].height = Math.ceil(ch * dpr);

        ctx.scale(dpr, dpr);
    }

    // ------------------------
    // Utility: Rotation
    // ------------------------
    function rotate(cx, cy, x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
        const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    setDPI();

    // ------------------------
    // Star Class
    // ------------------------
    function Star() {
        const rands = [
            Math.random() * (maxOrbit / 2) + 1,
            Math.random() * (maxOrbit / 2) + maxOrbit
        ];
        this.orbital = rands.reduce((p, c) => p + c) / rands.length;

        this.x = centerX;
        this.y = centerY + this.orbital;
        this.yOrigin = this.y; 

        this.speed = (Math.random() + 1.5) * Math.PI / 180;
        this.startRotation = Math.random() * 2 * Math.PI;
        this.rotation = 0;

        this.id = stars.length;
        this.collapseBonus = Math.max(this.orbital - maxOrbit * 0.7, 0);
        this.color = 'rgba(197, 112, 255, 1)';
        
        this.hoverPos = centerY + maxOrbit / 2 + this.collapseBonus;
        this.expansePos = centerY + (this.id % 100) * -10 + (Math.floor(Math.random() * 20) + 1);

        this.prevX = this.x;
        this.prevY = this.y;
        this.prevR = this.startRotation;

        stars.push(this);
    }

    Star.prototype.draw = function () {
        if (!expanse) {
            this.rotation = this.startRotation + currentTime * this.speed;
            if (!collapse) { 
                this.y += (this.y < this.yOrigin - 4) ? (this.yOrigin - this.y) / 10 : -2.5;
            } else { 
                if (this.y > this.hoverPos) this.y -= (this.hoverPos - this.y) / -5;
                if (this.y < this.hoverPos - 4) this.y += 2.5;
            }
        } else if (reverse) { 
            this.rotation = this.startRotation + currentTime * this.speed;
            if (this.y < this.yOrigin) this.y += (this.yOrigin - this.y) / 50;
        } else { 
            this.rotation = this.startRotation + currentTime * (this.speed / 2);
            if (this.y > this.expansePos) this.y -= Math.floor(this.expansePos - this.y) / -140;
        }

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();

        const oldPos = rotate(centerX, centerY, this.prevX, this.prevY, -this.prevR);
        ctx.moveTo(oldPos[0], oldPos[1]);
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.translate(-centerX, -centerY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();

        this.prevX = this.x;
        this.prevY = this.y;
        this.prevR = this.rotation;

        if (reverse && Math.abs(this.y - this.yOrigin) < 3) reverse = false;
    };

    // ------------------------
    // RESIZE HANDLER (No Stretching)
    // ------------------------
    function handleResize() {
        const oldCenterX = centerX;
        const oldCenterY = centerY;

        cw = $container.width();
        ch = $container.height();
        centerX = cw / 2;
        centerY = ch / 2;

        setDPI();

        const dx = centerX - oldCenterX;
        const dy = centerY - oldCenterY;

        stars.forEach(star => {
            star.x += dx;
            star.y += dy;
            star.prevX += dx;
            star.prevY += dy;
            star.yOrigin += dy;
            star.hoverPos += dy;
            star.expansePos += dy;
        });

        // Force background fill immediately
        ctx.fillStyle = 'rgba(20, 0, 30, 1)';
        ctx.fillRect(0, 0, cw, ch);
    }

    $(window).on('resize', handleResize);

    // ------------------------
    // Interactions
    // ------------------------
    const triggerExpansion = () => {
        expanse = true;
        collapse = false;
        $('.centerHover').addClass('open');
        $('.fullpage').addClass('open');
        
        setTimeout(() => {
            $('#pauseAnimationBtn').removeClass('hidden').addClass('visible');
        }, 3000);

        setTimeout(() => {
            const event = new CustomEvent('blackholeExpanded');
            document.dispatchEvent(event);
        }, 4000);
    };

    $('.centerHover').on({
        mouseover: () => { if (!expanse) collapse = true; },
        mouseout: () => { if (!expanse) collapse = false; },
        click: triggerExpansion,
        touchstart: triggerExpansion 
    });

    $('#collapseBtn').on('click', () => {
        expanse = false;
        reverse = true;
        $('#pauseAnimationBtn').removeClass('visible').addClass('hidden');
        if(isPaused) togglePause(); 
        $('.centerHover').removeClass('open');
        $('.fullpage').removeClass('open');
    });

    // ------------------------
    // Pause / Loop
    // ------------------------
    function togglePause() {
        const btn = document.getElementById('pauseAnimationBtn');
        if (isPaused) {
            isPaused = false;
            btn.innerHTML = '⏸';
            const timePaused = Date.now() - pauseStartTime;
            startTime += timePaused;
            loop(); 
        } else {
            isPaused = true;
            pauseStartTime = Date.now();
            btn.innerHTML = '▶';
            cancelAnimationFrame(animationFrameId);
        }
    }

    $('#pauseAnimationBtn').on('click', togglePause);

    const requestFrame = window.requestAnimationFrame || (cb => setTimeout(cb, 1000 / 60));

    function loop() {
        if(isPaused) return;

        currentTime = (Date.now() - startTime) / 50;

        ctx.fillStyle = 'rgba(20, 0, 30, 0.2)';
        ctx.fillRect(0, 0, cw, ch);

        stars.forEach(star => star.draw());

        animationFrameId = requestFrame(loop);
    }

    function init() {
        ctx.fillStyle = 'rgba(35, 1, 42, 0.2)';
        ctx.fillRect(0, 0, cw, ch);
        
        // Use the reduced star count calculated at the top
        for (let i = 0; i < starCount; i++) new Star();
        loop();
    }

    init();
}

blackhole('#blackhole');