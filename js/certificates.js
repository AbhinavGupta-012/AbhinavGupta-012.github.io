/* ===========================================================
   CERTIFICATES SYSTEM (FULL)
   - CertificatePreview: Handles hover previews (Desktop) & Click + Auto-close (Mobile).
   - CosmicRiftEngine: Handles particle effects on cards.
   - Logic: Fetches JSON data and renders the UI.
   =========================================================== */

/* =========================================
   1. CERTIFICATE PREVIEW SYSTEM
   ========================================= */
class CertificatePreview {
    constructor() {
        this.previewElements = [];
        this.isMobile = this.detectMobile();
        this.autoCloseTimer = null; // Store timer reference
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.preloadImages();
    }

    detectMobile() {
        // Check for touch capability or coarse pointer (standard for mobile/tablet)
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches || ('ontouchstart' in window);
    }

    cacheElements() {
        this.previewElements = document.querySelectorAll('.cert-with-preview');
        if (this.isMobile) this.createMobileOverlay();
    }

    createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'cert-mobile-overlay';
        
        // Transparent overlay for mobile logic
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: transparent;
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all .3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        `; 
        document.body.appendChild(overlay);
        this.mobileOverlay = overlay;
    }

    bindEvents() {
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const frame = element.querySelector('.cert-preview-frame');

            if (this.isMobile) {
                // --- MOBILE / TOUCH LOGIC ---
                if (icon) {
                    icon.addEventListener('click', e => { 
                        e.stopPropagation(); 
                        this.togglePreview(element); 
                    });
                }
            } else {
                // --- DESKTOP LOGIC ---
                if (icon) {
                    icon.addEventListener('mouseenter', () => this.showPreview(element));
                    icon.addEventListener('mouseleave', () => this.hidePreview(element));
                }
                if (frame) {
                    frame.addEventListener('mouseenter', () => this.keepPreviewVisible(element));
                    frame.addEventListener('mouseleave', () => this.hidePreview(element));
                }
            }

            // Accessibility (Keyboard)
            if (icon) {
                icon.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') { 
                        e.preventDefault(); 
                        this.togglePreview(element); 
                    }
                });
            }
        });

        // Global Close
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.hideAllPreviews(); });
        
        if (this.isMobile) {
            window.addEventListener('scroll', () => this.hideAllPreviews());
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.cert-with-preview')) {
                    this.hideAllPreviews();
                }
            });
        }
    }

    showPreview(element) {
        this.hideAllPreviews();
        
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        
        if (icon) icon.classList.add('active');
        if (frame) frame.classList.add('active');

        // --- MOBILE: AUTO-CLOSE ---
        if (this.isMobile) {
            if (this.mobileOverlay) { 
                this.mobileOverlay.style.opacity = '1'; 
                this.mobileOverlay.style.visibility = 'visible'; 
            }

            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = setTimeout(() => {
                this.hidePreview(element);
                if (this.mobileOverlay) { 
                    this.mobileOverlay.style.opacity = '0'; 
                    this.mobileOverlay.style.visibility = 'hidden'; 
                }
            }, 3500); 
        }
    }

    hidePreview(element) {
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        
        if (icon) icon.classList.remove('active');
        if (frame) frame.classList.remove('active');
    }

    togglePreview(element) {
        const frame = element.querySelector('.cert-preview-frame');
        const isActive = frame && frame.classList.contains('active');

        if (isActive) {
            this.hidePreview(element);
            clearTimeout(this.autoCloseTimer);
            if (this.isMobile && this.mobileOverlay) { 
                this.mobileOverlay.style.opacity = '0'; 
                this.mobileOverlay.style.visibility = 'hidden'; 
            }
        } else {
            this.showPreview(element);
        }
    }

    hideAllPreviews() {
        clearTimeout(this.autoCloseTimer);
        this.previewElements.forEach(el => this.hidePreview(el));
        if (this.isMobile && this.mobileOverlay) { 
            this.mobileOverlay.style.opacity = '0'; 
            this.mobileOverlay.style.visibility = 'hidden'; 
        }
    }

    keepPreviewVisible(element) {
        if (this.isMobile) return;
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        if (icon) icon.classList.add('active');
        if (frame) frame.classList.add('active');
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
   2. COSMIC RIFT ENGINE
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
            
            let canvas = card.querySelector('.cosmic-rift-canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.className = 'cosmic-rift-canvas';
                card.appendChild(canvas);
            }
            
            const rift = new CardRift(card, canvas, theme);
            this.instances.push(rift);
        });
    }

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

        this.boundMouseEnter = () => { this.isHovering = true; this.startAnimation(); };
        this.boundMouseLeave = () => { this.isHovering = false; };
        
        this.resize();
        this.bindEvents();
    }

    bindEvents() {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.card);
        this.card.addEventListener('mouseenter', this.boundMouseEnter);
        this.card.addEventListener('mouseleave', this.boundMouseLeave);
    }

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
            life: 1.0, decay: 0.02 + Math.random() * 0.03,
            path: [], direction: isHorizontal ? 'h' : 'v',
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
   3. PAGE STATE MANAGEMENT & LOGIC
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    window.certificatePreview = new CertificatePreview();
    window.cosmicRiftEngine = new CosmicRiftEngine();

    const certHome = document.getElementById('certificates'); 
    const openCertBtn = document.getElementById('openCertificatesPage'); 
    const collapseBtn = document.getElementById('collapseBtn'); 
    const coursesPage = document.getElementById('coursesCertifications'); 
    const coursesBackBtn = document.getElementById('backToCertCategories');
    const programsContainer = document.getElementById('coursesProgramsContainer');
    const modalTitle = document.getElementById('certModalTitle');

    // Button refs
    const openCoursesCard = document.getElementById('openCoursesPage');
    const openParticipationCard = document.getElementById('openParticipationPage');
    const openAchievementsCard = document.getElementById('openAchievementsPage');
    const openArchiveCard = document.getElementById('openArchivePage');

    // Initial State
    hideCertificatesHome();
    hideCoursesPage();

    // Listeners
    if (collapseBtn) collapseBtn.addEventListener('click', () => { hideCoursesPage(); hideCertificatesHome(); });

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
    
    // Category Openers
    if (openCoursesCard) {
        openCoursesCard.addEventListener('click', () => { 
            hideCertificatesHome(); 
            openCategoryMode('courses', 'Courses', 'data/courses_certifications.json');
        });
    }
    if (openParticipationCard) {
        openParticipationCard.addEventListener('click', () => { 
            hideCertificatesHome(); 
            openCategoryMode('participation', 'Participation', 'data/participations_certifications.json');
        });
    }
    if (openAchievementsCard) {
        openAchievementsCard.addEventListener('click', () => { 
            hideCertificatesHome(); 
            openCategoryMode('achievements', 'Achievements', 'data/achievements_certifications.json');
        });
    }
    if (openArchiveCard) {
        openArchiveCard.addEventListener('click', () => { 
            hideCertificatesHome(); 
            openCategoryMode('archive', 'Archive', 'data/archive_certifications.json');
        });
    }

    if (coursesBackBtn) {
        coursesBackBtn.addEventListener('click', () => { 
            hideCoursesPage(); 
            showCertificatesHome(); 
        });
    }

    // Expansion Logic
    if (programsContainer) {
        programsContainer.addEventListener('click', e => {
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

            const toggleBtn = e.target.closest('.courses-toggle-btn');
            if (toggleBtn) {
                const list = toggleBtn.nextElementSibling;
                if (list && list.classList.contains('sub-course-list')) {
                    const isVisible = list.style.display === 'block';
                    list.style.display = isVisible ? 'none' : 'block';
                    const span = toggleBtn.querySelector('span');
                    if (span) {
                        const countText = span.textContent.match(/\(\d+\)/)?.[0] || '';
                        span.textContent = isVisible ? `▶ Included Modules ${countText}` : `▼ Hide Modules ${countText}`;
                    }
                }
            }
        });
    }

    // Data Fetching
    function loadCategoryData(jsonFile) {
        if (!programsContainer) return;
        programsContainer.style.opacity = '0.5';
        programsContainer.innerHTML = '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.5);">Loading data...</div>';

        fetch(jsonFile)
            .then(res => res.json())
            .then(data => {
                renderPrograms(data.programs);
                programsContainer.style.opacity = '1';
                if (window.certificatePreview) window.certificatePreview.refresh();
            })
            .catch(err => {
                console.error('Failed to load data:', err);
                programsContainer.innerHTML = `<div style="padding:40px;text-align:center;color:#ff4d4d;">Failed to load data.</div>`;
                programsContainer.style.opacity = '1';
            });
    }

    // --- RENDER LOGIC WITH DESCRIPTION & SKILLS ---
    function renderPrograms(programs) {
        programsContainer.innerHTML = '';
        if (!programs || programs.length === 0) {
            programsContainer.innerHTML = '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.5);">No certificates found.</div>';
            return;
        }

        programs.forEach(program => {
            const card = document.createElement('div');
            card.className = 'program-card';

            const header = document.createElement('button');
            header.className = 'program-header';
            header.type = 'button';
            header.innerHTML = `
                <div class="program-title-wrap">
                    <span class="program-main-title">${program.title}</span>
                    <span class="program-subtitle-date">${program.platform} // ${program.dateRange}</span>
                </div>
                <div class="arrow-icon">▼</div>
            `;

            const body = document.createElement('div');
            body.className = 'program-body';

            let coursesHtml = '';
            if (program.courses && program.courses.length > 0) {
                coursesHtml = `
                <div class="courses-list-section">
                    <button class="courses-toggle-btn" type="button">
                        <span>▶ Included Modules (${program.courses.length})</span>
                    </button>
                    <ul class="sub-course-list">
                        ${program.courses.map((c, i) => {
                            // Sub-skills Logic
                            let subSkillsHtml = '';
                            if (c.skills) {
                                const skillsArr = Array.isArray(c.skills) ? c.skills : c.skills.split(',');
                                if(skillsArr.length > 0 && skillsArr[0] !== '') {
                                    subSkillsHtml = `
                                    <div class="sub-course-skills">
                                        ${skillsArr.map(s => `<span class="sub-skill-pill">${s.trim()}</span>`).join('')}
                                    </div>`;
                                }
                            }

                            return `
                            <li class="sub-course-item">
                                <div class="sub-course-main">
                                    <span class="sub-course-index">${(i+1).toString().padStart(2,'0')}</span>
                                    <div class="sub-course-text">
                                        <span class="sub-course-title">${c.title}</span>
                                        ${c.description ? `<p class="sub-course-desc">${c.description}</p>` : ''}
                                        ${subSkillsHtml}
                                    </div>
                                </div>
                                <div class="sub-course-actions">
                                    <a href="${c.verifyUrl}" target="_blank" class="verify-link">Verify</a>
                                    ${c.certificateImage ? `
                                    <div class="certificate-item cert-with-preview" style="border:none;padding:0;min-height:auto;">
                                        <div class="cert-preview-wrap" style="margin:0;">
                                            <div class="cert-icon" data-preview-src="${c.certificateImage}">
                                                <div class="cert-icon-visual">
                                                    <div class="sv-icon" style="width:20px;height:20px;">
                                                        <img src="assets/logos/certificate.svg" style="width:14px;filter:invert(1);">
                                                    </div>
                                                </div>
                                                <span class="cert-ripple"></span>
                                            </div>
                                            <div class="cert-preview-frame" aria-hidden="true">
                                                <div class="cert-preview-inner">
                                                    <img class="cert-preview-img" src="${c.certificateImage}">
                                                    <div class="cert-gradient-border"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>` : ''}
                                </div>
                            </li>
                            `;
                        }).join('')}
                    </ul>
                </div>`;
            }

            body.innerHTML = `
                <div class="program-content-grid">
                    <div class="program-details">
                        <div class="meta-row">
                            <div class="meta-item"><strong>Issuer:</strong> ${program.issuer}</div>
                            ${program.id ? `<div class="meta-item"><strong>Credential:</strong> <a href="${program.credentialUrl}" target="_blank" class="meta-link">ID: ${program.id}</a></div>` : ''}
                        </div>
                        <div class="skills-container">
                            ${(Array.isArray(program.skills) ? program.skills : (program.skills ? program.skills.split(',') : [])).map(s => `<span class="skill-pill">${s}</span>`).join('')}
                        </div>
                        <p class="program-desc">${program.description}</p>
                        ${coursesHtml}
                    </div>
                    ${program.programCertificate && program.programCertificate.image ? `
                    <div class="program-cert-preview">
                        <div class="certificate-item cert-with-preview" style="border:none;padding:0;min-height:auto;">
                            <div class="cert-preview-wrap" style="margin:0;">
                                <div class="cert-icon" style="width:60px;height:60px;" data-preview-src="${program.programCertificate.image}">
                                    <div class="cert-icon-visual">
                                        <div class="sv-icon" style="width:30px;height:30px;"><img src="assets/logos/certificate.svg"></div>
                                    </div>
                                    <span class="cert-ripple"></span>
                                </div>
                                <div class="cert-preview-frame" aria-hidden="true">
                                    <div class="cert-preview-inner">
                                        <img class="cert-preview-img" src="${program.programCertificate.image}">
                                        <div class="cert-gradient-border"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>` : ''}
                </div>`;

            card.appendChild(header);
            card.appendChild(body);
            programsContainer.appendChild(card);
        });
    }

    function showCertificatesHome() {
        if (!certHome) return;
        certHome.classList.add('show');
        certHome.style.opacity = '1';
        if (window.cosmicRiftEngine) window.cosmicRiftEngine.reset();
    }

    function hideCertificatesHome() {
        if (!certHome) return;
        certHome.classList.remove('show');
        certHome.style.opacity = '0';
    }

    function openCategoryMode(category, title, jsonFile) {
        if (!coursesPage) return;
        coursesPage.classList.remove('category-mode-courses', 'category-mode-participation', 'category-mode-achievements', 'category-mode-archive');
        coursesPage.classList.add(`category-mode-${category}`);
        if (modalTitle) modalTitle.textContent = title;
        loadCategoryData(jsonFile);
        showCoursesPage();
    }

    function showCoursesPage() {
        if (!coursesPage) return;
        coursesPage.classList.add('show');
    }

    function hideCoursesPage() {
        if (!coursesPage) return;
        coursesPage.classList.remove('show');
        if (programsContainer) programsContainer.scrollTop = 0;
    }
});