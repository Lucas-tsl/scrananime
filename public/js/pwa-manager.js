/**
 * 🎌 PWA Manager - Gestion de l'application web progressive
 */

class PWAManager {
    constructor() {
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.installPrompt = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 PWA Manager: Initialisation');
        
        // Enregistrer le service worker
        await this.registerServiceWorker();
        
        // Configurer les événements PWA
        this.setupPWAEvents();
        
        // Détecter si installable
        this.setupInstallPrompt();
        
        // Gérer le statut en ligne/hors ligne
        this.setupOnlineStatus();
        
        // Vérifier les mises à jour
        this.checkForUpdates();
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker enregistré:', this.swRegistration.scope);
                
                // Écouter les messages du service worker
                navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
                
                // Écouter les mises à jour
                this.swRegistration.addEventListener('updatefound', () => {
                    console.log('🔄 Mise à jour trouvée');
                    this.handleServiceWorkerUpdate();
                });
                
            } catch (error) {
                console.error('❌ Erreur Service Worker:', error);
            }
        } else {
            console.warn('⚠️ Service Worker non supporté');
        }
    }
    
    setupPWAEvents() {
        // Détecter l'installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installée');
            this.showNotification('🎉 Application installée avec succès !', 'success');
        });
    }
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('💾 Prompt d\'installation disponible');
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallBanner();
        });
    }
    
    showInstallBanner() {
        // Créer une bannière d'installation
        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-text">
                    <strong>📱 Installer Scrananime</strong>
                    <p>Accès rapide et lecture hors ligne</p>
                </div>
                <div class="pwa-banner-actions">
                    <button class="btn btn-primary" onclick="pwaManager.installApp()">Installer</button>
                    <button class="btn btn-secondary" onclick="pwaManager.dismissInstallBanner()">Plus tard</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Auto-hide après 10 secondes
        setTimeout(() => {
            if (banner.parentNode) {
                this.dismissInstallBanner();
            }
        }, 10000);
    }
    
    async installApp() {
        if (!this.installPrompt) return;
        
        try {
            await this.installPrompt.prompt();
            const { outcome } = await this.installPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ Installation acceptée');
            } else {
                console.log('❌ Installation refusée');
            }
            
            this.installPrompt = null;
            this.dismissInstallBanner();
            
        } catch (error) {
            console.error('❌ Erreur installation:', error);
        }
    }
    
    dismissInstallBanner() {
        const banner = document.querySelector('.pwa-install-banner');
        if (banner) {
            banner.remove();
        }
    }
    
    setupOnlineStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connexion rétablie');
            this.showNotification('🌐 Connexion rétablie', 'info');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📡 Mode hors ligne');
            this.showNotification('📡 Mode hors ligne activé', 'warning');
        });
    }
    
    async checkForUpdates() {
        if (!this.swRegistration) return;
        
        try {
            await this.swRegistration.update();
            console.log('🔍 Vérification des mises à jour terminée');
        } catch (error) {
            console.error('❌ Erreur vérification MAJ:', error);
        }
    }
    
    handleServiceWorkerUpdate() {
        const newWorker = this.swRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 Nouvelle version disponible');
                this.showUpdateAvailable();
            }
        });
    }
    
    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'pwa-update-banner';
        updateBanner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-text">
                    <strong>🔄 Mise à jour disponible</strong>
                    <p>Redémarrez pour profiter des nouveautés</p>
                </div>
                <div class="pwa-banner-actions">
                    <button class="btn btn-primary" onclick="pwaManager.applyUpdate()">Redémarrer</button>
                    <button class="btn btn-secondary" onclick="pwaManager.dismissUpdateBanner()">Plus tard</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
    }
    
    async applyUpdate() {
        if (!this.swRegistration) return;
        
        // Demander au nouveau SW de prendre le contrôle
        if (this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Recharger la page
        window.location.reload();
    }
    
    dismissUpdateBanner() {
        const banner = document.querySelector('.pwa-update-banner');
        if (banner) {
            banner.remove();
        }
    }
    
    handleSWMessage(event) {
        const { type, message } = event.data;
        
        switch (type) {
            case 'UPDATE_AVAILABLE':
                this.showUpdateAvailable();
                break;
            case 'CACHE_UPDATED':
                console.log('📦 Cache mis à jour');
                break;
        }
    }
    
    // Précharger un manga pour lecture hors ligne
    async precacheManga(mangaId) {
        if (!this.swRegistration || !window.mangasLibrary) return;
        
        try {
            const manga = window.mangasLibrary[mangaId];
            if (!manga) return;
            
            const imageUrls = manga.scans.map(scan => scan.image);
            
            // Envoyer au service worker
            navigator.serviceWorker.controller?.postMessage({
                type: 'CACHE_MANGA',
                data: { images: imageUrls }
            });
            
            this.showNotification(`📦 ${manga.info.name} mis en cache pour lecture hors ligne`, 'success');
            
        } catch (error) {
            console.error('❌ Erreur précache manga:', error);
        }
    }
    
    // Obtenir les infos de cache
    async getCacheInfo() {
        return new Promise((resolve) => {
            if (!navigator.serviceWorker.controller) {
                resolve({});
                return;
            }
            
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_CACHE_INFO' }, 
                [channel.port2]
            );
        });
    }
    
    // Vider le cache
    async clearCache(cacheName = null) {
        if (!navigator.serviceWorker.controller) return;
        
        navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE',
            data: { cacheName }
        });
        
        this.showNotification('🗑️ Cache vidé', 'success');
    }
    
    // Synchroniser les données hors ligne
    async syncOfflineData() {
        // Ici on peut synchroniser les favoris, progression, etc.
        console.log('🔄 Synchronisation des données hors ligne...');
        
        if (window.settings && typeof window.saveSettings === 'function') {
            window.saveSettings();
        }
    }
    
    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`📢 ${message}`);
        }
    }
    
    // Détecter si l'app est installée
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }
    
    // Obtenir les statistiques PWA
    getStats() {
        return {
            isOnline: this.isOnline,
            isInstalled: this.isInstalled(),
            swRegistered: !!this.swRegistration,
            canInstall: !!this.installPrompt
        };
    }
}

// CSS pour les bannières PWA
const pwaStyles = `
.pwa-install-banner,
.pwa-update-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    z-index: 10000;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease-out;
}

.pwa-banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    gap: 1rem;
}

.pwa-banner-text p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
}

.pwa-banner-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

.pwa-banner-actions .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pwa-banner-actions .btn-primary {
    background: rgba(255,255,255,0.2);
    color: white;
}

.pwa-banner-actions .btn-secondary {
    background: rgba(255,255,255,0.1);
    color: white;
}

.pwa-banner-actions .btn:hover {
    transform: translateY(-1px);
    background: rgba(255,255,255,0.3);
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .pwa-banner-content {
        flex-direction: column;
        text-align: center;
    }
    
    .pwa-banner-actions {
        justify-content: center;
    }
}

/* Indicateur de statut hors ligne */
.offline-indicator {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #f39c12;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

// Injecter les styles PWA
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);

// Initialiser le PWA Manager
let pwaManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pwaManager = new PWAManager();
        window.pwaManager = pwaManager;
    });
} else {
    pwaManager = new PWAManager();
    window.pwaManager = pwaManager;
}
