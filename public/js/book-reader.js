// ===== BOOK READER - Lecteur de Manga Mode Livre =====

// Variables globales
let currentManga = null;
let currentPages = [];
let currentPageIndex = 0;
let mangasLibrary = {};
let readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '{}');
let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
let settings = JSON.parse(localStorage.getItem('readerSettings') || '{}');

// Variables pour le système de zoom
let currentZoom = 1;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let imageStartX = 0;
let imageStartY = 0;
let imageOffsetX = 0;
let imageOffsetY = 0;

// Données de démonstration pour GitHub Pages (quand pas de serveur)
const demoData = {
    "naruto": {
        "info": {
            "name": "Naruto",
            "description": "L'histoire d'un ninja déterminé"
        },
        "scans": [
            {
                "chapter": "Chapitre 1",
                "page": 1,
                "image": "https://via.placeholder.com/400x600/FF6B35/FFFFFF?text=Naruto+Ch.1+P.1",
                "url": "#"
            },
            {
                "chapter": "Chapitre 1", 
                "page": 2,
                "image": "https://via.placeholder.com/400x600/FF6B35/FFFFFF?text=Naruto+Ch.1+P.2",
                "url": "#"
            },
            {
                "chapter": "Chapitre 2",
                "page": 1,
                "image": "https://via.placeholder.com/400x600/FF6B35/FFFFFF?text=Naruto+Ch.2+P.1",
                "url": "#"
            }
        ]
    },
    "onepiece": {
        "info": {
            "name": "One Piece",
            "description": "L'aventure des pirates du chapeau de paille"
        },
        "scans": [
            {
                "chapter": "Chapitre 1",
                "page": 1,
                "image": "https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=One+Piece+Ch.1+P.1",
                "url": "#"
            },
            {
                "chapter": "Chapitre 1",
                "page": 2,
                "image": "https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=One+Piece+Ch.1+P.2",
                "url": "#"
            }
        ]
    },
    "demonslayer": {
        "info": {
            "name": "Demon Slayer",
            "description": "Les chasseurs de démons"
        },
        "scans": [
            {
                "chapter": "Chapitre 1",
                "page": 1,
                "image": "https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Demon+Slayer+Ch.1+P.1",
                "url": "#"
            }
        ]
    }
};

// Configuration par défaut
const defaultSettings = {
    darkMode: false,
    fullscreenDefault: false,
    autoNavigation: false,
    readingSpeed: 8,
    fitMode: 'contain',
    zoom: 1,
    brightness: 1
};

// Fusionner avec les paramètres par défaut
settings = { ...defaultSettings, ...settings };

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎌 Initialisation du lecteur de manga...');
    
    initializeSettings();
    initializeAdvancedSettings();
    setupEventListeners();
    setupResponsiveListeners();
    loadMangaLibrary();
    loadReadingHistory();
    loadBookmarks();
});

// Configuration responsive
function setupResponsiveListeners() {
    // Écouter les changements de breakpoint
    window.addEventListener('breakpointchange', (e) => {
        console.log('📱 Breakpoint changé:', e.detail.breakpoint);
        adjustLayoutForBreakpoint(e.detail.breakpoint);
    });
    
    // Ajuster la layout au redimensionnement
    window.addEventListener('resize', debounce(() => {
        adjustReaderLayout();
    }, 150));
}

// Ajuster la layout selon le breakpoint
function adjustLayoutForBreakpoint(breakpoint) {
    const reader = document.getElementById('book-reader');
    if (!reader) return;
    
    // Ajuster les contrôles selon l'écran
    switch (breakpoint) {
        case 'mobile':
            optimizeMobileControls();
            break;
        case 'tablet':
            optimizeTabletControls();
            break;
        case 'desktop':
            optimizeDesktopControls();
            break;
    }
}

// Optimisations mobiles
function optimizeMobileControls() {
    const zoomControls = document.querySelector('.zoom-controls');
    if (zoomControls) {
        zoomControls.style.flexDirection = 'row';
        zoomControls.style.top = '10px';
        zoomControls.style.right = '10px';
    }
    
    const chapterSidebar = document.querySelector('.chapter-sidebar');
    if (chapterSidebar) {
        chapterSidebar.style.width = '100%';
    }
}

// Optimisations tablette
function optimizeTabletControls() {
    const zoomControls = document.querySelector('.zoom-controls');
    if (zoomControls) {
        zoomControls.style.flexDirection = 'column';
        zoomControls.style.top = '15px';
        zoomControls.style.right = '15px';
    }
    
    const chapterSidebar = document.querySelector('.chapter-sidebar');
    if (chapterSidebar) {
        chapterSidebar.style.width = '280px';
    }
}

// Optimisations desktop
function optimizeDesktopControls() {
    const zoomControls = document.querySelector('.zoom-controls');
    if (zoomControls) {
        zoomControls.style.flexDirection = 'column';
        zoomControls.style.top = '20px';
        zoomControls.style.right = '20px';
    }
    
    const chapterSidebar = document.querySelector('.chapter-sidebar');
    if (chapterSidebar) {
        chapterSidebar.style.width = '350px';
    }
}

// Debounce utility
function debounce(func, wait) {
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

// Initialiser les paramètres
function initializeSettings() {
    // Mode sombre
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode').checked = true;
    }
    
    // Autres paramètres
    document.getElementById('fullscreen-default').checked = settings.fullscreenDefault;
    document.getElementById('auto-navigation').checked = settings.autoNavigation;
    document.getElementById('reading-speed').value = settings.readingSpeed;
    document.getElementById('speed-value').textContent = settings.readingSpeed + 's';
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation entre onglets
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Paramètres
    document.getElementById('dark-mode').addEventListener('change', toggleDarkMode);
    document.getElementById('reading-speed').addEventListener('input', updateReadingSpeed);
    
    // Navigation au clavier
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Gestion du redimensionnement
    window.addEventListener('resize', adjustReaderLayout);
}

// ===== GESTION DES ONGLETS =====
function switchTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Désactiver tous les boutons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activer l'onglet et le bouton correspondants
    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`[data-tab=\"${tabName}\"]`).classList.add('active');
    
    // Actions spécifiques par onglet
    switch(tabName) {
        case 'library':
            if (Object.keys(mangasLibrary).length === 0) {
                loadMangaLibrary();
            }
            break;
        case 'reading':
            updateCurrentReading();
            break;
        case 'favorites':
            updateFavoritesList();
            break;
        case 'settings':
            updateSettingsStats();
            initializeAdvancedSettings();
            break;
    }
}

// ===== CHARGEMENT DE LA BIBLIOTHÈQUE =====
async function loadMangaLibrary() {
    try {
        console.log('📚 Chargement de la bibliothèque...');
        
        // Tenter de charger depuis l'API 
        try {
            const response = await fetch('/api/mangas?maxChaptersPerManga=5&maxPagesPerChapter=15');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    mangasLibrary = data.data;
                    displayMangaLibrary();
                    updateLibraryStats();
                    console.log('✅ Bibliothèque chargée depuis API:', Object.keys(mangasLibrary).length, 'mangas');
                    return;
                }
            }
        } catch (apiError) {
            console.log('ℹ️ API non disponible, utilisation des données de démo...');
        }
        
        // Fallback vers les données de démo (GitHub Pages)
        mangasLibrary = demoData;
        displayMangaLibrary();
        updateLibraryStats();
        
        console.log('✅ Bibliothèque démo chargée:', Object.keys(mangasLibrary).length, 'mangas');
        
        // Afficher un message d'information
        const container = document.getElementById('manga-library');
        const demoNotice = document.createElement('div');
        demoNotice.className = 'demo-notice';
        demoNotice.innerHTML = `
            <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; text-align: center;">
                <strong>📋 Mode Démonstration</strong><br>
                <small>Vous visualisez des données de test. Pour l'expérience complète, clonez le repository et lancez le serveur local.</small>
            </div>
        `;
        container.parentNode.insertBefore(demoNotice, container);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        showLibraryError(error.message);
    }
}

// Afficher la bibliothèque
function displayMangaLibrary() {
    const container = document.getElementById('manga-library');
    // DEBUG: Log the manga library to inspect image URLs
    console.log('[DEBUG] mangasLibrary:', JSON.stringify(mangasLibrary, null, 2));
    
    if (Object.keys(mangasLibrary).length === 0) {
        container.innerHTML = '<div class=\"loading-state\"><p>Aucun manga disponible</p></div>';
        return;
    }
    
    let html = '';
    
    for (const [mangaId, mangaData] of Object.entries(mangasLibrary)) {
        const totalPages = mangaData.scans.length;
        const readProgress = getReadingProgress(mangaId);
        const isBookmarked = bookmarks.includes(mangaId);
        const firstScan = totalPages > 0 ? mangaData.scans[0] : null;
        
        // Grouper par chapitres
        const chapters = groupPagesByChapter(mangaData.scans);
        const chapterCount = Object.keys(chapters).length;
        
        html += `
            <div class=\"manga-book\" onclick=\"openMangaReader('${mangaId}')\">
                <div class=\"manga-cover\">
                    ${firstScan ? 
                        `<img src=\"${firstScan.image}\" alt=\"${mangaData.info.name}\" 
                             onerror=\"this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI4MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIj5QYXMgZCdpbWFnZTwvdGV4dD4KPHN2Zz4K'\">`  :
                        '<div style=\"width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;\">📖</div>'
                    }
                    ${isBookmarked ? '<span class=\"manga-badge\">⭐</span>' : ''}
                    ${totalPages === 0 ? '<span class=\"manga-badge\" style=\"background: #ef4444;\">Vide</span>' : ''}
                </div>
                <div class=\"manga-info\">
                    <h3 class=\"manga-title\">${mangaData.info.name}</h3>
                    <div class=\"manga-stats\">
                        <span>📖 ${totalPages} pages</span>
                        <span>📚 ${chapterCount} chapitres</span>
                    </div>
                    ${totalPages > 0 ? `
                        <div class=\"manga-progress\">
                            <div class=\"progress-bar-fill\" style=\"width: ${readProgress}%\"></div>
                        </div>
                        <div class=\"manga-actions\">
                            <button class=\"btn btn-primary manga-read-btn\" 
                                    data-manga-id=\"${mangaId}\" 
                                    style=\"cursor: pointer;\">
                                📖 ${readProgress > 0 ? 'Continuer' : 'Commencer'}
                            </button>
                            <button class=\"btn btn-secondary manga-fav-btn\" 
                                    data-manga-id=\"${mangaId}\" 
                                    style=\"cursor: pointer;\">
                                ${isBookmarked ? '⭐' : '☆'}
                            </button>
                        </div>
                    ` : '<p style=\"color: #666; margin: 0;\">Aucune page disponible</p>'}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Ajouter les gestionnaires d'événements pour les boutons
    setupMangaButtonEvents();
}

// Configurer les événements des boutons de manga
function setupMangaButtonEvents() {
    console.log('🎮 Configuration des événements boutons...');
    
    // Boutons de lecture
    document.querySelectorAll('.manga-read-btn').forEach(btn => {
        const mangaId = btn.getAttribute('data-manga-id');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🔥 Bouton lecture cliqué pour:', mangaId);
            openMangaReader(mangaId);
        });
    });
    
    // Boutons favoris
    document.querySelectorAll('.manga-fav-btn').forEach(btn => {
        const mangaId = btn.getAttribute('data-manga-id');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('⭐ Bouton favori cliqué pour:', mangaId);
            toggleBookmark(mangaId);
        });
    });
    
    console.log('✅ Événements configurés pour', document.querySelectorAll('.manga-read-btn').length, 'boutons');
}

// Mettre à jour les statistiques
function updateLibraryStats() {
    const totalMangas = Object.keys(mangasLibrary).length;
    const totalPages = Object.values(mangasLibrary).reduce((sum, manga) => sum + manga.scans.length, 0);
    const totalBookmarks = bookmarks.length;
    
    document.getElementById('library-stats').innerHTML = `
        <span class=\"stat-item\">📚 ${totalMangas} mangas</span>
        <span class=\"stat-item\">📖 ${totalPages} pages</span>
        <span class=\"stat-item\">⭐ ${totalBookmarks} favoris</span>
    `;
}

// ===== LECTEUR DE MANGA =====
function openMangaReader(mangaId) {
    console.log('� FONCTION openMangaReader APPELÉE avec:', mangaId);
    console.log('📊 Données manga disponibles:', Object.keys(mangasLibrary));
    
    const mangaData = mangasLibrary[mangaId];
    console.log('📖 Données du manga:', mangaData);
    
    if (!mangaData || mangaData.scans.length === 0) {
        console.error('❌ Aucune page disponible pour:', mangaId);
        alert('Aucune page disponible pour ce manga');
        return;
    }
    
    console.log('✅ Ouverture du lecteur pour:', mangaId);
    
    currentManga = mangaId;
    currentPages = mangaData.scans;
    
    // Reprendre à la dernière page lue ou commencer au début
    const lastRead = readingHistory[mangaId];
    currentPageIndex = lastRead ? lastRead.pageIndex : 0;
    
    console.log('📄 Pages chargées:', currentPages.length, 'pages');
    console.log('📍 Index de départ:', currentPageIndex);
    
    // Afficher le lecteur
    showReader();
    updatePageDisplay();
    buildChapterNavigation();
    
    // Mode plein écran par défaut si activé
    if (settings.fullscreenDefault) {
        setTimeout(() => toggleReaderFullscreen(), 500);
    }
    
    console.log('✅ Lecteur ouvert:', mangaData.info.name, `(${currentPages.length} pages)`);
}

function showReader() {
    const reader = document.getElementById('book-reader');
    reader.classList.remove('hidden');
    reader.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Titre et info
    document.getElementById('reader-manga-title').textContent = mangasLibrary[currentManga].info.name;
    
    // Initialiser les contrôles de zoom
    initializeZoomControls();
    
    updatePageDisplay();
}

function closeReader() {
    const reader = document.getElementById('book-reader');
    reader.classList.add('hidden');
    reader.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Sauvegarder la progression
    saveReadingProgress();
    
    // Réinitialiser
    currentManga = null;
    currentPages = [];
    currentPageIndex = 0;
}

// Mettre à jour l'affichage de la page
function updatePageDisplay() {
    if (!currentPages || currentPages.length === 0) return;
    
    const page = currentPages[currentPageIndex];
    const pageImg = document.getElementById('current-page');
    const pageLoading = document.getElementById('page-loading');
    const pageCounter = document.getElementById('page-counter');
    const progressFill = document.getElementById('reading-progress');
    const chapterInfo = document.getElementById('reader-chapter-info');
    
    // Afficher le loader
    pageLoading.classList.add('active');
    pageImg.style.opacity = '0';
    
    // Mettre à jour les informations
    pageCounter.textContent = `${currentPageIndex + 1} / ${currentPages.length}`;
    chapterInfo.textContent = `${page.chapter} - Page ${page.page}`;
    
    // Barre de progression
    const progress = ((currentPageIndex + 1) / currentPages.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Charger l'image
    const newImg = new Image();
    newImg.onload = () => {
        pageImg.src = newImg.src;
        pageImg.alt = page.title;
        pageImg.style.opacity = '1';
        pageLoading.classList.remove('active');
        
        // Détection d'image verticale (manga)
        console.log('📏 Dimensions image:', newImg.naturalWidth, 'x', newImg.naturalHeight);
        
        // Supprimer les classes existantes
        pageImg.classList.remove('vertical-image');
        
        // Si l'image est plus haute que large, c'est probablement une page manga
        if (newImg.naturalHeight > newImg.naturalWidth) {
            pageImg.classList.add('vertical-image');
            console.log('📖 Image manga verticale détectée - affichage optimisé');
        }
        
        // Appliquer les paramètres d'affichage
        applyDisplaySettings();
    };
    
    newImg.onerror = () => {
        pageImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD4KPHN2Zz4K';
        pageImg.style.opacity = '1';
        pageLoading.classList.remove('active');
    };
    
    newImg.src = page.image;
    
    // Mettre à jour les boutons de navigation
    updateNavigationButtons();
    
    // Sauvegarder la progression
    saveReadingProgress();
    
    // Réinitialiser le zoom après changement de page
    resetZoom();
}

// ===== SYSTÈME DE ZOOM =====

// Initialiser les contrôles de zoom
function initializeZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    const imageContainer = document.getElementById('image-container');
    const pageImg = document.getElementById('current-page');
    
    if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn || !imageContainer || !pageImg) {
        console.warn('⚠️ Éléments de zoom non trouvés');
        return;
    }
    
    // Boutons de zoom
    zoomInBtn.addEventListener('click', () => zoomIn());
    zoomOutBtn.addEventListener('click', () => zoomOut());
    zoomResetBtn.addEventListener('click', () => resetZoom());
    
    // Zoom avec la molette (seulement sur desktop)
    if (window.innerWidth > 768) {
        imageContainer.addEventListener('wheel', handleWheelZoom, { passive: false });
    }
    
    // Système de drag pour parcourir l'image zoomée
    imageContainer.addEventListener('mousedown', startDrag);
    imageContainer.addEventListener('mousemove', drag);
    imageContainer.addEventListener('mouseup', endDrag);
    imageContainer.addEventListener('mouseleave', endDrag);
    
    // Support tactile pour mobile avec gestion responsive
    imageContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    imageContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    imageContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Ajuster les contrôles selon l'écran
    adjustZoomControlsForDevice();
    
    console.log('✅ Contrôles de zoom initialisés (responsive)');
}

// Ajuster les contrôles de zoom selon l'appareil
function adjustZoomControlsForDevice() {
    const zoomControls = document.querySelector('.zoom-controls');
    if (!zoomControls) return;
    
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 992;
    
    if (isMobile) {
        // Mobile : contrôles horizontaux, plus petits
        zoomControls.style.flexDirection = 'row';
        zoomControls.style.top = '10px';
        zoomControls.style.right = '10px';
        zoomControls.style.padding = '4px';
        
        const zoomBtns = zoomControls.querySelectorAll('.zoom-btn');
        zoomBtns.forEach(btn => {
            btn.style.width = '32px';
            btn.style.height = '32px';
            btn.style.fontSize = '0.9rem';
        });
    } else if (isTablet) {
        // Tablette : taille intermédiaire
        zoomControls.style.flexDirection = 'column';
        zoomControls.style.top = '15px';
        zoomControls.style.right = '15px';
        zoomControls.style.padding = '6px';
        
        const zoomBtns = zoomControls.querySelectorAll('.zoom-btn');
        zoomBtns.forEach(btn => {
            btn.style.width = '38px';
            btn.style.height = '38px';
            btn.style.fontSize = '1.1rem';
        });
    } else {
        // Desktop : taille normale
        zoomControls.style.flexDirection = 'column';
        zoomControls.style.top = '20px';
        zoomControls.style.right = '20px';
        zoomControls.style.padding = '8px';
        
        const zoomBtns = zoomControls.querySelectorAll('.zoom-btn');
        zoomBtns.forEach(btn => {
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.fontSize = '1.2rem';
        });
    }
}

// Zoomer
function zoomIn() {
    currentZoom = Math.min(currentZoom * 1.25, 10); // Max 10x (augmenté de 5x à 10x)
    applyZoom();
}

// Dézoomer  
function zoomOut() {
    currentZoom = Math.max(currentZoom / 1.25, 0.25); // Min 0.25x (réduit pour plus de possibilités)
    applyZoom();
}

// Réinitialiser le zoom
function resetZoom() {
    currentZoom = 1;
    imageOffsetX = 0;
    imageOffsetY = 0;
    applyZoom();
    
    const imageContainer = document.getElementById('image-container');
    const pageImg = document.getElementById('current-page');
    if (imageContainer && pageImg) {
        imageContainer.classList.remove('zoomed');
        pageImg.classList.remove('zoomed');
    }
}

// Appliquer le zoom
function applyZoom() {
    const pageImg = document.getElementById('current-page');
    const imageContainer = document.getElementById('image-container');
    const zoomLevel = document.getElementById('zoom-level');
    
    if (!pageImg || !imageContainer || !zoomLevel) return;
    
    // Mettre à jour l'affichage du niveau de zoom
    zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
    
    // Centrer l'image et appliquer la transformation
    pageImg.style.transform = `scale(${currentZoom}) translate(${imageOffsetX}px, ${imageOffsetY}px)`;
    pageImg.style.transformOrigin = 'center center';
    
    // Assurer le centrage du container
    imageContainer.style.display = 'flex';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.justifyContent = 'center';
    
    // Gérer les classes CSS
    if (currentZoom > 1) {
        imageContainer.classList.add('zoomed');
        pageImg.classList.add('zoomed');
    } else {
        imageContainer.classList.remove('zoomed');
        pageImg.classList.remove('zoomed');
        // Reset position quand zoom = 1
        imageOffsetX = 0;
        imageOffsetY = 0;
        pageImg.style.transform = `scale(${currentZoom})`;
    }
    
    console.log('🔍 Zoom appliqué:', Math.round(currentZoom * 100) + '%', 'Offset:', imageOffsetX, imageOffsetY);
}

// Zoom avec la molette de souris
function handleWheelZoom(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    currentZoom = Math.max(0.25, Math.min(10, currentZoom * delta)); // Min 0.25x, Max 10x
    
    applyZoom();
}

// Début du drag
function startDrag(e) {
    if (currentZoom <= 1) return;
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    imageStartX = imageOffsetX;
    imageStartY = imageOffsetY;
    
    const imageContainer = document.getElementById('image-container');
    if (imageContainer) {
        imageContainer.classList.add('dragging');
    }
    
    e.preventDefault();
}

// Pendant le drag
function drag(e) {
    if (!isDragging || currentZoom <= 1) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    // Calculer les nouveaux offsets
    const newOffsetX = imageStartX + deltaX / currentZoom;
    const newOffsetY = imageStartY + deltaY / currentZoom;
    
    // Limiter le déplacement pour éviter de sortir complètement de l'écran
    const maxOffset = 100; // pixels
    imageOffsetX = Math.max(-maxOffset, Math.min(maxOffset, newOffsetX));
    imageOffsetY = Math.max(-maxOffset, Math.min(maxOffset, newOffsetY));
    
    applyZoom();
    e.preventDefault();
}

// Fin du drag
function endDrag() {
    isDragging = false;
    
    const imageContainer = document.getElementById('image-container');
    if (imageContainer) {
        imageContainer.classList.remove('dragging');
    }
}

// Support tactile - début
function handleTouchStart(e) {
    if (e.touches.length === 1 && currentZoom > 1) {
        // Simple touch pour drag
        const touch = e.touches[0];
        isDragging = true;
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        imageStartX = imageOffsetX;
        imageStartY = imageOffsetY;
        
        const imageContainer = document.getElementById('image-container');
        if (imageContainer) {
            imageContainer.classList.add('dragging');
        }
    } else if (e.touches.length === 2) {
        // Pinch to zoom (futur développement)
        e.preventDefault();
    }
}

// Support tactile - mouvement
function handleTouchMove(e) {
    if (e.touches.length === 1 && isDragging && currentZoom > 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartX;
        const deltaY = touch.clientY - dragStartY;
        
        // Calculer les nouveaux offsets avec limitation
        const newOffsetX = imageStartX + deltaX / currentZoom;
        const newOffsetY = imageStartY + deltaY / currentZoom;
        
        const maxOffset = 100; // pixels
        imageOffsetX = Math.max(-maxOffset, Math.min(maxOffset, newOffsetX));
        imageOffsetY = Math.max(-maxOffset, Math.min(maxOffset, newOffsetY));
        
        applyZoom();
        e.preventDefault();
    }
}

// Support tactile - fin
function handleTouchEnd(e) {
    if (e.touches.length === 0) {
        endDrag();
    }
}

// Navigation des pages
function previousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        updatePageDisplay();
        console.log('⬅️ Page précédente:', currentPageIndex + 1);
    }
}

function nextPage() {
    if (currentPageIndex < currentPages.length - 1) {
        currentPageIndex++;
        updatePageDisplay();
        console.log('➡️ Page suivante:', currentPageIndex + 1);
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex === currentPages.length - 1;
}

// ===== NAVIGATION PAR CHAPITRES =====
function buildChapterNavigation() {
    const chapters = groupPagesByChapter(currentPages);
    const container = document.getElementById('chapters-navigation');
    const select = document.getElementById('chapter-select');
    
    let navHtml = '';
    let selectHtml = '';
    
    Object.keys(chapters).forEach((chapterName, index) => {
        const pages = chapters[chapterName];
        const firstPageIndex = currentPages.findIndex(p => p.chapter === chapterName);
        const isActive = currentPages[currentPageIndex]?.chapter === chapterName;
        
        navHtml += `
            <div class=\"chapter-nav-item ${isActive ? 'active' : ''}\" onclick=\"jumpToChapter('${chapterName}')\">
                <div style=\"font-weight: 600; margin-bottom: 4px;\">${chapterName}</div>
                <div style=\"font-size: 0.9rem; color: #aaa;\">${pages.length} pages</div>
            </div>
        `;
        
        selectHtml += `<option value=\"${chapterName}\" ${isActive ? 'selected' : ''}>${chapterName}</option>`;
    });
    
    container.innerHTML = navHtml;
    select.innerHTML = selectHtml;
}

function jumpToChapter(chapterName) {
    const chapterIndex = currentPages.findIndex(page => page.chapter === chapterName);
    if (chapterIndex >= 0) {
        currentPageIndex = chapterIndex;
        updatePageDisplay();
        buildChapterNavigation();
        
        // Fermer la sidebar sur mobile
        if (window.innerWidth <= 768) {
            toggleChapterSidebar();
        }
        
        console.log('📚 Saut au chapitre:', chapterName);
    }
}

// ===== UTILITAIRES =====
function groupPagesByChapter(pages) {
    const chapters = {};
    pages.forEach(page => {
        const chapter = page.chapter || 'Chapitre inconnu';
        if (!chapters[chapter]) {
            chapters[chapter] = [];
        }
        chapters[chapter].push(page);
    });
    return chapters;
}

function getReadingProgress(mangaId) {
    const history = readingHistory[mangaId];
    if (!history) return 0;
    
    const manga = mangasLibrary[mangaId];
    if (!manga || manga.scans.length === 0) return 0;
    
    return Math.round((history.pageIndex / manga.scans.length) * 100);
}

function saveReadingProgress() {
    if (!currentManga || currentPageIndex < 0) return;
    
    readingHistory[currentManga] = {
        pageIndex: currentPageIndex,
        timestamp: Date.now(),
        mangaName: mangasLibrary[currentManga].info.name
    };
    
    localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
}

// ===== GESTION DES FAVORIS =====
function toggleBookmark(mangaId) {
    const index = bookmarks.indexOf(mangaId);
    if (index >= 0) {
        bookmarks.splice(index, 1);
    } else {
        bookmarks.push(mangaId);
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    displayMangaLibrary();
    updateLibraryStats();
    
    console.log('⭐ Favori mis à jour:', mangaId);
}

function updateFavoritesList() {
    const container = document.getElementById('favorites-list');
    
    if (bookmarks.length === 0) {
        container.innerHTML = '<p>Aucun favori pour le moment</p>';
        return;
    }
    
    let html = '<div class=\"manga-library\">';
    
    bookmarks.forEach(mangaId => {
        if (mangasLibrary[mangaId]) {
            const mangaData = mangasLibrary[mangaId];
            const readProgress = getReadingProgress(mangaId);
            
            html += `
                <div class=\"manga-book\" onclick=\"openMangaReader('${mangaId}')\">
                    <div class=\"manga-cover\">
                        <img src=\"${mangaData.scans[0]?.image || ''}\" alt=\"${mangaData.info.name}\">
                        <span class=\"manga-badge\">⭐</span>
                    </div>
                    <div class=\"manga-info\">
                        <h3 class=\"manga-title\">${mangaData.info.name}</h3>
                        <div class=\"manga-progress\">
                            <div class=\"progress-bar-fill\" style=\"width: ${readProgress}%\"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ===== PARAMÈTRES =====
function toggleDarkMode() {
    const isDark = document.getElementById('dark-mode').checked;
    settings.darkMode = isDark;
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('readerSettings', JSON.stringify(settings));
}

function updateReadingSpeed() {
    const speed = document.getElementById('reading-speed').value;
    settings.readingSpeed = parseInt(speed);
    document.getElementById('speed-value').textContent = speed + 's';
    
    localStorage.setItem('readerSettings', JSON.stringify(settings));
}

// ===== CONTRÔLES DU LECTEUR =====
function toggleChapterSidebar() {
    document.getElementById('chapter-sidebar').classList.toggle('open');
}

function toggleSettings() {
    const settings = document.getElementById('reader-settings');
    settings.classList.toggle('hidden');
    settings.classList.toggle('active');
}

function toggleReaderFullscreen() {
    if (!document.fullscreenElement) {
        document.getElementById('book-reader').requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen();
    }
}

function changeFitMode(mode) {
    settings.fitMode = mode;
    applyDisplaySettings();
    localStorage.setItem('readerSettings', JSON.stringify(settings));
}

function changeZoom(value) {
    settings.zoom = parseFloat(value);
    document.getElementById('zoom-value').textContent = Math.round(value * 100) + '%';
    applyDisplaySettings();
    localStorage.setItem('readerSettings', JSON.stringify(settings));
}

function changeBrightness(value) {
    settings.brightness = parseFloat(value);
    applyDisplaySettings();
    localStorage.setItem('readerSettings', JSON.stringify(settings));
}

function applyDisplaySettings() {
    const pageImg = document.getElementById('current-page');
    if (!pageImg) return;
    
    pageImg.style.objectFit = settings.fitMode;
    pageImg.style.transform = `scale(${settings.zoom})`;
    pageImg.style.filter = `brightness(${settings.brightness})`;
}

// ===== NAVIGATION CLAVIER =====
function handleKeyboardNavigation(e) {
    const reader = document.getElementById('book-reader');
    if (reader.classList.contains('hidden')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            previousPage();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            nextPage();
            break;
        case 'Escape':
            e.preventDefault();
            closeReader();
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleReaderFullscreen();
            break;
        case 'c':
        case 'C':
            e.preventDefault();
            toggleChapterSidebar();
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomIn();
            break;
        case '-':
        case '_':
            e.preventDefault();
            zoomOut();
            break;
        case '0':
            e.preventDefault();
            resetZoom();
            break;
    }
}

// ===== FONCTIONS UTILITAIRES =====
function adjustReaderLayout() {
    // Utiliser le gestionnaire responsive si disponible
    if (window.responsiveManager) {
        window.responsiveManager.adjustReaderLayout();
        return;
    }
    
    // Fallback si le gestionnaire n'est pas disponible
    const reader = document.getElementById('book-reader');
    if (!reader || reader.classList.contains('hidden')) return;
    
    const isMobile = window.innerWidth <= 768;
    const pageContainer = document.querySelector('.page-container');
    const pageImg = document.getElementById('current-page');
    
    if (!pageContainer || !pageImg) return;
    
    if (isMobile) {
        // Fermer la sidebar sur mobile si ouverte
        const sidebar = document.getElementById('chapter-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
        
        // Ajuster les dimensions de l'image
        const vh = window.innerHeight;
        const headerHeight = document.querySelector('.reader-header')?.offsetHeight || 80;
        const navHeight = document.querySelector('.page-navigation')?.offsetHeight || 80;
        const availableHeight = vh - headerHeight - navHeight - 40;
        
        pageImg.style.maxHeight = `${availableHeight}px`;
        pageImg.style.maxWidth = 'calc(100vw - 2rem)';
    } else {
        // Desktop/tablet - réinitialiser les styles
        pageImg.style.maxHeight = '';
        pageImg.style.maxWidth = '';
    }
}

function showLibraryError(message) {
    document.getElementById('manga-library').innerHTML = `
        <div class=\"loading-state\">
            <p style=\"color: #ef4444;\">❌ Erreur: ${message}</p>
            <button class=\"btn btn-primary\" onclick=\"loadMangaLibrary()\">🔄 Réessayer</button>
        </div>
    `;
}

function loadReadingHistory() {
    // Charger l'historique de lecture (déjà fait dans l'initialisation)
    updateCurrentReading();
}

function updateCurrentReading() {
    const container = document.getElementById('current-reading');
    const recentReads = Object.entries(readingHistory)
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, 5);
    
    if (recentReads.length === 0) {
        container.innerHTML = '<p>Aucune lecture en cours</p>';
        return;
    }
    
    let html = '<div class=\"manga-library\">';
    
    recentReads.forEach(([mangaId, history]) => {
        if (mangasLibrary[mangaId]) {
            const manga = mangasLibrary[mangaId];
            const progress = getReadingProgress(mangaId);
            
            html += `
                <div class=\"manga-book\" onclick=\"openMangaReader('${mangaId}')\">
                    <div class=\"manga-cover\">
                        <img src=\"${manga.scans[0]?.image || ''}\" alt=\"${manga.info.name}\">
                    </div>
                    <div class=\"manga-info\">
                        <h3 class=\"manga-title\">${manga.info.name}</h3>
                        <div class=\"manga-progress\">
                            <div class=\"progress-bar-fill\" style=\"width: ${progress}%\"></div>
                        </div>
                        <p style=\"font-size: 0.9rem; color: #666; margin: 0.5rem 0;\">
                            Page ${history.pageIndex + 1}/${manga.scans.length}
                        </p>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function loadBookmarks() {
    // Déjà chargé dans l'initialisation
    updateFavoritesList();
}

function clearReadingHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique de lecture ?')) {
        readingHistory = {};
        localStorage.removeItem('readingHistory');
        updateCurrentReading();
        displayMangaLibrary();
        console.log('🗑️ Historique effacé');
    }
}

function exportBookmarks() {
    const bookmarkData = {
        bookmarks: bookmarks,
        mangaNames: bookmarks.map(id => mangasLibrary[id]?.info.name).filter(Boolean),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(bookmarkData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anime-scans-bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('💾 Favoris exportés');
}

// ===== NOUVELLES FONCTIONS POUR PARAMÈTRES AVANCÉS =====

// Mettre à jour l'affichage de la vitesse de lecture
function updateSpeedDisplay() {
    const speedSlider = document.getElementById('reading-speed');
    const speedValue = document.getElementById('speed-value');
    if (speedSlider && speedValue) {
        speedValue.textContent = speedSlider.value + 's';
    }
}

// Gérer les changements de direction de lecture
function updateReadingDirection() {
    const direction = document.getElementById('reading-direction').value;
    settings.readingDirection = direction;
    document.body.setAttribute('data-reading-direction', direction);
    saveSettings();
}

// Gérer le mode d'ajustement par défaut
function updateDefaultFitMode() {
    const fitMode = document.getElementById('default-fit-mode').value;
    settings.defaultFitMode = fitMode;
    saveSettings();
}

// Gérer la qualité des images
function updateImageQuality() {
    const quality = document.getElementById('image-quality').value;
    settings.imageQuality = quality;
    saveSettings();
    
    // Appliquer immédiatement si en lecture
    if (currentManga) {
        applyImageQuality();
    }
}

// Appliquer la qualité d'image
function applyImageQuality() {
    const images = document.querySelectorAll('.reader-page img');
    images.forEach(img => {
        switch(settings.imageQuality) {
            case 'high':
                img.style.imageRendering = 'high-quality';
                break;
            case 'low':
                img.style.imageRendering = 'pixelated';
                break;
            default:
                img.style.imageRendering = 'auto';
        }
    });
}

// Gérer la taille du cache
function updateCacheSize() {
    const size = document.getElementById('cache-size').value;
    settings.cacheSize = size;
    saveSettings();
}

// Exporter toutes les données
function exportAllData() {
    const allData = {
        settings: settings,
        readingHistory: readingHistory,
        bookmarks: bookmarks,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `anime-scans-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('📤 Données exportées avec succès', 'success');
}

// Importer des données
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.settings) {
                    settings = { ...defaultSettings, ...data.settings };
                    localStorage.setItem('readerSettings', JSON.stringify(settings));
                }
                
                if (data.readingHistory) {
                    readingHistory = data.readingHistory;
                    localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
                }
                
                if (data.bookmarks) {
                    bookmarks = data.bookmarks;
                    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                }
                
                // Recharger l'interface
                location.reload();
                
            } catch (error) {
                showNotification('❌ Erreur lors de l\'importation', 'error');
                console.error('Erreur importation:', error);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Effacer toutes les données
function clearAllData() {
    if (confirm('⚠️ Êtes-vous sûr de vouloir effacer toutes vos données ? Cette action est irréversible.')) {
        localStorage.removeItem('readerSettings');
        localStorage.removeItem('readingHistory');
        localStorage.removeItem('bookmarks');
        
        // Réinitialiser les variables
        settings = { ...defaultSettings };
        readingHistory = {};
        bookmarks = [];
        
        showNotification('🗑️ Toutes les données ont été effacées', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

// Vider le cache
function clearCache() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    showNotification('🗂️ Cache vidé avec succès', 'success');
}

// Afficher les informations du cache
function showCacheInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
            const used = (estimate.usage / 1024 / 1024).toFixed(2);
            const quota = (estimate.quota / 1024 / 1024 / 1024).toFixed(2);
            
            alert(`📊 Informations de stockage:\n\nUtilisé: ${used} MB\nDisponible: ${quota} GB\n\nHistorique: ${Object.keys(readingHistory).length} entrées\nFavoris: ${bookmarks.length} mangas`);
        });
    } else {
        alert(`📊 Informations de stockage:\n\nHistorique: ${Object.keys(readingHistory).length} entrées\nFavoris: ${bookmarks.length} mangas`);
    }
}

// Afficher l'aide
function showHelp() {
    const helpText = `
🎌 Guide d'utilisation du lecteur de manga

📖 NAVIGATION:
• Flèches ←/→ ou clic sur l'image pour changer de page
• Espace ou Entrée pour page suivante
• F ou F11 pour le mode plein écran
• Escape pour fermer le lecteur

⚙️ PARAMÈTRES:
• Mode sombre pour une lecture nocturne
• Navigation automatique avec vitesse réglable
• Ajustement d'image personnalisable
• Sauvegarde automatique de la progression

📚 BIBLIOTHÈQUE:
• Favoris avec système d'étoiles
• Historique de lecture automatique
• Export/import des données personnelles

⌨️ RACCOURCIS:
• C: Menu des chapitres
• S: Paramètres
• Q: Quitter le lecteur
• +/-: Zoom avant/arrière
`;
    
    alert(helpText);
}

// Afficher à propos
function showAbout() {
    const aboutText = `
🎌 Lecteur de Manga en Ligne
Version 2.0.0

Développé avec ❤️ pour les fans d'anime et manga

🛠️ TECHNOLOGIES:
• Node.js + Express
• Vanilla JavaScript
• CSS Grid & Flexbox
• Web Storage API

📋 FONCTIONNALITÉS:
• Interface moderne et responsive
• Lecture type livre avec navigation fluide
• Système de favoris et historique
• Mode sombre et paramètres personnalisés
• Export/import des données

© 2024 - Fait pour la communauté anime
`;
    
    alert(aboutText);
}

// Vérifier les mises à jour
function checkUpdates() {
    // Simulation d'une vérification de mise à jour
    showNotification('🔄 Vérification en cours...', 'info');
    
    setTimeout(() => {
        showNotification('✅ Vous utilisez la dernière version !', 'success');
    }, 2000);
}

// Mettre à jour les statistiques dans les paramètres
function updateSettingsStats() {
    const totalMangasEl = document.getElementById('total-mangas');
    const totalHistoryEl = document.getElementById('total-history');
    const totalFavoritesEl = document.getElementById('total-favorites');
    
    if (totalMangasEl) totalMangasEl.textContent = Object.keys(mangasLibrary).length;
    if (totalHistoryEl) totalHistoryEl.textContent = Object.keys(readingHistory).length;
    if (totalFavoritesEl) totalFavoritesEl.textContent = bookmarks.length;
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialiser les nouveaux paramètres
function initializeAdvancedSettings() {
    // Mettre à jour l'affichage de la vitesse
    updateSpeedDisplay();
    
    // Écouter les changements de vitesse
    const speedSlider = document.getElementById('reading-speed');
    if (speedSlider) {
        speedSlider.addEventListener('input', updateSpeedDisplay);
    }
    
    // Autres paramètres
    const directionSelect = document.getElementById('reading-direction');
    if (directionSelect) {
        directionSelect.value = settings.readingDirection || 'ltr';
        directionSelect.addEventListener('change', updateReadingDirection);
    }
    
    const fitModeSelect = document.getElementById('default-fit-mode');
    if (fitModeSelect) {
        fitModeSelect.value = settings.defaultFitMode || 'contain';
        fitModeSelect.addEventListener('change', updateDefaultFitMode);
    }
    
    const qualitySelect = document.getElementById('image-quality');
    if (qualitySelect) {
        qualitySelect.value = settings.imageQuality || 'medium';
        qualitySelect.addEventListener('change', updateImageQuality);
    }
    
    const cacheSizeSelect = document.getElementById('cache-size');
    if (cacheSizeSelect) {
        cacheSizeSelect.value = settings.cacheSize || '100';
        cacheSizeSelect.addEventListener('change', updateCacheSize);
    }
    
    // Mettre à jour les statistiques
    updateSettingsStats();
}

// Exposer les fonctions globalement
window.openMangaReader = openMangaReader;
window.closeReader = closeReader;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.jumpToChapter = jumpToChapter;
window.toggleChapterSidebar = toggleChapterSidebar;
window.toggleSettings = toggleSettings;
window.toggleReaderFullscreen = toggleReaderFullscreen;
window.toggleBookmark = toggleBookmark;
window.changeFitMode = changeFitMode;
window.changeZoom = changeZoom;
window.changeBrightness = changeBrightness;
window.clearReadingHistory = clearReadingHistory;
window.exportBookmarks = exportBookmarks;

// Nouvelles fonctions exposées
window.exportAllData = exportAllData;
window.importData = importData;
window.clearAllData = clearAllData;
window.clearCache = clearCache;
window.showCacheInfo = showCacheInfo;
window.showHelp = showHelp;
window.showAbout = showAbout;
window.checkUpdates = checkUpdates;
window.initializeAdvancedSettings = initializeAdvancedSettings;
