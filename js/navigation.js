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
                    // Just clear active state and show nothing
                    clearActive();
                    const nav = document.getElementById('mainNav');
                    nav.classList.remove('show');
                    break;

                case "About":
                    // Show About section (collapsed by default)
                    document.querySelector(".about")?.classList.add("show");
                    setActive("About");
                    break;

                case "Timeline":
                    // Show Timeline overlay
                    document.querySelector(".timeline-section")?.classList.add("show");

                    // Start timeline animation
                    if (window.timelineAnimation) {
                        // Already initialized → just show it
                        setTimeout(() => window.timelineAnimation.show(), 50);
                    } else if (typeof initTimelineAnimation === "function") {
                        // First-time initialization
                        window.timelineAnimation = initTimelineAnimation();
                        window.timelineAnimation.show();
                    }

                    setActive("Timeline");
                    break;

                case "Projects":
                    // Show Projects section (needs to exist in HTML)
                    document.querySelector(".projects")?.classList.add("show");
                    setActive("Projects");
                    break;

                case "Resume":
                    // Show Resume section (needs to exist in HTML)
                    document.querySelector(".resume")?.classList.add("show");
                    setActive("Resume");
                    break;

                default:
                    // Unknown label → reset to safe state
                    clearActive();
            }
        });
    });
});

document.addEventListener('blackholeExpanded', () => {
    const nav = document.getElementById('mainNav');
    const aboutSection = document.querySelector(".about");
    nav.classList.add('show');
    if (aboutSection) aboutSection.classList.add('show');
    setActive("About");
});
