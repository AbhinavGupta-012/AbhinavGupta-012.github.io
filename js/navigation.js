// js/navigation.js
// ==============================
// This file is responsible ONLY for navigation logic:
// - Handling nav button clicks
// - Showing / hiding sections
// - Managing active button states
// - Delegating animations to their own files (about.js, timeline.js)
// ==============================
// Cleanly collapse About (reset scroll + hide extras)
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
// Utility: Hide all sections (reset state)
// ---------------------------------------------
function hideAllSections() {

    // ⭐ FIRST — cleanly reset About if it was open
    resetAboutSection();

    // THEN hide all sections normally
    document.querySelectorAll("section")
        .forEach(sec => sec.classList.remove("show", "expanded"));

    const certPage = document.getElementById("certificates");
    if (certPage) certPage.classList.remove("show");

    if (window.timelineAnimation) {
        window.timelineAnimation.hide();
    }
}


// ---------------------------------------------
// Helper: Add blur to all canvases
// ---------------------------------------------
function addCanvasBlur() {
    document.querySelectorAll("canvas")
        .forEach(c => c.classList.add("canvas-blur"));
}

// ---------------------------------------------
// Helper: Remove blur from all canvases
// ---------------------------------------------
function removeCanvasBlur() {
    document.querySelectorAll("canvas")
        .forEach(c => c.classList.remove("canvas-blur"));
}

// ---------------------------------------------
// Main Navigation Setup (after DOM is loaded)
// ---------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 1. Standard Navbar Navigation
    document.querySelectorAll("#mainNav .button").forEach(btn => {
        btn.addEventListener("click", () => {
            const label = btn.querySelector(".actual-text").textContent.trim();

            // Step 1: Reset everything
            hideAllSections();

            // Step 2: Handle navigation based on button label
            switch (label) {

                case "Home":
                    clearActive();
                    const nav = document.getElementById('mainNav');
                    removeCanvasBlur();
                    nav.classList.remove('show');
                    break;

                case "About":
                    // Show About section (collapsed by default)
                    document.querySelector(".about")?.classList.add("show");
                    addCanvasBlur();   // <-- BLUR ONLY HERE
                    setActive("About");
                    break;

                case "Timeline":
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
                    break;

                case "Achievements":
                    document.querySelector(".achievements")?.classList.add("show");
                    removeCanvasBlur();
                    setActive("Achievements");
                    break;

                case "Resume":
                    document.querySelector(".resume")?.classList.add("show");
                    removeCanvasBlur();
                    setActive("Resume");
                    break;

                default:
                    clearActive();
            }
        });
    });

    // 2. CERTIFICATES PAGE LOGIC
    const openCertLink = document.getElementById("openCertificatesPage");
    const backToAboutBtn = document.getElementById("backToAbout");
    const aboutSection = document.querySelector(".about");
    const certPage = document.getElementById("certificates");

    // A. Open Certificates Page
    if (openCertLink) {
        openCertLink.addEventListener("click", () => {
            // Hide About WITHOUT removing 'expanded' class to preserve state
            aboutSection.classList.remove("show");
            
            // Show Certificates Page
            certPage.classList.add("show");
            
            // Remove blur for the clean cosmic view
            removeCanvasBlur();
            
            // Keep 'About' active in navbar
            setActive("About");
        });
    }

    // B. Back Button (Return to About)
    if (backToAboutBtn) {
        backToAboutBtn.addEventListener("click", () => {
            // Hide Certificates Page
            certPage.classList.remove("show");
            
            // Show About again (it retains its expanded state if it had it)
            aboutSection.classList.add("show");
            
            // Re-apply blur since we are back in About
            addCanvasBlur();
            
            // Ensure About is still active
            setActive("About");
        });
    }
});

// ---------------------------------------------
// Event: Blackhole expanded (initial reveal)
// ---------------------------------------------
document.addEventListener('blackholeExpanded', () => {
    const nav = document.getElementById('mainNav');
    const aboutSection = document.querySelector(".about");

    nav.classList.add('show');
    if (aboutSection) {
        aboutSection.classList.add('show');
        addCanvasBlur();   // <-- About is the first screen shown → blur
    }

    setActive("About");
});