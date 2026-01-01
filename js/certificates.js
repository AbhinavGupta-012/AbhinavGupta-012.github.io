/* ===========================================================
   CERTIFICATES SYSTEM
   Refined to match "About Page" scroll behavior.
   Restored "Included Courses" functionality.
   FIXED: "Blurry Canvas" by destroying/recreating on every view.
   =========================================================== */

/* =========================================
   1. EXISTING PREVIEW SYSTEM (UNCHANGED)
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
        if (this.isMobile) this.createMobileOverlay();
    }

    createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'cert-mobile-overlay';
        overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);backdrop-filter:blur(8px);z-index:999;opacity:0;visibility:hidden;transition:all .3s ease;display:flex;align-items:center;justify-content:center;`;
        overlay.addEventListener('click', e => { if (e.target === overlay) this.hideAllPreviews(); });
        document.body.appendChild(overlay);
        this.mobileOverlay = overlay;
    }

    bindEvents() {
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const frame = element.querySelector('.cert-preview-frame');

            if (this.isMobile) {
                icon.addEventListener('click', e => { e.stopPropagation(); this.togglePreview(element); });
            } else {
                icon.addEventListener('mouseenter', () => this.showPreview(element));
                icon.addEventListener('mouseleave', () => this.hidePreview(element));
                frame.addEventListener('mouseenter', () => this.keepPreviewVisible(element));
                frame.addEventListener('mouseleave', () => this.hidePreview(element));
            }

            icon.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.togglePreview(element); }
            });
        });

        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.hideAllPreviews(); });
        if (this.isMobile) window.addEventListener('scroll', () => this.hideAllPreviews());
    }

    showPreview(element) {
        this.hideAllPreviews();
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        icon.classList.add('active');
        frame.classList.add('active');
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
            if (this.isMobile && this.mobileOverlay) { this.mobileOverlay.style.opacity = '0'; this.mobileOverlay.style.visibility = 'hidden'; }
        } else {
            this.showPreview(element);
            if (this.isMobile && this.mobileOverlay) { this.mobileOverlay.style.opacity = '1'; this.mobileOverlay.style.visibility = 'visible'; }
        }
    }

    hideAllPreviews() {
        this.previewElements.forEach(el => this.hidePreview(el));
        if (this.isMobile && this.mobileOverlay) { this.mobileOverlay.style.opacity = '0'; this.mobileOverlay.style.visibility = 'hidden'; }
    }

    keepPreviewVisible(element) {
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        icon.classList.add('active');
        frame.classList.add('active');
    }

    preloadImages() {
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const imgSrc = icon?.getAttribute('data-preview-src');
            if (imgSrc) new Image().src = imgSrc;
        });
    }

    refresh() {
        this.cacheElements();
        this.bindEvents();
    }
}

/* =========================================
   2. COSMIC RIFT ENGINE (FRESH RESET LOGIC)
   ========================================= */
class CosmicRiftEngine {
    constructor() {
        this.cards = document.querySelectorAll('.cosmic-card');
        this.instances = [];
        this.init();
    }

    init() {
        const config = {
            'card-courses': { color: '#00f7ff', shadow: 'rgba(0,247,255,0.6)' },
            'card-participation': { color: '#bc13fe', shadow: 'rgba(188,19,254,0.6)' },
            'card-achievements': { color: '#ffd700', shadow: 'rgba(255,215,0,0.6)' },
            'card-archive': { color: '#00e0b0', shadow: 'rgba(0,224,176,0.6)' }
        };

        this.cards.forEach(card => {
            let theme = { color: '#ffffff', shadow: 'rgba(255,255,255,0.5)' };
            for (const [cls, cfg] of Object.entries(config)) if (card.classList.contains(cls)) theme = cfg;
            
            // Create or get canvas
            let canvas = card.querySelector('.cosmic-rift-canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.className = 'cosmic-rift-canvas';
                card.appendChild(canvas);
            }
            
            // Store instance
            const rift = new CardRift(card, canvas, theme);
            this.instances.push(rift);
        });
    }

    // THE NUCLEAR OPTION: Destroy all instances and re-initialize
    reset() {
        this.instances.forEach(rift => rift.destroy());
        this.instances = [];
        this.init();
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

        // Named handlers for clean removal
        this.boundMouseEnter = () => { this.isHovering = true; this.startAnimation(); };
        this.boundMouseLeave = () => { this.isHovering = false; };
        
        // Initial setup
        this.resize();
        this.bindEvents();
    }

    bindEvents() {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.card);
        
        this.card.addEventListener('mouseenter', this.boundMouseEnter);
        this.card.addEventListener('mouseleave', this.boundMouseLeave);
    }

    // Full cleanup to prevent ghosts or memory leaks
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        this.card.removeEventListener('mouseenter', this.boundMouseEnter);
        this.card.removeEventListener('mouseleave', this.boundMouseLeave);
        
        if (this.resizeObserver) this.resizeObserver.disconnect();
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        
        const displayWidth = this.card.offsetWidth + 20;
        const displayHeight = this.card.offsetHeight + 20;

        if (displayWidth === 0 || displayHeight === 0) return;

        this.canvas.width = Math.floor(displayWidth * dpr);
        this.canvas.height = Math.floor(displayHeight * dpr);

        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); 
        this.ctx.scale(dpr, dpr); 

        this.width = displayWidth;
        this.height = displayHeight;
    }

    startAnimation() { if (!this.animationId) this.loop(); }

    loop() {
        this.time += 0.05;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.isHovering) this.spawnEnergy();
        this.updateParticles();
        
        if (this.particles.length === 0 && !this.isHovering) { 
            this.animationId = null; 
            this.ctx.clearRect(0, 0, this.width, this.height);
            return; 
        }
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    spawnEnergy() {
        if (Math.random() > 0.3) return;
        
        const corners = [
            { x: 10, y: 10, vx: 1, vy: 1 }, 
            { x: this.width - 10, y: 10, vx: -1, vy: 1 },
            { x: 10, y: this.height - 10, vx: 1, vy: -1 }, 
            { x: this.width - 10, y: this.height - 10, vx: -1, vy: -1 }
        ];
        
        const corner = corners[Math.floor(Math.random() * corners.length)];
        const isHorizontal = Math.random() > 0.5;
        
        this.particles.push({
            x: corner.x, y: corner.y, 
            life: 1.0, 
            decay: 0.02 + Math.random() * 0.03,
            path: [], 
            direction: isHorizontal ? 'h' : 'v',
            signX: corner.vx, signY: corner.vy, 
            wobbleOffset: Math.random() * 100
        });
    }

    updateParticles() {
        this.ctx.lineCap = 'round'; 
        this.ctx.shadowBlur = 15; 
        this.ctx.shadowColor = this.theme.shadow;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]; 
            const speed = 4;
            
            if (p.direction === 'h') p.x += speed * p.signX; else p.y += speed * p.signY;
            
            const jitter = Math.sin(this.time * 2 + p.wobbleOffset) * 2 + (Math.random() - 0.5) * 3;
            
            if (p.direction === 'h') p.path.push({ x: p.x, y: p.y + jitter }); 
            else p.path.push({ x: p.x + jitter, y: p.y });
            
            this.ctx.beginPath(); 
            this.ctx.strokeStyle = this.theme.color; 
            this.ctx.lineWidth = 2 * p.life; 
            this.ctx.globalAlpha = p.life;
            
            if (p.path.length > 1) {
                this.ctx.moveTo(p.path[0].x, p.path[0].y);
                for (let j = 1; j < p.path.length; j++) this.ctx.lineTo(p.path[j].x, p.path[j].y);
                this.ctx.stroke();
            }
            
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        this.ctx.globalAlpha = 1; 
        this.ctx.shadowBlur = 0;
    }
}

/* ===========================================================
   3. PAGE STATE MANAGEMENT
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    window.certificatePreview = new CertificatePreview();
    window.cosmicRiftEngine = new CosmicRiftEngine();

    const certHome = document.getElementById('certificates'); 
    const openCertBtn = document.getElementById('openCertificatesPage'); 
    const openCoursesCard = document.getElementById('openCoursesPage'); 
    const collapseBtn = document.getElementById('collapseBtn'); 
    const coursesPage = document.getElementById('coursesCertifications'); 
    const coursesBackBtn = document.getElementById('backToCertCategories');
    const programsContainer = document.getElementById('coursesProgramsContainer');

    // --- Initial State ---
    hideCertificatesHome();
    hideCoursesPage();

    // --- Event Listeners ---
    if (collapseBtn) collapseBtn.addEventListener('click', () => { hideCoursesPage(); hideCertificatesHome(); });

    // Sync with About Section
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const observer = new MutationObserver(() => {
            if (aboutSection.classList.contains('show')) {
                hideCertificatesHome();
                hideCoursesPage();
            }
        });
        observer.observe(aboutSection, { attributes: true, attributeFilter: ['class'] });
    }

    if (openCertBtn) openCertBtn.addEventListener('click', () => { showCertificatesHome(); hideCoursesPage(); });
    if (openCoursesCard) openCoursesCard.addEventListener('click', () => { hideCertificatesHome(); showCoursesPage(); });
    
    // BACK BUTTON: Triggers the reset + navigation
    if (coursesBackBtn) {
        coursesBackBtn.addEventListener('click', () => { 
            hideCoursesPage(); 
            showCertificatesHome(); 
        });
    }

    // --- EXPANSION LOGIC ---
    if (programsContainer) {
        programsContainer.addEventListener('click', e => {
            // 1. Program Card Expansion
            const header = e.target.closest('.program-header');
            if (header) {
                const card = header.closest('.program-card');
                const arrow = card.querySelector('.arrow-icon');
                const expanded = card.classList.toggle('expanded');

                if (expanded) {
                    if (arrow) arrow.classList.add('open');
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 300);
                } else {
                    if (arrow) arrow.classList.remove('open');
                }
                return;
            }

            // 2. Included Courses Toggle
            const toggleBtn = e.target.closest('.courses-toggle-btn');
            if (toggleBtn) {
                const list = toggleBtn.nextElementSibling;
                if (list && list.classList.contains('sub-course-list')) {
                    const isVisible = list.style.display === 'block';
                    list.style.display = isVisible ? 'none' : 'block';
                    toggleBtn.querySelector('span').textContent = isVisible ? '▶ Show Included Courses' : '▼ Hide Included Courses';
                }
            }
        });
    }

    /* =======================================================
       RENDER COURSES DATA
       ======================================================= */
    if (programsContainer) {
        fetch('data/courses_certifications.json')
            .then(res => res.json())
            .then(data => renderPrograms(data.programs))
            .catch(err => console.error('Failed to load courses data', err));
    }

    function renderPrograms(programs) {
        programsContainer.innerHTML = '';
        programs.forEach(program => {
            const card = document.createElement('div');
            card.className = 'program-card';

            const header = document.createElement('button');
            header.className = 'program-header';
            header.type = 'button';
            header.innerHTML = `
                <div class="program-title-wrap">
                    <span class="program-main-title">${program.title}</span>
                    <span class="program-subtitle-date">${program.platform} • ${program.dateRange}</span>
                </div>
                <div class="arrow-icon">▼</div>
            `;

            // Content Body
            const body = document.createElement('div');
            body.className = 'program-body';

            // -- Sub-courses logic --
            let coursesHtml = '';
            if (program.courses && program.courses.length > 0) {
                coursesHtml = `
                <div class="courses-list-section">
                    <button class="courses-toggle-btn" type="button">
                        <span>▶ Show Included Courses (${program.courses.length})</span>
                    </button>

                    <ul class="sub-course-list">

                        ${program.courses.map((c, i) => `
                        <li class="sub-course-item">

                            <div class="sub-course-main">
                                <span class="sub-course-index">${(i+1).toString().padStart(2,'0')}</span>

                                <div class="sub-course-text">
                                    <span class="sub-course-title">${c.title}</span>

                                    ${c.description ? `
                                        <p class="sub-course-desc">${c.description}</p>
                                    ` : ''}

                                    ${c.skills && c.skills.length ? `
                                        <div class="sub-course-skills">
                                            ${c.skills.map(s => `<span class="subcourse-skill cosmic">${s}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>

                            <div class="sub-course-actions">

                                <a href="${c.verifyUrl}" target="_blank" class="verify-link">
                                    Verify
                                </a>

                                ${c.certificateImage ? `
                                <div class="certificate-item cert-with-preview" style="border:none;padding:0;min-height:auto;">
                                    <div class="cert-preview-wrap" style="margin:0;">
                                        
                                        <div class="cert-icon" data-preview-src="${c.certificateImage}">
                                            <div class="cert-icon-visual">
                                                <div class="sv-icon">
                                                    <img src="assets/logos/certificate.svg" alt="Certificate Icon">
                                                </div>
                                            </div>

                                            <span class="cert-ripple"></span>
                                            <span class="cert-ripple cert-ripple--2"></span>
                                            <span class="cert-ripple cert-ripple--3"></span>
                                        </div>

                                        <div class="cert-preview-frame" aria-hidden="true">
                                            <div class="cert-preview-inner">
                                                <img class="cert-preview-img" src="${c.certificateImage}">
                                                <div class="cert-gradient-border"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ` : ''}

                            </div>

                        </li>
                        `).join('')}

                    </ul>
                </div>`;
            }

            body.innerHTML = `
                <div class="program-content-grid">
                    <div class="program-details">
                        <div class="meta-row">
                            <div class="meta-item"><strong>Issuer:</strong> ${program.issuer}</div>
                            <div class="meta-item"><strong>Credential:</strong> <a href="${program.credentialUrl}" target="_blank" class="meta-link">Verify ID</a></div>
                        </div>
                        <p class="program-desc">${program.description}</p>
                        <div class="skills-container">${program.skills.map(s => `<span class="skill-pill cosmic">${s}</span>`).join('')}</div>
                        ${coursesHtml}
                    </div>
                    <div class="program-cert-preview">
                        <div class="certificate-item cert-with-preview" style="border:none;padding:0;min-height:auto;">
                            <div class="cert-preview-wrap" style="margin:0;">
                                <div class="cert-icon" data-preview-src="${program.programCertificate.image}">
                                    <div class="cert-icon-visual">
                                        <div class="sv-icon"><img src="assets/logos/certificate.svg" alt="Certificate Icon"></div>
                                    </div>
                                    <span class="cert-ripple"></span>
                                    <span class="cert-ripple cert-ripple--2"></span>
                                    <span class="cert-ripple cert-ripple--3"></span>
                                </div>
                                <div class="cert-preview-frame" aria-hidden="true">
                                    <div class="cert-preview-inner">
                                        <img class="cert-preview-img" src="${program.programCertificate.image}" alt="Certificate Preview">
                                        <div class="cert-gradient-border"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            card.appendChild(header);
            card.appendChild(body);
            programsContainer.appendChild(card);
        });

        if (window.certificatePreview) window.certificatePreview.refresh();
    }

    /* ------------------------
       Helper state functions
       ------------------------ */

    function showCertificatesHome() {
        if (!certHome) return;
        certHome.classList.add('show');
        certHome.style.opacity = '1';
        
        // --- THIS IS THE CRITICAL FIX ---
        // Every time we show the home, we completely RESET the cosmic cards.
        if (window.cosmicRiftEngine) window.cosmicRiftEngine.reset();
    }

    function hideCertificatesHome() {
        if (!certHome) return;
        certHome.classList.remove('show');
        certHome.style.opacity = '0';
    }

    function showCoursesPage() {
        if (!coursesPage) return;
        coursesPage.classList.add('show');
    }

    function hideCoursesPage() {
        if (!coursesPage) return;
        coursesPage.classList.remove('show');
        // Reset scroll position like About page does
        if (programsContainer) programsContainer.scrollTop = 0;
    }
});