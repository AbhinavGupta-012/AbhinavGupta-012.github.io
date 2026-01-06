document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.querySelector('.projects');
    if (!projectsContainer) return;

    class ProjectManager {
        constructor() {
            this.projects = [];
            this.filteredProjects = [];
            this.filters = {
                search: '',
                category: 'All',
                tags: new Set()
            };

            // Grids
            this.featuredGrid = document.getElementById('featured-grid');
            this.archiveGrid = document.getElementById('archive-grid');
            this.featuredHeader = document.querySelector('.projects-section-header.first'); 
            
            // --- INPUTS FOR BOTH DESKTOP AND MOBILE ---
            
            // Search Inputs
            this.searchInputDesktop = document.getElementById('projectSearch');
            this.searchInputMobile = document.getElementById('projectSearchMobile');
            
            // Category Containers
            this.catContainerDesktop = document.getElementById('category-filters');
            this.catContainerMobile = document.getElementById('category-filters-mobile');
            
            // Tag Containers
            this.tagContainerDesktop = document.getElementById('tag-filters');
            this.tagContainerMobile = document.getElementById('tag-filters-mobile');
            
            // Reset Buttons
            this.resetBtnDesktop = document.getElementById('resetFilters');
            this.resetBtnMobile = document.getElementById('resetFiltersMobile');

            this.init();
        }

        async init() {
            try {
                const response = await fetch('data/projects.json');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                this.projects = data.projects || [];
                this.filteredProjects = this.projects;

                this.populateFilters();
                this.render();
                this.bindEvents();

            } catch (error) {
                console.error("Project Load Error:", error);
                if (this.featuredGrid) this.featuredGrid.innerHTML = `<div style="color:rgba(255,255,255,0.5); padding:20px;">Unable to load project data.</div>`;
            }
        }

        populateFilters() {
            if (!this.projects.length) return;

            // 1. Generate Category HTML
            const categories = ['All', ...new Set(this.projects.map(p => p.category))];
            const catHTML = categories.map(cat => `
                <button class="filter-chip ${cat === 'All' ? 'active' : ''}" 
                        data-type="category" data-value="${cat}">
                    ${cat}
                </button>
            `).join('');

            // Inject into BOTH containers
            if(this.catContainerDesktop) this.catContainerDesktop.innerHTML = catHTML;
            if(this.catContainerMobile) this.catContainerMobile.innerHTML = catHTML;

            // 2. Generate Tags HTML
            const tags = [...new Set(this.projects.flatMap(p => p.tags || []))].sort();
            const tagHTML = tags.map(tag => `
                <button class="filter-chip" data-type="tag" data-value="${tag}">
                    ${tag}
                </button>
            `).join('');

            // Inject into BOTH containers
            if(this.tagContainerDesktop) this.tagContainerDesktop.innerHTML = tagHTML;
            if(this.tagContainerMobile) this.tagContainerMobile.innerHTML = tagHTML;
        }

        bindEvents() {
            // Helper to bind listener to multiple elements safely
            const addListener = (element, event, handler) => {
                if(element) element.addEventListener(event, handler);
            };

            // --- SEARCH BINDING (Syncs inputs) ---
            const handleSearch = (e) => {
                const val = e.target.value.toLowerCase();
                this.filters.search = val;
                
                // Sync visual values so desktop match mobile if switched
                if(this.searchInputDesktop) this.searchInputDesktop.value = val;
                if(this.searchInputMobile) this.searchInputMobile.value = val;
                
                this.applyFilters();
            };

            addListener(this.searchInputDesktop, 'input', handleSearch);
            addListener(this.searchInputMobile, 'input', handleSearch);

            // --- CATEGORY CLICK DELEGATION ---
            const handleCategoryClick = (e) => {
                const btn = e.target.closest('.filter-chip');
                if (!btn) return;
                
                this.filters.category = btn.dataset.value;
                
                // Update UI classes on BOTH sets of buttons
                this.updateActiveClasses(
                    [this.catContainerDesktop, this.catContainerMobile], 
                    btn.dataset.value
                );
                
                this.applyFilters();
            };

            addListener(this.catContainerDesktop, 'click', handleCategoryClick);
            addListener(this.catContainerMobile, 'click', handleCategoryClick);

            // --- TAG CLICK DELEGATION ---
            const handleTagClick = (e) => {
                const btn = e.target.closest('.filter-chip');
                if (!btn) return;
                
                const tag = btn.dataset.value;
                if (this.filters.tags.has(tag)) {
                    this.filters.tags.delete(tag);
                } else {
                    this.filters.tags.add(tag);
                }

                // Re-render active state for tags across both views
                this.updateTagVisuals();
                this.applyFilters();
            };

            addListener(this.tagContainerDesktop, 'click', handleTagClick);
            addListener(this.tagContainerMobile, 'click', handleTagClick);

            // --- RESET BUTTONS ---
            const handleReset = () => {
                this.filters.search = '';
                this.filters.category = 'All';
                this.filters.tags.clear();
                
                // Clear inputs
                if(this.searchInputDesktop) this.searchInputDesktop.value = '';
                if(this.searchInputMobile) this.searchInputMobile.value = '';

                // Reset UI
                this.populateFilters(); 
                this.applyFilters();
            };

            addListener(this.resetBtnDesktop, 'click', handleReset);
            addListener(this.resetBtnMobile, 'click', handleReset);
        }

        updateActiveClasses(containers, activeValue) {
            containers.forEach(container => {
                if(!container) return;
                container.querySelectorAll('.filter-chip').forEach(btn => {
                    if(btn.dataset.value === activeValue) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            });
        }

        updateTagVisuals() {
            // Helper to sync tag active states across desktop and mobile
            const syncTags = (container) => {
                if(!container) return;
                container.querySelectorAll('.filter-chip').forEach(btn => {
                    const tag = btn.dataset.value;
                    if(this.filters.tags.has(tag)) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            };

            syncTags(this.tagContainerDesktop);
            syncTags(this.tagContainerMobile);
        }

        applyFilters() {
            this.filteredProjects = this.projects.filter(p => {
                const searchMatch = !this.filters.search || 
                                    p.title.toLowerCase().includes(this.filters.search) || 
                                    p.longDescription.toLowerCase().includes(this.filters.search);
                const catMatch = this.filters.category === 'All' || p.category === this.filters.category;
                const tagMatch = this.filters.tags.size === 0 || 
                                 (p.tags && p.tags.some(t => this.filters.tags.has(t)));
                return searchMatch && catMatch && tagMatch;
            });
            this.render();
        }

        isFiltering() {
            return this.filters.search !== '' || 
                   this.filters.category !== 'All' || 
                   this.filters.tags.size > 0;
        }

        render() {
            this.featuredGrid.innerHTML = '';
            this.archiveGrid.innerHTML = '';

            const isFiltering = this.isFiltering();

            if (this.featuredHeader) {
                this.featuredHeader.style.display = isFiltering ? 'none' : 'flex';
            }

            if (this.filteredProjects.length === 0) {
                this.archiveGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:rgba(255,255,255,0.4); padding:40px;">No projects found.</div>`;
                return;
            }

            if (isFiltering) {
                this.featuredGrid.style.display = 'none';
                this.filteredProjects.forEach((p, index) => {
                    this.createCard(p, this.archiveGrid, false, index);
                });
            } else {
                this.featuredGrid.style.display = 'grid'; 

                const featured = this.filteredProjects.filter(p => p.isFeatured);
                featured.forEach((p, index) => {
                    this.createCard(p, this.featuredGrid, true, index);
                });

                this.filteredProjects.forEach((p, index) => {
                    this.createCard(p, this.archiveGrid, false, index);
                });
            }
        }

        createCard(project, container, isFeatured, index) {
            const card = document.createElement('div');
            const highlightClass = (isFeatured && !this.isFiltering()) ? 'is-featured' : '';
            
            card.className = `project-card ${highlightClass}`;
            card.style.animationDelay = `${index * 0.05}s`;

            let imageHtml = '';
            if (project.image && project.image.trim() !== "") {
                imageHtml = `
                <div class="card-media">
                    <img src="${project.image}" alt="${project.title}" class="card-img" loading="lazy">
                </div>`;
            }

            const tagsHtml = (project.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');

            let linksHtml = '';
            if (project.links) {
                if (project.links.github) {
                    linksHtml += `<a href="${project.links.github}" target="_blank" class="link-item">
                        <div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">
                            <lord-icon src="assets/logos/github.json" trigger="hover" colors="primary:#ffffff" style="width:20px;height:20px"></lord-icon>
                        </div>
                        GitHub
                    </a>`;
                }
                if (project.links.live) {
                    linksHtml += `<a href="${project.links.live}" target="_blank" class="link-item">
                         <span>↗</span> Live Demo
                    </a>`;
                }
            }

            card.innerHTML = `
                ${imageHtml}
                <h3 class="card-title">${project.title}</h3>
                <p class="card-desc">${project.shortDescription}</p>
                <div class="card-tags">${tagsHtml}</div>
                <div class="card-links">${linksHtml}</div>
            `;

            container.appendChild(card);
            requestAnimationFrame(() => card.classList.add('visible'));
        }
    }

    new ProjectManager();
});

// Filter Modal Toggle Logic
const filterFloatingBtn = document.getElementById('filterFloatingBtn');
const filterModalOverlay = document.getElementById('filterModalOverlay');
const filterModal = document.getElementById('filterModal');
const closeFilterModal = document.getElementById('closeFilterModal');

function showFilterButton() {
    if(filterFloatingBtn) {
        setTimeout(() => {
            filterFloatingBtn.classList.add('visible');
        }, 300);
    }
}

function toggleFilterModal() {
    if(!filterModal) return;
    filterModalOverlay.classList.toggle('active');
    filterModal.classList.toggle('active');
    document.body.style.overflow = filterModal.classList.contains('active') ? 'hidden' : 'auto';
}

function closeFilterModalFunc() {
    if(!filterModal) return;
    filterModalOverlay.classList.remove('active');
    filterModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (filterFloatingBtn) filterFloatingBtn.addEventListener('click', toggleFilterModal);
if (filterModalOverlay) filterModalOverlay.addEventListener('click', closeFilterModalFunc);
if (closeFilterModal) closeFilterModal.addEventListener('click', closeFilterModalFunc);

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filterModal && filterModal.classList.contains('active')) {
        closeFilterModalFunc();
    }
});

// Show filter button when projects page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.projects.show')) {
        showFilterButton();
    }
});