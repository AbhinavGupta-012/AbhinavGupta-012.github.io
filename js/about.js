// js/about.js
// ==============================
// This file handles the "About" section behavior:
// - Expanding/collapsing extra content
// - Resetting scroll when collapsed
// - Dynamic Project Count fetching
// - LeetCode Stats Popup (Live Data + Rank)
// - GitHub Stats Popup (Live Data + Pinned Repos)
// ==============================

// ------------------------
// 1. STANDARD ABOUT SECTION LOGIC
// ------------------------
const toggleButton = document.querySelector(".down-button");
const extraContainer = document.querySelector(".extra-content-container");
const aboutSection = document.querySelector(".about");

// Expand / collapse logic
toggleButton?.addEventListener("click", () => {
    const isExpanded = aboutSection.classList.toggle("expanded");
    extraContainer.classList.toggle("show", isExpanded);

    // Reset scroll when collapsing
    if (!isExpanded) {
        const card = aboutSection.querySelector(".about-card");
        if (card) card.scrollTop = 0;
    }
});

// Reset About when collapseBtn is clicked (Global Nav)
$("#collapseBtn").on("click", () => {
    aboutSection.classList.remove("show", "expanded");
    extraContainer.classList.remove("show");
    const card = aboutSection.querySelector(".about-card");
    if (card) card.scrollTop = 0;
});

// Accessibility sync for screen readers
(() => {
  const aboutSection = document.querySelector(".about");
  const leftBody = document.querySelector(".about-left-body");
  const toggleBtn = document.querySelector(".about-toggle .down-button");

  function syncLeftBody(isExpanded) {
    if (!leftBody) return;
    leftBody.setAttribute("aria-hidden", (!isExpanded).toString());
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  }
  syncLeftBody(false);
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.attributeName === "class" && m.target === aboutSection) {
        const isExpanded = aboutSection.classList.contains("expanded");
        syncLeftBody(isExpanded);
      }
    });
  });
  if (aboutSection) observer.observe(aboutSection, { attributes: true, attributeFilter: ['class'] });
})();

// ------------------------
// 2. DYNAMIC PROJECT COUNT
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
    fetch('data/projects.json')
        .then(res => res.json())
        .then(data => {
            const countElement = document.getElementById('projectCountValue');
            if (countElement && data.projects) {
                countElement.textContent = data.projects.length + "+";
            }
        })
        .catch(err => console.warn("Could not load project count:", err));
});

// ==============================
// 3. LEETCODE STATS POPUP LOGIC (FIXED RANKING)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const triggerBtn = document.getElementById("lcTriggerBtn");
    const popup = document.getElementById("leetcodePopup");
    const aboutCard = document.querySelector(".about-card");
    const USERNAME = "AbhinavGupta012";
    let hideTimeout;

    if (!triggerBtn || !popup) return;

    // CRITICAL: Move popup to BODY
    document.body.appendChild(popup);

    const fetchLeetCodeStats = async () => {
        // UPDATED CACHE KEY: v3 forces a refresh to get the correct rank
        const cached = sessionStorage.getItem("lc_stats_v3");
        if (cached) {
            updateLeetCodeDOM(JSON.parse(cached));
            return;
        }

        try {
            // We fetch 3 endpoints: Solved Stats, Last Submission, and Main Profile (for Rank)
            const [statsResult, lastSubResult, profileResult] = await Promise.allSettled([
                fetch(`https://alfa-leetcode-api.onrender.com/${USERNAME}/profile`),
                fetch(`https://alfa-leetcode-api.onrender.com/${USERNAME}/acSubmission?limit=1`),
                fetch(`https://alfa-leetcode-api.onrender.com/${USERNAME}`) // <--- CHANGED: Main profile endpoint
            ]);

            // Default Values
            let data = {
                solved: 0, total: 0,
                easy: 0, easyTotal: 0,
                medium: 0, mediumTotal: 0,
                hard: 0, hardTotal: 0,
                lastSolved: "Daily Challenge",
                ranking: "Active Learner"
            };

            // 1. Process Solved Stats
            if (statsResult.status === "fulfilled") {
                const s = await statsResult.value.json();
                data.solved = s.totalSolved;
                data.total = s.totalQuestions;
                data.easy = s.easySolved;
                data.easyTotal = s.totalEasy;
                data.medium = s.mediumSolved;
                data.mediumTotal = s.totalMedium;
                data.hard = s.hardSolved;
                data.hardTotal = s.totalHard;
            }

            // 2. Process Last Submission
            if (lastSubResult.status === "fulfilled") {
                const l = await lastSubResult.value.json();
                if (l.submission && l.submission.length > 0) {
                    data.lastSolved = l.submission[0].title;
                }
            }

            // 3. Process Ranking (CORRECTED)
            if (profileResult.status === "fulfilled") {
                const p = await profileResult.value.json();
                // We now check 'ranking' (Global) instead of contest ranking
                if (p.ranking) {
                    data.ranking = `Global Rank: ${p.ranking.toLocaleString()}`;
                }
            }

            // Save and Update
            sessionStorage.setItem("lc_stats_v3", JSON.stringify(data));
            updateLeetCodeDOM(data);

        } catch (err) {
            console.warn("LeetCode fetch error:", err);
        }
    };

    const updateLeetCodeDOM = (data) => {
        // 1. Main Circle
        const totalEl = popup.querySelector(".lc-total");
        if (totalEl) totalEl.textContent = data.solved;

        // 2. Breakdown Rows
        updateRow("easy", data.easy, data.easyTotal);
        updateRow("medium", data.medium, data.mediumTotal);
        updateRow("hard", data.hard, data.hardTotal);

        // 3. Last Solved Text
        const lastSolvedEl = popup.querySelector(".lc-last-solved");
        if (lastSolvedEl) lastSolvedEl.textContent = `Last: ${data.lastSolved}`;

        // 4. Ranking Text
        const rankEl = popup.querySelector(".lc-attempting");
        if (rankEl) {
            rankEl.textContent = data.ranking;
            rankEl.style.color = "#ffa116"; 
            rankEl.style.fontWeight = "600";
        }
    };

    const updateRow = (type, solved, total) => {
        const row = popup.querySelector(`.lc-stat-item.${type}`);
        if (!row) return;
        const valSpan = row.querySelector(".lc-val");
        if (valSpan) valSpan.innerHTML = `${solved}<span class="lc-total-sm">/${total}</span>`;
        
        const pct = Math.min(100, Math.round((solved / total) * 100));
        row.style.setProperty("--pct", `${pct}%`);
    };

    // --- Interaction ---
    const showPopup = (e) => {
        if(e.type === 'click') e.preventDefault();
        clearTimeout(hideTimeout);
        fetchLeetCodeStats();

        const btnRect = triggerBtn.getBoundingClientRect();
        let left = btnRect.right + 8; 
        let top = btnRect.top + (btnRect.height / 2) - (popup.offsetHeight / 2);

        if (left + popup.offsetWidth > window.innerWidth - 10) {
            left = btnRect.left - popup.offsetWidth - 8;
        }

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        popup.classList.add("active");
    };

    const hidePopup = () => {
        hideTimeout = setTimeout(() => {
            popup.classList.remove("active");
        }, 200);
    };

    triggerBtn.addEventListener("mouseenter", showPopup);
    triggerBtn.addEventListener("mouseleave", hidePopup);
    popup.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
    popup.addEventListener("mouseleave", hidePopup);

    triggerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (popup.classList.contains("active")) hidePopup();
        else showPopup(e);
    });

    if (aboutCard) {
        aboutCard.addEventListener("scroll", () => popup.classList.remove("active"));
    }
});

// ==============================
// 4. GITHUB STATS POPUP LOGIC
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const triggerBtn = document.getElementById("ghTriggerBtn");
    const popup = document.getElementById("githubPopup");
    const aboutCard = document.querySelector(".about-card");
    const USERNAME = "AbhinavGupta-012";
    
    // LIST YOUR PINNED REPOS HERE TO PRIORITIZE THEM
    const pinnedNames = ["Cosmic-Portfolio", "ShopSphere", "News-App", "Weather-App"];

    let hideTimeout;

    if (!triggerBtn || !popup) return;

    // CRITICAL: Move popup to BODY
    document.body.appendChild(popup);

    const fetchGithubData = async () => {
        const cached = sessionStorage.getItem("gh_stats_cache");
        if (cached) {
            renderGithubPopup(JSON.parse(cached));
            return;
        }

        try {
            const [userRes, reposRes] = await Promise.all([
                fetch(`https://api.github.com/users/${USERNAME}`),
                fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`)
            ]);

            if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API Error");

            const userData = await userRes.json();
            const reposData = await reposRes.json();

            // 1. Calculate Stats
            let totalStars = 0;
            const languageMap = {};
            
            reposData.forEach(repo => {
                totalStars += repo.stargazers_count;
                if (repo.language) {
                    languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
                }
            });

            // 2. Sort Languages
            const topLanguages = Object.entries(languageMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(entry => entry[0]);

            // 3. Sort Repos (Pinned First, then Stars)
            const topRepos = reposData
                .sort((a, b) => {
                    const aPinned = pinnedNames.includes(a.name);
                    const bPinned = pinnedNames.includes(b.name);
                    
                    if (aPinned && !bPinned) return -1;
                    if (!aPinned && bPinned) return 1;
                    return b.stargazers_count - a.stargazers_count;
                })
                .slice(0, 2);

            const stats = {
                avatar: userData.avatar_url,
                name: userData.login,
                publicRepos: userData.public_repos,
                stars: totalStars,
                languages: topLanguages,
                topRepos: topRepos
            };

            sessionStorage.setItem("gh_stats_cache", JSON.stringify(stats));
            renderGithubPopup(stats);

        } catch (err) {
            console.error(err);
            popup.innerHTML = `<div class="gh-loading"><p>Stats unavailable</p></div>`;
        }
    };

    const renderGithubPopup = (data) => {
        const langHtml = data.languages.map(lang => 
            `<span class="gh-lang-pill">${lang}</span>`
        ).join('');

        const reposHtml = data.topRepos.map(repo => `
            <div class="gh-repo-card">
                <span class="gh-repo-name">${repo.name}</span>
                <span class="gh-repo-meta">⭐ ${repo.stargazers_count}</span>
            </div>
        `).join('');

        popup.innerHTML = `
            <div class="gh-header">
                <img src="${data.avatar}" alt="Avatar" class="gh-avatar">
                <div class="gh-user-info">
                    <h4>${data.name}</h4>
                    <span>GitHub Profile</span>
                </div>
            </div>
            
            <div class="gh-stats-grid">
                <div class="gh-stat-box">
                    <span class="gh-stat-val">${data.publicRepos}</span>
                    <span class="gh-stat-label">Repositories</span>
                </div>
                <div class="gh-stat-box">
                    <span class="gh-stat-val">${data.stars}</span>
                    <span class="gh-stat-label">Total Stars</span>
                </div>
            </div>

            <div class="gh-langs-title">Top Languages</div>
            <div class="gh-lang-pills">${langHtml}</div>

            <div class="gh-langs-title">Featured Projects</div>
            <div class="gh-featured">${reposHtml}</div>
        `;
    };

    // --- Interaction Logic ---
    const showPopup = (e) => {
        if(e.type === 'click') e.preventDefault();
        clearTimeout(hideTimeout);
        
        if (popup.querySelector('.gh-spinner')) fetchGithubData();

        const btnRect = triggerBtn.getBoundingClientRect();
        
        // Position: Right of button + 8px
        let left = btnRect.right + 8; 
        let top = btnRect.top + (btnRect.height / 2) - (popup.offsetHeight / 2);

        if (left + popup.offsetWidth > window.innerWidth - 10) {
            left = btnRect.left - popup.offsetWidth - 8;
        }

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        popup.classList.add("active");
    };

    const hidePopup = () => {
        hideTimeout = setTimeout(() => {
            popup.classList.remove("active");
        }, 300);
    };

    triggerBtn.addEventListener("mouseenter", showPopup);
    triggerBtn.addEventListener("mouseleave", hidePopup);
    popup.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
    popup.addEventListener("mouseleave", hidePopup);

    triggerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (popup.classList.contains("active")) hidePopup();
        else showPopup(e);
    });

    if (aboutCard) {
        aboutCard.addEventListener("scroll", () => popup.classList.remove("active"));
    }
});