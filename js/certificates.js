/**
 * CERTIFICATE PREVIEW SYSTEM
 * Futuristic hover preview with cosmic animations
 * Matches portfolio's blackhole/neon theme
 */

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
        
        // Create overlay for mobile
        if (this.isMobile) {
            this.createMobileOverlay();
        }
    }

    createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'cert-mobile-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideAllPreviews();
            }
        });

        document.body.appendChild(overlay);
        this.mobileOverlay = overlay;
    }

    bindEvents() {
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const frame = element.querySelector('.cert-preview-frame');
            
            if (this.isMobile) {
                // Mobile: tap to show, tap overlay to hide
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePreview(element);
                });
            } else {
                // Desktop: hover to show
                icon.addEventListener('mouseenter', () => {
                    this.showPreview(element);
                });
                
                icon.addEventListener('mouseleave', () => {
                    this.hidePreview(element);
                });

                // Keep preview visible when hovering over frame
                frame.addEventListener('mouseenter', () => {
                    this.keepPreviewVisible(element);
                });

                frame.addEventListener('mouseleave', () => {
                    this.hidePreview(element);
                });
            }

            // Add keyboard support
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.togglePreview(element);
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllPreviews();
            }
        });

        // Close on scroll (mobile)
        if (this.isMobile) {
            window.addEventListener('scroll', () => {
                this.hideAllPreviews();
            });
        }
    }

    showPreview(element) {
        // Hide any other visible previews
        this.hideAllPreviews();
        
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        
        icon.classList.add('active');
        frame.classList.add('active');
        
        // Add subtle entrance animation
        this.animateEntrance(frame);
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
            if (this.isMobile && this.mobileOverlay) {
                this.mobileOverlay.style.opacity = '0';
                this.mobileOverlay.style.visibility = 'hidden';
            }
        } else {
            this.showPreview(element);
            if (this.isMobile && this.mobileOverlay) {
                this.mobileOverlay.style.opacity = '1';
                this.mobileOverlay.style.visibility = 'visible';
            }
        }
    }

    hideAllPreviews() {
        this.previewElements.forEach(element => {
            this.hidePreview(element);
        });
        
        if (this.isMobile && this.mobileOverlay) {
            this.mobileOverlay.style.opacity = '0';
            this.mobileOverlay.style.visibility = 'hidden';
        }
    }

    keepPreviewVisible(element) {
        // Reset hover timeout to keep preview visible
        const icon = element.querySelector('.cert-icon');
        const frame = element.querySelector('.cert-preview-frame');
        
        icon.classList.add('active');
        frame.classList.add('active');
    }

    animateEntrance(frame) {
        // Add subtle scale animation
        frame.style.transform = 'translateY(-50%) scale(0.95)';
        frame.style.opacity = '0';
        
        requestAnimationFrame(() => {
            frame.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            frame.style.transform = 'translateY(-50%) scale(1)';
            frame.style.opacity = '1';
        });
    }

    preloadImages() {
        // Preload certificate images for smoother experience
        this.previewElements.forEach(element => {
            const icon = element.querySelector('.cert-icon');
            const imgSrc = icon.getAttribute('data-preview-src');
            
            if (imgSrc) {
                const img = new Image();
                img.src = imgSrc;
            }
        });
    }

    // Public method to refresh previews if new certificates are added dynamically
    refresh() {
        this.cacheElements();
        this.bindEvents();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.certificatePreview = new CertificatePreview();
});

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CertificatePreview;
}