/**
 * ⚡ Performance Manager - Optimisations et suivi des performances
 */

class PerformanceManager {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            imageLoadTimes: new Map(),
            cacheHitRate: 0,
            scrollPerformance: []
        };
        
        this.observers = {
            intersection: null,
            performance: null
        };
        
        this.cache = {
            images: new Map(),
            thumbnails: new Map(),
            maxSize: 50 * 1024 * 1024, // 50MB
            currentSize: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('⚡ Performance Manager: Initialisation');
        this.setupPerformanceObserver();
        this.setupLazyLoading();
        this.optimizeImages();
        this.setupPreloading();
        this.monitorMemory();
        this.setupScrollOptimization();
    }
    
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Observer pour les métriques de navigation
            const navObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
                        console.log(`📊 Temps de chargement: ${this.metrics.loadTime.toFixed(2)}ms`);
                    }
                }
            });
            
            navObserver.observe({ entryTypes: ['navigation'] });
            
            // Observer pour les images
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        const loadTime = entry.responseEnd - entry.requestStart;
                        this.metrics.imageLoadTimes.set(entry.name, loadTime);
                        
                        if (loadTime > 2000) {
                            console.warn(`🐌 Image lente: ${entry.name} (${loadTime.toFixed(2)}ms)`);
                        }
                    }
                }
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
            
            this.observers.performance = { navObserver, resourceObserver };
        }
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.observers.intersection = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.observers.intersection.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            console.log('👀 Lazy loading configuré');
        }
    }
    
    optimizeImages() {
        // Créer un observer pour les nouvelles images
        const imageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                            images.forEach(img => this.optimizeImage(img));
                        }
                    });
                }
            });
        });
        
        imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Optimiser les images existantes
        document.querySelectorAll('img').forEach(img => this.optimizeImage(img));
    }
    
    optimizeImage(img) {
        // Si l'image a déjà un src, la remplacer par data-src pour lazy loading
        if (img.src && !img.dataset.src && !img.classList.contains('lazy-loaded')) {
            img.dataset.src = img.src;
            img.src = this.generatePlaceholder(img.width || 300, img.height || 400);
            img.classList.add('lazy-image');
        }
        
        // Ajouter les attributs d'optimisation
        if (!img.loading) {
            img.loading = 'lazy';
        }
        
        if (!img.decoding) {
            img.decoding = 'async';
        }
        
        // Optimiser pour les écrans haute densité
        if (window.devicePixelRatio > 1) {
            this.setupResponsiveImage(img);
        }
        
        // Observer pour lazy loading
        if (this.observers.intersection && img.classList.contains('lazy-image')) {
            this.observers.intersection.observe(img);
        }
    }
    
    generatePlaceholder(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Gradient de placeholder
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#2a2a2a');
        gradient.addColorStop(1, '#1a1a1a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        return canvas.toDataURL('image/png');
    }
    
    setupResponsiveImage(img) {
        if (img.dataset.src) {
            const originalSrc = img.dataset.src;
            const extension = originalSrc.split('.').pop().toLowerCase();
            
            // Générer les sources WebP si possible
            if (this.supportsWebP()) {
                const webpSrc = originalSrc.replace(new RegExp(`\\.${extension}$`), '.webp');
                img.dataset.srcWebp = webpSrc;
            }
            
            // Générer les tailles responsives
            const sizes = [480, 768, 1024, 1440];
            const srcset = sizes.map(size => 
                `${originalSrc.replace(`.${extension}`, `_${size}w.${extension}`)} ${size}w`
            ).join(', ');
            
            img.dataset.srcset = srcset;
        }
    }
    
    loadImage(img) {
        const startTime = performance.now();
        
        // Vérifier le cache d'abord
        const cacheKey = img.dataset.src || img.src;
        if (this.cache.images.has(cacheKey)) {
            const cachedData = this.cache.images.get(cacheKey);
            img.src = cachedData.url;
            img.classList.add('lazy-loaded');
            this.updateCacheHitRate(true);
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const newImg = new Image();
            
            newImg.onload = () => {
                const loadTime = performance.now() - startTime;
                
                // Utiliser WebP si disponible et supporté
                if (img.dataset.srcWebp && this.supportsWebP()) {
                    img.src = img.dataset.srcWebp;
                } else if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.src = img.dataset.src;
                } else {
                    img.src = img.dataset.src;
                }
                
                img.classList.add('lazy-loaded');
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                // Fade in effect
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 50);
                
                // Mettre en cache
                this.addToCache(cacheKey, {
                    url: img.src,
                    size: this.estimateImageSize(newImg),
                    timestamp: Date.now()
                });
                
                this.updateCacheHitRate(false);
                console.log(`🖼️ Image chargée: ${loadTime.toFixed(2)}ms`);
                resolve();
            };
            
            newImg.onerror = () => {
                console.error('❌ Erreur de chargement image:', img.dataset.src);
                img.src = this.generatePlaceholder(300, 400);
                img.classList.add('lazy-error');
                reject();
            };
            
            newImg.src = img.dataset.src;
        });
    }
    
    addToCache(key, data) {
        // Vérifier la taille du cache
        if (this.cache.currentSize + data.size > this.cache.maxSize) {
            this.cleanCache();
        }
        
        this.cache.images.set(key, data);
        this.cache.currentSize += data.size;
    }
    
    cleanCache() {
        // Supprimer les images les plus anciennes
        const entries = Array.from(this.cache.images.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = Math.ceil(entries.length * 0.3); // Supprimer 30%
        
        for (let i = 0; i < toRemove; i++) {
            const [key, data] = entries[i];
            this.cache.images.delete(key);
            this.cache.currentSize -= data.size;
        }
        
        console.log(`🧹 Cache nettoyé: ${toRemove} images supprimées`);
    }
    
    estimateImageSize(img) {
        // Estimation basée sur les dimensions et la qualité
        const width = img.naturalWidth || img.width || 300;
        const height = img.naturalHeight || img.height || 400;
        return Math.round(width * height * 0.5); // Estimation approximative
    }
    
    updateCacheHitRate(isHit) {
        const currentHits = this.metrics.cacheHitRate * 100;
        const newHits = isHit ? currentHits + 1 : currentHits;
        this.metrics.cacheHitRate = newHits / 101;
    }
    
    setupPreloading() {
        // Précharger les images importantes
        this.preloadCriticalImages();
        
        // Précharger intelligemment basé sur le comportement utilisateur
        this.setupIntelligentPreloading();
    }
    
    preloadCriticalImages() {
        // Précharger les images visibles immédiatement
        const criticalImages = document.querySelectorAll('img[data-critical="true"]');
        criticalImages.forEach(img => {
            if (img.dataset.src) {
                this.loadImage(img);
            }
        });
    }
    
    setupIntelligentPreloading() {
        let scrollDirection = 'down';
        let lastScrollY = window.scrollY;
        
        const preloadOnScroll = this.throttle(() => {
            const currentScrollY = window.scrollY;
            scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = currentScrollY;
            
            // Précharger les images dans la direction du scroll
            const viewport = window.innerHeight;
            const scrollTop = window.scrollY;
            const preloadDistance = scrollDirection === 'down' ? viewport * 2 : viewport;
            
            const lazyImages = document.querySelectorAll('img.lazy-image:not(.lazy-loaded)');
            lazyImages.forEach(img => {
                const rect = img.getBoundingClientRect();
                const distanceFromViewport = scrollDirection === 'down' 
                    ? rect.top - viewport
                    : viewport - rect.bottom;
                
                if (distanceFromViewport < preloadDistance && distanceFromViewport > -viewport) {
                    this.loadImage(img);
                }
            });
        }, 100);
        
        window.addEventListener('scroll', preloadOnScroll, { passive: true });
    }
    
    monitorMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
                
                // Nettoyer le cache si la mémoire est élevée
                if (this.metrics.memoryUsage > 100) { // Plus de 100MB
                    this.cleanCache();
                }
            }, 30000); // Vérifier toutes les 30 secondes
        }
    }
    
    setupScrollOptimization() {
        let isScrolling = false;
        
        const optimizedScroll = () => {
            if (!isScrolling) {
                requestAnimationFrame(() => {
                    // Mesurer les performances de scroll
                    const scrollStart = performance.now();
                    
                    // Optimiser les éléments pendant le scroll
                    this.optimizeScrollElements();
                    
                    const scrollTime = performance.now() - scrollStart;
                    this.metrics.scrollPerformance.push(scrollTime);
                    
                    // Garder seulement les 50 dernières mesures
                    if (this.metrics.scrollPerformance.length > 50) {
                        this.metrics.scrollPerformance.shift();
                    }
                    
                    isScrolling = false;
                });
            }
            isScrolling = true;
        };
        
        window.addEventListener('scroll', optimizedScroll, { passive: true });
    }
    
    optimizeScrollElements() {
        // Masquer les éléments non visibles pour améliorer les performances
        const elements = document.querySelectorAll('.manga-card, .scan-image');
        const viewport = {
            top: window.scrollY,
            bottom: window.scrollY + window.innerHeight
        };
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementBottom = elementTop + rect.height;
            
            const isVisible = elementBottom >= viewport.top - 200 && 
                             elementTop <= viewport.bottom + 200;
            
            if (isVisible) {
                element.style.visibility = 'visible';
                element.style.transform = 'translateZ(0)'; // Force GPU acceleration
            } else {
                element.style.visibility = 'hidden';
            }
        });
    }
    
    supportsWebP() {
        if (this._webpSupport !== undefined) {
            return this._webpSupport;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this._webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
        
        return this._webpSupport;
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // API publique
    getMetrics() {
        const avgScrollTime = this.metrics.scrollPerformance.length > 0
            ? this.metrics.scrollPerformance.reduce((a, b) => a + b) / this.metrics.scrollPerformance.length
            : 0;
        
        return {
            loadTime: this.metrics.loadTime,
            memoryUsage: this.metrics.memoryUsage,
            cacheSize: this.cache.currentSize / 1024 / 1024, // MB
            cacheHitRate: (this.metrics.cacheHitRate * 100).toFixed(1) + '%',
            averageScrollTime: avgScrollTime.toFixed(2) + 'ms',
            imagesInCache: this.cache.images.size,
            slowImages: Array.from(this.metrics.imageLoadTimes.entries())
                .filter(([_, time]) => time > 2000).length
        };
    }
    
    clearCache() {
        this.cache.images.clear();
        this.cache.currentSize = 0;
        this.metrics.cacheHitRate = 0;
        console.log('🧹 Cache d\'images vidé');
    }
    
    preloadImages(urls) {
        urls.forEach(url => {
            if (!this.cache.images.has(url)) {
                const img = new Image();
                img.onload = () => {
                    this.addToCache(url, {
                        url: url,
                        size: this.estimateImageSize(img),
                        timestamp: Date.now()
                    });
                };
                img.src = url;
            }
        });
    }
    
    optimizeForDevice() {
        // Ajuster les optimisations selon l'appareil
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            const slowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
            
            if (slowConnection) {
                // Réduire la qualité des images
                this.cache.maxSize = 10 * 1024 * 1024; // 10MB seulement
                
                // Désactiver le préchargement intelligent
                console.log('📱 Connexion lente détectée: optimisations activées');
            }
        }
        
        // Optimisations pour mobile
        if ('ontouchstart' in window) {
            // Réduire les animations sur mobile
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
        }
    }
    
    generatePerformanceReport() {
        const metrics = this.getMetrics();
        const report = {
            timestamp: new Date().toISOString(),
            performance: metrics,
            recommendations: []
        };
        
        // Générer des recommandations
        if (parseFloat(metrics.cacheHitRate) < 50) {
            report.recommendations.push('Améliorer le cache d\'images');
        }
        
        if (metrics.memoryUsage > 100) {
            report.recommendations.push('Réduire l\'utilisation mémoire');
        }
        
        if (metrics.slowImages > 5) {
            report.recommendations.push('Optimiser les images lentes');
        }
        
        console.table(report.performance);
        return report;
    }
}

// CSS pour les optimisations visuelles
const performanceStyles = `
.lazy-image {
    opacity: 0;
    transition: opacity 0.3s ease;
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    background-size: 400% 400%;
    animation: shimmer 1.5s ease-in-out infinite;
}

.lazy-loaded {
    opacity: 1;
    animation: none;
}

.lazy-error {
    opacity: 0.5;
    filter: grayscale(100%);
}

@keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* Optimisations pour les performances de scroll */
.manga-card,
.scan-image {
    will-change: transform;
    backface-visibility: hidden;
}

/* Optimisations pour mobile */
@media (max-width: 768px) {
    .lazy-image {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
    }
    
    * {
        -webkit-tap-highlight-color: transparent;
    }
}

/* Performance monitor (dev only) */
.performance-monitor {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    display: none;
}

.performance-monitor.visible {
    display: block;
}
`;

// Injecter les styles
const performanceStyleSheet = document.createElement('style');
performanceStyleSheet.textContent = performanceStyles;
document.head.appendChild(performanceStyleSheet);

// Créer le moniteur de performance (dev)
function createPerformanceMonitor() {
    const monitor = document.createElement('div');
    monitor.className = 'performance-monitor';
    monitor.innerHTML = `
        <div>📊 Performance Monitor</div>
        <div id="perf-memory">Mémoire: --</div>
        <div id="perf-cache">Cache: --</div>
        <div id="perf-images">Images: --</div>
    `;
    document.body.appendChild(monitor);
    
    // Toggle avec Ctrl+Shift+P
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            monitor.classList.toggle('visible');
        }
    });
    
    return monitor;
}

// Initialiser le gestionnaire de performance
let performanceManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        performanceManager = new PerformanceManager();
        window.performanceManager = performanceManager;
        
        // Créer le moniteur en mode développement
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const monitor = createPerformanceMonitor();
            
            // Mettre à jour le moniteur
            setInterval(() => {
                if (monitor.classList.contains('visible')) {
                    const metrics = performanceManager.getMetrics();
                    document.getElementById('perf-memory').textContent = `Mémoire: ${metrics.memoryUsage.toFixed(1)}MB`;
                    document.getElementById('perf-cache').textContent = `Cache: ${metrics.cacheSize.toFixed(1)}MB (${metrics.cacheHitRate})`;
                    document.getElementById('perf-images').textContent = `Images: ${metrics.imagesInCache}`;
                }
            }, 1000);
        }
        
        // Optimiser pour l'appareil
        performanceManager.optimizeForDevice();
    });
} else {
    performanceManager = new PerformanceManager();
    window.performanceManager = performanceManager;
    performanceManager.optimizeForDevice();
}
