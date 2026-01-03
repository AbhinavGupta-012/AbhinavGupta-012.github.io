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

            this.featuredGrid = document.getElementById('featured-grid');
            this.archiveGrid = document.getElementById('archive-grid');
            this.featuredHeader = document.querySelector('.projects-section-header.first'); 
            
            this.searchInput = document.getElementById('projectSearch');
            this.categoryContainer = document.getElementById('category-filters');
            this.tagsContainer = document.getElementById('tag-filters');
            this.resetBtn = document.getElementById('resetFilters');

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

            const categories = ['All', ...new Set(this.projects.map(p => p.category))];
            this.categoryContainer.innerHTML = categories.map(cat => `
                <button class="filter-chip ${cat === 'All' ? 'active' : ''}" 
                        data-type="category" data-value="${cat}">
                    ${cat}
                </button>
            `).join('');

            const tags = [...new Set(this.projects.flatMap(p => p.tags || []))].sort();
            this.tagsContainer.innerHTML = tags.map(tag => `
                <button class="filter-chip" data-type="tag" data-value="${tag}">
                    ${tag}
                </button>
            `).join('');
        }

        bindEvents() {
            this.searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });

            this.categoryContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-chip');
                if (!btn) return;
                this.categoryContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.category = btn.dataset.value;
                this.applyFilters();
            });

            this.tagsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-chip');
                if (!btn) return;
                const tag = btn.dataset.value;
                if (this.filters.tags.has(tag)) {
                    this.filters.tags.delete(tag);
                    btn.classList.remove('active');
                } else {
                    this.filters.tags.add(tag);
                    btn.classList.add('active');
                }
                this.applyFilters();
            });

            this.resetBtn.addEventListener('click', () => {
                this.filters.search = '';
                this.filters.category = 'All';
                this.filters.tags.clear();
                this.searchInput.value = '';
                this.populateFilters(); 
                this.applyFilters();
            });
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