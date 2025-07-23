/**
 * 🚀 App Initializer - Coordinateur principal de l'application
 */

class AppInitializer {
    constructor() {
        this.managers = {
            pwa: null,
            gesture: null,
            search: null,
            performance: null,
            theme: null
        };
        
        this.initializationOrder = [
            'performance',
            'theme', 
            'pwa',
            'gesture',
            'search'
        ];
        
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        console.log('🚀 Initialisation de l\'application...');
        
        try {
            // Attendre que le DOM soit prêt
            await this.waitForDOM();
            
            // Initialiser dans l'ordre spécifié
            for (const managerName of this.initializationOrder) {
                await this.initializeManager(managerName);
            }
            
            // Configuration finale
            this.setupGlobalEventHandlers();
            this.connectManagers();
            this.showWelcomeMessage();
            
            this.isInitialized = true;
            console.log('✅ Application initialisée avec succès');
            
            // Émettre un événement global
            window.dispatchEvent(new CustomEvent('app:initialized', {
                detail: { managers: this.managers }
            }));
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showErrorMessage('Erreur d\'initialisation');
        }
    }
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    async initializeManager(managerName) {
        try {
            console.log(`🔧 Initialisation du ${managerName} manager...`);
            
            switch (managerName) {
                case 'performance':
                    if (typeof PerformanceManager !== 'undefined') {
                        this.managers.performance = new PerformanceManager();
                        window.performanceManager = this.managers.performance;
                    }
                    break;
                    
                case 'theme':
                    if (typeof ThemeManager !== 'undefined') {
                        this.managers.theme = new ThemeManager();
                        window.themeManager = this.managers.theme;
                    }
                    break;
                    
                case 'pwa':
                    if (typeof PWAManager !== 'undefined') {
                        this.managers.pwa = new PWAManager();
                        window.pwaManager = this.managers.pwa;
                    }
                    break;
                    
                case 'gesture':
                    if (typeof GestureManager !== 'undefined') {
                        this.managers.gesture = new GestureManager();
                        window.gestureManager = this.managers.gesture;
                        this.setupGestureIntegration();
                    }
                    break;
                    
                case 'search':
                    // Attendre que la bibliothèque soit chargée
                    await this.waitForLibrary();
                    if (typeof SearchManager !== 'undefined') {
                        this.managers.search = new SearchManager();
                        window.searchManager = this.managers.search;
                    }
                    break;
            }
            
            console.log(`✅ ${managerName} manager initialisé`);
            
        } catch (error) {
            console.warn(`⚠️ Erreur avec ${managerName} manager:`, error);
        }
    }
    
    waitForLibrary() {
        return new Promise((resolve) => {
            const checkLibrary = () => {
                if (window.mangasLibrary) {
                    resolve();
                } else {
                    setTimeout(checkLibrary, 100);
                }
            };
            checkLibrary();
        });
    }
    
    setupGestureIntegration() {
        if (!this.managers.gesture) return;
        
        // Intégrer les gestes avec le lecteur
        this.managers.gesture.on('swipeleft', () => {
            if (typeof nextScan === 'function') {
                nextScan();
            }
        });
        
        this.managers.gesture.on('swiperight', () => {
            if (typeof prevScan === 'function') {
                prevScan();
            }
        });
        
        this.managers.gesture.on('pinch', (data) => {
            if (typeof changeZoom === 'function') {
                const newZoom = Math.max(0.5, Math.min(3, data.scale));
                changeZoom(newZoom);
            }
        });
        
        this.managers.gesture.on('doubletap', () => {
            if (typeof toggleFullscreen === 'function') {
                toggleFullscreen();
            }
        });
        
        this.managers.gesture.on('longpress', (data) => {
            // Afficher un menu contextuel
            this.showContextMenu(data.x, data.y);
        });
        
        console.log('🤏 Gestes intégrés avec le lecteur');
    }
    
    setupGlobalEventHandlers() {
        // Raccourcis clavier globaux
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K pour ouvrir la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Ctrl/Cmd + , pour ouvrir les paramètres
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.openSettings();
            }
            
            // Ctrl/Cmd + Shift + T pour basculer le thème
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // F11 pour le plein écran
            if (e.key === 'F11') {
                e.preventDefault();
                if (typeof toggleFullscreen === 'function') {
                    toggleFullscreen();
                }
            }
        });
        
        // Gestion du changement de visibilité
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onAppHidden();
            } else {
                this.onAppVisible();
            }
        });
        
        // Gestion des erreurs globales
        window.addEventListener('error', (e) => {
            console.error('Erreur globale:', e.error);
            this.reportError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rejetée:', e.reason);
            this.reportError(e.reason);
        });
    }
    
    connectManagers() {
        // Connecter les gestionnaires entre eux
        
        // Mettre à jour l'index de recherche quand la bibliothèque change
        if (this.managers.search) {
            window.addEventListener('library:updated', () => {
                this.managers.search.updateIndex();
            });
        }
        
        // Optimiser les performances selon le thème
        if (this.managers.theme && this.managers.performance) {
            this.managers.theme.on?.('themeChanged', (theme) => {
                if (theme === 'light') {
                    // Optimisations pour le thème clair
                    this.managers.performance.optimizeForLightTheme?.();
                }
            });
        }
        
        // Synchroniser PWA avec les autres gestionnaires
        if (this.managers.pwa) {
            this.managers.pwa.on?.('installed', () => {
                this.showNotification('📱 Application installée !', 'success');
            });
            
            this.managers.pwa.on?.('updateAvailable', () => {
                this.showUpdatePrompt();
            });
        }
    }
    
    focusSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        } else {
            // Ouvrir l'onglet bibliothèque si pas déjà ouvert
            const libraryTab = document.querySelector('[data-tab="library"]');
            if (libraryTab) {
                libraryTab.click();
                setTimeout(() => {
                    const input = document.getElementById('search-input');
                    if (input) input.focus();
                }, 100);
            }
        }
    }
    
    openSettings() {
        const settingsTab = document.querySelector('[data-tab="settings"]');
        if (settingsTab) {
            settingsTab.click();
        }
    }
    
    toggleTheme() {
        if (this.managers.theme) {
            const themes = Object.keys(this.managers.theme.themes);
            const currentIndex = themes.indexOf(this.managers.theme.currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            this.managers.theme.setTheme(themes[nextIndex]);
        }
    }
    
    showContextMenu(x, y) {
        // Créer un menu contextuel temporaire
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 0.5rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            min-width: 150px;
        `;
        
        const menuItems = [
            { text: '📖 Mode lecture', action: () => this.toggleReadingMode() },
            { text: '🔍 Rechercher', action: () => this.focusSearch() },
            { text: '⚙️ Paramètres', action: () => this.openSettings() },
            { text: '🎨 Changer thème', action: () => this.toggleTheme() }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.textContent = item.text;
            menuItem.style.cssText = `
                padding: 0.5rem 1rem;
                cursor: pointer;
                transition: background 0.2s ease;
                color: var(--text-primary);
            `;
            
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(menu);
            });
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = 'var(--bg-secondary)';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'transparent';
            });
            
            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Supprimer le menu en cliquant ailleurs
        setTimeout(() => {
            const removeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    document.body.removeChild(menu);
                    document.removeEventListener('click', removeMenu);
                }
            };
            document.addEventListener('click', removeMenu);
        }, 100);
    }
    
    toggleReadingMode() {
        document.body.classList.toggle('reading-mode');
        if (document.body.classList.contains('reading-mode')) {
            this.showNotification('📖 Mode lecture activé', 'info');
        } else {
            this.showNotification('📖 Mode lecture désactivé', 'info');
        }
    }
    
    onAppHidden() {
        console.log('📱 Application mise en arrière-plan');
        // Pauser les animations coûteuses
        if (this.managers.performance) {
            this.managers.performance.pauseAnimations?.();
        }
    }
    
    onAppVisible() {
        console.log('📱 Application remise au premier plan');
        // Reprendre les animations
        if (this.managers.performance) {
            this.managers.performance.resumeAnimations?.();
        }
        
        // Vérifier les mises à jour PWA
        if (this.managers.pwa) {
            this.managers.pwa.checkForUpdates?.();
        }
    }
    
    reportError(error) {
        // Reporter l'erreur (analytics, logging, etc.)
        console.error('📊 Rapport d\'erreur:', error);
        
        // Optionnel: envoyer à un service d'analytics
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message || error.toString(),
                fatal: false
            });
        }
    }
    
    showWelcomeMessage() {
        // Afficher un message de bienvenue pour les nouveaux utilisateurs
        const isFirstVisit = !localStorage.getItem('hasVisited');
        
        if (isFirstVisit) {
            localStorage.setItem('hasVisited', 'true');
            
            setTimeout(() => {
                this.showNotification('🎌 Bienvenue dans Anime Scans Reader !', 'info', 5000);
                
                // Suggestion d'installation PWA
                if (this.managers.pwa && this.managers.pwa.canInstall) {
                    setTimeout(() => {
                        this.showNotification('💡 Vous pouvez installer cette app pour une meilleure expérience', 'info', 7000);
                    }, 3000);
                }
            }, 2000);
        }
    }
    
    showUpdatePrompt() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-prompt';
        updateNotification.innerHTML = `
            <div class="update-content">
                <h4>🔄 Mise à jour disponible</h4>
                <p>Une nouvelle version de l'application est disponible.</p>
                <div class="update-actions">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove(); window.pwaManager?.updateApp()">
                        Mettre à jour
                    </button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Plus tard
                    </button>
                </div>
            </div>
        `;
        
        updateNotification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(updateNotification);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `app-notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 1rem;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-left: 4px solid var(--${type === 'error' ? 'error' : type === 'success' ? 'success' : 'accent'}-color);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animation de sortie
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // API publique
    getStatus() {
        return {
            initialized: this.isInitialized,
            managers: Object.keys(this.managers).reduce((acc, key) => {
                acc[key] = this.managers[key] !== null;
                return acc;
            }, {}),
            features: {
                pwa: !!this.managers.pwa,
                gestures: !!this.managers.gesture,
                search: !!this.managers.search,
                performance: !!this.managers.performance,
                themes: !!this.managers.theme
            }
        };
    }
    
    restart() {
        console.log('🔄 Redémarrage de l\'application...');
        location.reload();
    }
}

// Initialiser l'application
window.appInitializer = new AppInitializer();

// API globale pour le debugging
window.app = {
    status: () => window.appInitializer.getStatus(),
    restart: () => window.appInitializer.restart(),
    managers: () => window.appInitializer.managers,
    version: '2.0.0'
};

console.log('🎌 Anime Scans Reader v2.0.0 - Enhanced Edition');
