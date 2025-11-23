// js/about.js
// ==============================
// This file handles the "About" section behavior:
// - Expanding/collapsing extra content
// - Resetting scroll when collapsed
// - Resetting About section when blackhole collapses
// ==============================

// ------------------------
// DOM elements
// ------------------------
const toggleButton = document.querySelector(".down-button");
const extraContainer = document.querySelector(".extra-content-container");
const aboutSection = document.querySelector(".about");

// ------------------------
// Expand / collapse logic
// ------------------------
toggleButton?.addEventListener("click", () => {
    const isExpanded = aboutSection.classList.toggle("expanded");
    extraContainer.classList.toggle("show", isExpanded);

    // Reset scroll when collapsing
    if (!isExpanded) {
        const card = aboutSection.querySelector(".about-card");
        if (card) card.scrollTop = 0;
    }
});

// ------------------------
// Reset About when collapseBtn is clicked
// (Triggered when blackhole animation collapses)
// ------------------------
$("#collapseBtn").on("click", () => {
    aboutSection.classList.remove("show", "expanded");
    extraContainer.classList.remove("show");

    // Reset scroll
    const card = aboutSection.querySelector(".about-card");
    if (card) card.scrollTop = 0;
});

// ---- small accessibility + state sync for the left-body extras ----
(() => {
  const aboutSection = document.querySelector(".about");
  const leftBody = document.querySelector(".about-left-body");
  const toggleBtn = document.querySelector(".about-toggle .down-button");

  function syncLeftBody(isExpanded) {
    if (!leftBody) return;
    // aria-hidden + visibility are handled by CSS; keep aria in sync
    leftBody.setAttribute("aria-hidden", (!isExpanded).toString());
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  }

  // initial sync
  syncLeftBody(false);

  // When user toggles via existing handler, observe mutation to update aria
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.attributeName === "class" && m.target === aboutSection) {
        const isExpanded = aboutSection.classList.contains("expanded");
        syncLeftBody(isExpanded);
      }
    });
  });

  if (aboutSection) observer.observe(aboutSection, { attributes: true, attributeFilter: ['class'] });

  // Keyboard accessibility: allow toggle button to work with Enter/Space if not default
  if (toggleBtn) {
    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleBtn.click();
      }
    });
  }
})();
