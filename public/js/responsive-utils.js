/**
 * Utilitaires pour la gestion responsive
 * ====================================
 */

class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: 768,
            tablet: 992,
            desktop: 1200
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.resizeTimeout = null;
        
        this.init();
    }
    
    init() {
        // Écouter les changements de taille d'écran
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Écouter les changements d'orientation
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // Configuration initiale
        this.updateLayout();
        this.setupTouchOptimizations();
        
        console.log('📱 ResponsiveManager initialisé:', this.currentBreakpoint);
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) {
            return 'mobile';
        } else if (width <= this.breakpoints.tablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    handleResize() {
        // Débouncer les événements de redimensionnement
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const newBreakpoint = this.getCurrentBreakpoint();
            
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                this.updateLayout();
                this.dispatchBreakpointChange();
            }
            
            this.adjustReaderLayout();
        }, 150);
    }
    
    handleOrientationChange() {
        // Attendre que l'orientation soit complètement changée
        setTimeout(() => {
            this.updateLayout();
            this.adjustReaderLayout();
        }, 300);
    }
    
    updateLayout() {
        document.body.setAttribute('data-breakpoint', this.currentBreakpoint);
        
        // Ajustements spécifiques par breakpoint
        switch (this.currentBreakpoint) {
            case 'mobile':
                this.setupMobileLayout();
                break;
            case 'tablet':
                this.setupTabletLayout();
                break;
            case 'desktop':
                this.setupDesktopLayout();
                break;
        }
    }
    
    setupMobileLayout() {
        // Grid des mangas pour mobile
        const mangaLibrary = document.querySelector('.manga-library');
        if (mangaLibrary) {
            mangaLibrary.style.gridTemplateColumns = 'repeat(auto-fill, minmax(min(280px, calc(100vw - 2rem)), 1fr))';
        }
        
        // Navigation responsive
        this.optimizeNavigation();
        
        // Optimiser les contrôles de zoom
        this.optimizeZoomControls();
    }
    
    setupTabletLayout() {
        const mangaLibrary = document.querySelector('.manga-library');
        if (mangaLibrary) {
            mangaLibrary.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))';
        }
    }
    
    setupDesktopLayout() {
        const mangaLibrary = document.querySelector('.manga-library');
        if (mangaLibrary) {
            mangaLibrary.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
        }
    }
    
    optimizeNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            if (this.currentBreakpoint === 'mobile') {
                btn.style.minWidth = 'calc(50% - 0.25rem)';
                btn.style.fontSize = '0.75rem';
            }
        });
    }
    
    optimizeZoomControls() {
        const zoomControls = document.querySelector('.zoom-controls');
        if (zoomControls && this.currentBreakpoint === 'mobile') {
            zoomControls.style.flexDirection = 'row';
            
            const zoomBtns = zoomControls.querySelectorAll('.zoom-btn');
            zoomBtns.forEach(btn => {
                btn.style.width = '32px';
                btn.style.height = '32px';
            });
        }
    }
    
    adjustReaderLayout() {
        const reader = document.getElementById('book-reader');
        if (!reader || reader.classList.contains('hidden')) return;
        
        const pageImg = document.getElementById('current-page');
        if (!pageImg) return;
        
        // Calculer les dimensions optimales
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Ajuster selon l'orientation et la taille d'écran
        if (this.currentBreakpoint === 'mobile') {
            this.adjustMobileReader(viewportHeight, viewportWidth);
        }
    }
    
    adjustMobileReader(vh, vw) {
        const pageContainer = document.querySelector('.page-container');
        const readerHeader = document.querySelector('.reader-header');
        const pageNavigation = document.querySelector('.page-navigation');
        
        if (!pageContainer || !readerHeader || !pageNavigation) return;
        
        const headerHeight = readerHeader.offsetHeight;
        const navHeight = pageNavigation.offsetHeight;
        const availableHeight = vh - headerHeight - navHeight - 20; // 20px de marge
        
        pageContainer.style.maxHeight = `${availableHeight}px`;
        
        // Ajuster l'image selon l'orientation
        const pageImg = document.getElementById('current-page');
        if (pageImg) {
            if (window.orientation === 90 || window.orientation === -90) {
                // Mode paysage
                pageImg.style.maxHeight = `${availableHeight - 20}px`;
                pageImg.style.maxWidth = `${vw - 40}px`;
            } else {
                // Mode portrait
                pageImg.style.maxHeight = `${availableHeight - 20}px`;
                pageImg.style.maxWidth = `${vw - 20}px`;
            }
        }
    }
    
    setupTouchOptimizations() {
        // Désactiver le zoom par pincement sur les éléments UI
        const uiElements = document.querySelectorAll('.reader-header, .page-navigation, .zoom-controls');
        uiElements.forEach(element => {
            element.style.touchAction = 'manipulation';
        });
        
        // Optimiser la zone de lecture pour le touch
        const pageContainer = document.querySelector('.page-container');
        if (pageContainer) {
            pageContainer.style.touchAction = 'pan-x pan-y';
        }
        
        // Améliorer la réactivité des boutons
        this.optimizeTouchTargets();
    }
    
    optimizeTouchTargets() {
        const touchTargets = document.querySelectorAll('.btn, .reader-btn, .nav-btn, .zoom-btn, .chapter-nav-item');
        
        touchTargets.forEach(target => {
            // Assurer une taille minimale de 44px pour l'accessibilité
            const computedStyle = window.getComputedStyle(target);
            const currentHeight = parseInt(computedStyle.height);
            
            if (currentHeight < 44) {
                target.style.minHeight = '44px';
                target.style.display = 'flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
            }
            
            // Ajouter des indicateurs visuels pour le touch
            target.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            target.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        });
    }
    
    handleTouchStart(e) {
        e.currentTarget.style.transform = 'scale(0.98)';
        e.currentTarget.style.opacity = '0.8';
    }
    
    handleTouchEnd(e) {
        setTimeout(() => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.opacity = '';
        }, 100);
    }
    
    dispatchBreakpointChange() {
        const event = new CustomEvent('breakpointchange', {
            detail: {
                breakpoint: this.currentBreakpoint,
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
        
        window.dispatchEvent(event);
        console.log('📱 Breakpoint changé:', this.currentBreakpoint);
    }
    
    // Méthodes utilitaires publiques
    isMobile() {
        return this.currentBreakpoint === 'mobile';
    }
    
    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }
    
    isDesktop() {
        return this.currentBreakpoint === 'desktop';
    }
    
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            breakpoint: this.currentBreakpoint,
            orientation: window.orientation || 0,
            pixelRatio: window.devicePixelRatio || 1
        };
    }
}

// Initialiser le gestionnaire responsive
let responsiveManager;

document.addEventListener('DOMContentLoaded', () => {
    responsiveManager = new ResponsiveManager();
    
    // Rendre disponible globalement
    window.responsiveManager = responsiveManager;
});

// Exporter pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveManager;
}
