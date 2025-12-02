// js/navigation.js
// ==============================
// This file is responsible ONLY for navigation logic:
// - Handling nav button clicks
// - Showing / hiding sections
// - Managing active button states
// - Delegating animations to their own files (about.js, timeline.js)
// ==============================

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
    // Hide all sections that might be visible
    document.querySelectorAll("section")
        .forEach(sec => sec.classList.remove("show", "expanded"));

    // Stop timeline animation if it's active
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
