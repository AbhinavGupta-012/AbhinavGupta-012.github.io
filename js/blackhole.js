// js/blackhole.js
// ==============================
// This file handles the "blackhole" star animation and interactive effects:
// - Star collapse on hover
// - Star expanse on click
// - Smooth rotation and trail effects
// - Emits custom events (e.g., "blackholeExpanded") for navigation.js
// ==============================

function blackhole(elementSelector) {
    const $container = $(elementSelector);
    const cw = $container.width();
    const ch = $container.height();
    const centerX = cw / 2;
    const centerY = ch / 2;
    const maxOrbit = 255; // Max distance from center

    let startTime = Date.now();
    let currentTime = 0;

    let stars = [];
    let collapse = false;   // hover state
    let expanse = false;    // click (expanded) state
    let reverse = false;    // collapsing back

    // Create canvas inside container
    const $canvas = $('<canvas/>').attr({ width: cw, height: ch }).appendTo($container);
    const ctx = $canvas[0].getContext('2d');
    ctx.globalCompositeOperation = "multiply";

    // ------------------------
    // Utility: Set high-DPI canvas
    // ------------------------
    function setDPI(canvas, dpi) {
        if (!canvas[0].style.width) canvas[0].style.width = canvas[0].width + 'px';
        if (!canvas[0].style.height) canvas[0].style.height = canvas[0].height + 'px';

        const scaleFactor = dpi / 96;
        canvas[0].width = Math.ceil(canvas[0].width * scaleFactor);
        canvas[0].height = Math.ceil(canvas[0].height * scaleFactor);
        canvas[0].getContext('2d').scale(scaleFactor, scaleFactor);
    }

    // ------------------------
    // Utility: Rotate a point around center
    // ------------------------
    function rotate(cx, cy, x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
        const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    setDPI($canvas, 192);

    // ------------------------
    // Star class
    // ------------------------
    function Star() {
        // Weighted random orbital distance
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

    // ------------------------
    // Star drawing logic
    // ------------------------
    Star.prototype.draw = function () {
        if (!expanse) {
            this.rotation = this.startRotation + currentTime * this.speed;

            if (!collapse) { // normal state
                this.y += (this.y < this.yOrigin - 4) ? (this.yOrigin - this.y) / 10 : -2.5;
            } else { // hover collapse
                if (this.y > this.hoverPos) this.y -= (this.hoverPos - this.y) / -5;
                if (this.y < this.hoverPos - 4) this.y += 2.5;
            }
        } else if (reverse) { // reverse collapse
            this.rotation = this.startRotation + currentTime * this.speed;
            if (this.y < this.yOrigin) this.y += (this.yOrigin - this.y) / 50;
        } else { // expanse
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
    // Event listeners for hover and click
    // ------------------------
    $('.centerHover').on({
        mouseover: () => { if (!expanse) collapse = true; },
        mouseout: () => { if (!expanse) collapse = false; },
        click: () => {
            expanse = true;
            collapse = false;
            $('.centerHover').addClass('open');
            $('.fullpage').addClass('open');

            // Emit event so navigation.js can open About section
            setTimeout(() => {
                const event = new CustomEvent('blackholeExpanded');
                document.dispatchEvent(event);
            }, 4000); // delay matches animation
        }
    });

    $('#collapseBtn').on('click', () => {
        expanse = false;
        reverse = true;
        $('.centerHover').removeClass('open');
        $('.fullpage').removeClass('open');
    });

    // ------------------------
    // Animation loop
    // ------------------------
    const requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        (cb => setTimeout(cb, 1000 / 60));

    function loop() {
        currentTime = (Date.now() - startTime) / 50;

        // Draw semi-transparent background for trail effect
        ctx.fillStyle = 'rgba(20, 0, 30, 0.2)';
        ctx.fillRect(0, 0, cw, ch);

        stars.forEach(star => star.draw());

        requestFrame(loop);
    }

    // ------------------------
    // Initialize stars and start loop
    // ------------------------
    function init() {
        ctx.fillStyle = 'rgba(35, 1, 42, 0.2)';
        ctx.fillRect(0, 0, cw, ch);

        for (let i = 0; i < 2500; i++) new Star();
        loop();
    }

    init();
}

// Initialize blackhole canvas
blackhole('#blackhole');