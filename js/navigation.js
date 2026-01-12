// js/navigation.js

// ---------------------------------------------
// Utility: Remove 'active' from all nav buttons
// ---------------------------------------------
function clearActive() {
    document.querySelectorAll('#mainNav .button')
        .forEach(btn => btn.classList.remove('active'));
}

// ---------------------------------------------
// Utility: Set one nav button as active by label
// ---------------------------------------------
function setActive(label) {
    clearActive();
    const btn = Array.from(document.querySelectorAll('#mainNav .button'))
        .find(b => b.querySelector('.actual-text').textContent.trim() === label);
    if (btn) btn.classList.add('active');
}

// ---------------------------------------------
// Utility: Cleanly collapse About (reset scroll + hide extras)
// ---------------------------------------------
function resetAboutSection() {
    const about = document.querySelector(".about");
    if (!about) return;

    const card = about.querySelector(".about-card");
    if (card) card.scrollTop = 0;

    const extra = document.querySelector(".extra-content-container");
    if (extra) extra.classList.remove("show");

    about.classList.remove("expanded");
}

// ---------------------------------------------
// Utility: Hide all sections (reset state)
// ---------------------------------------------
function hideAllSections() {
    resetAboutSection();

    // Hide all main sections
    document.querySelectorAll("section")
        .forEach(sec => sec.classList.remove("show", "expanded"));

    // Force hide Certificates Page
    const certPage = document.getElementById("certificates");
    if (certPage) {
        certPage.classList.remove("show");
        certPage.style.opacity = '0';
        setTimeout(() => { certPage.style.opacity = ''; }, 500);
    }

    // Force hide Courses Modal
    const coursesPage = document.getElementById("coursesCertifications");
    if (coursesPage) {
        coursesPage.classList.remove("show");
    }

    // Hide Timeline
    if (window.timelineAnimation) {
        window.timelineAnimation.hide();
    }

    // --- CRITICAL: Hide Mobile Filter Button by default ---
    // It only shows if we specifically hit the 'Projects' case below
    const filterBtn = document.getElementById('filterFloatingBtn');
    if (filterBtn) {
        filterBtn.classList.remove('visible');
    }
}

// ---------------------------------------------
// Helper: Blur Canvas
// ---------------------------------------------
function addCanvasBlur() {
    document.querySelectorAll("canvas").forEach(c => c.classList.add("canvas-blur"));
}

function removeCanvasBlur() {
    document.querySelectorAll("canvas").forEach(c => c.classList.remove("canvas-blur"));
}

// =============================================
// MAIN INITIALIZATION (Wait for DOM)
// =============================================
document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------
    // 1. DESKTOP NAVIGATION
    // -----------------------------------------
    document.querySelectorAll("#mainNav .button").forEach(btn => {
        btn.addEventListener("click", () => {
            const label = btn.querySelector(".actual-text").textContent.trim();
            hideAllSections();

            switch (label) {
                case "Home":
                    clearActive();
                    document.getElementById('mainNav').classList.remove('show');

                    // Also hide mobile nav toggle on Home
                    const mobileToggle = document.getElementById('mobileNavToggle');
                    if (mobileToggle) mobileToggle.classList.remove('reveal');

                    removeCanvasBlur();
                    break;

                case "About":
                    document.querySelector(".about")?.classList.add("show");
                    addCanvasBlur();
                    setActive("About");
                    break;

                case "Coming Soon...":
                    document.querySelector(".timeline-section")?.classList.add("show");
                    removeCanvasBlur();
                    if (window.timelineAnimation) {
                        setTimeout(() => window.timelineAnimation.show(), 50);
                    } else if (typeof initTimelineAnimation === "function") {
                        window.timelineAnimation = initTimelineAnimation();
                        window.timelineAnimation.show();
                    }
                    setActive("Timeline");
                    break;

                case "Projects":
                    document.querySelector(".projects")?.classList.add("show");
                    removeCanvasBlur();
                    setActive("Projects");

                    // --- CRITICAL: SHOW Filter Button only here ---
                    const filterBtn = document.getElementById('filterFloatingBtn');
                    if (filterBtn) {
                        // Small delay to make it pop in after page transition
                        setTimeout(() => filterBtn.classList.add('visible'), 300);
                    }
                    break;

                // case "Achievements":
                //     document.querySelector(".achievements")?.classList.add("show");
                //     removeCanvasBlur();
                //     setActive("Achievements");
                //     break;

                // case "Resume":
                //     document.querySelector(".resume")?.classList.add("show");
                //     removeCanvasBlur();
                //     setActive("Resume");
                //     break;

                default:
                    clearActive();
            }
        });
    });

    // -----------------------------------------
    // 2. CERTIFICATES & COURSES LOGIC
    // -----------------------------------------
    const openCertLink = document.getElementById("openCertificatesPage");
    const backToAboutBtn = document.getElementById("backToAbout");
    const aboutSection = document.querySelector(".about");
    const certPage = document.getElementById("certificates");
    const coursesPage = document.getElementById("coursesCertifications");
    const backToCertCategories = document.getElementById("backToCertCategories");

    if (openCertLink) {
        openCertLink.addEventListener("click", () => {
            aboutSection.classList.remove("show");
            certPage.classList.add("show");
            removeCanvasBlur();
            setActive("About");
        });
    }

    if (backToAboutBtn) {
        backToAboutBtn.addEventListener("click", () => {
            certPage.classList.remove("show");
            certPage.style.opacity = '0';
            aboutSection.classList.add("show");
            addCanvasBlur();
            setActive("About");
        });
    }

    const categoryIds = ["openCoursesPage", "openParticipationPage", "openAchievementsPage", "openArchivePage"];
    categoryIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn && coursesPage) {
            btn.addEventListener("click", () => {
                certPage.classList.remove("show");
                certPage.style.opacity = '0';
                coursesPage.classList.add("show");
                addCanvasBlur();
                setActive("About");
            });
        }
    });

    if (backToCertCategories && coursesPage) {
        backToCertCategories.addEventListener("click", () => {
            coursesPage.classList.remove("show");
            certPage.classList.add("show");
            certPage.style.opacity = '1';
        });
    }

    // -----------------------------------------
    // 3. MOBILE NAVIGATION
    // -----------------------------------------
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    function toggleMobileNav() {
        mobileNavToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('mobile-nav-open');
    }

    function closeMobileNav() {
        if (mobileNavToggle) mobileNavToggle.classList.remove('active');
        if (mobileNav) mobileNav.classList.remove('active');
        if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('mobile-nav-open');
    }

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', toggleMobileNav);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileNav);
    }

    mobileNavItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');

            mobileNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            setTimeout(() => {
                closeMobileNav();

                // Trigger navigation
                if (target === 'home') {
                    document.querySelector('.button[id="collapseBtn"]').click();
                } else {
                    const desktopBtn = Array.from(document.querySelectorAll("#mainNav .button")).find(btn => {
                        return btn.querySelector(".actual-text").textContent.trim().toLowerCase() === target;
                    });

                    if (desktopBtn) {
                        desktopBtn.click();
                    }
                }
            }, 300);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileNav();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMobileNav();
    });

}); // End DOMContentLoaded

// ---------------------------------------------
// EVENT: Blackhole expanded (Reveal Nav)
// ---------------------------------------------
document.addEventListener('blackholeExpanded', () => {
    const nav = document.getElementById('mainNav');
    const mobileToggle = document.getElementById('mobileNavToggle');
    const aboutSection = document.querySelector(".about");

    // Show Desktop Nav
    nav.classList.add('show');

    // --- CRITICAL: Reveal Mobile Toggle ---
    if (mobileToggle) {
        mobileToggle.classList.add('reveal');
    }

    // Show Default Section (About)
    if (aboutSection) {
        aboutSection.classList.add('show');
        addCanvasBlur();
    }
    setActive("About");
});