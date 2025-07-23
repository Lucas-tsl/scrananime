/**
 * 🎨 Theme Manager - Système de personnalisation des thèmes
 */

class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                name: 'Sombre',
                icon: '🌙',
                colors: {
                    '--bg-primary': '#0d1117',
                    '--bg-secondary': '#161b22',
                    '--bg-tertiary': '#21262d',
                    '--text-primary': '#e6edf3',
                    '--text-secondary': '#c9d1d9',
                    '--text-muted': '#7d8590',
                    '--primary-color': '#4f46e5',
                    '--secondary-color': '#7c3aed',
                    '--accent-color': '#0891b2',
                    '--success-color': '#238636',
                    '--warning-color': '#d97706',
                    '--error-color': '#da3633',
                    '--border-color': 'rgba(230, 237, 243, 0.15)',
                    '--shadow-color': 'rgba(0, 0, 0, 0.7)'
                }
            },
            light: {
                name: 'Clair',
                icon: '☀️',
                colors: {
                    '--bg-primary': '#fefefe',
                    '--bg-secondary': '#f8fafc',
                    '--bg-tertiary': '#e2e8f0',
                    '--text-primary': '#1a202c',
                    '--text-secondary': '#2d3748',
                    '--text-muted': '#64748b',
                    '--primary-color': '#4338ca',
                    '--secondary-color': '#7c2d12',
                    '--accent-color': '#0369a1',
                    '--success-color': '#166534',
                    '--warning-color': '#a16207',
                    '--error-color': '#dc2626',
                    '--border-color': 'rgba(26, 32, 44, 0.15)',
                    '--shadow-color': 'rgba(0, 0, 0, 0.15)'
                }
            },
            blue: {
                name: 'Océan',
                icon: '🌊',
                colors: {
                    '--bg-primary': '#0c1821',
                    '--bg-secondary': '#1e2a3a',
                    '--bg-tertiary': '#2d3e50',
                    '--text-primary': '#e8f4f8',
                    '--text-secondary': '#bdc3c7',
                    '--text-muted': '#95a5a6',
                    '--primary-color': '#3498db',
                    '--secondary-color': '#2980b9',
                    '--accent-color': '#1abc9c',
                    '--success-color': '#27ae60',
                    '--warning-color': '#f39c12',
                    '--error-color': '#e74c3c',
                    '--border-color': 'rgba(232, 244, 248, 0.2)',
                    '--shadow-color': 'rgba(52, 152, 219, 0.3)'
                }
            },
            purple: {
                name: 'Mystique',
                icon: '🔮',
                colors: {
                    '--bg-primary': '#1a0933',
                    '--bg-secondary': '#2d1b45',
                    '--bg-tertiary': '#44337a',
                    '--text-primary': '#ede7f6',
                    '--text-secondary': '#e1bee7',
                    '--text-muted': '#c4b5fd',
                    '--primary-color': '#8b5cf6',
                    '--secondary-color': '#a855f7',
                    '--accent-color': '#d946ef',
                    '--success-color': '#22c55e',
                    '--warning-color': '#eab308',
                    '--error-color': '#f87171',
                    '--border-color': 'rgba(237, 231, 246, 0.2)',
                    '--shadow-color': 'rgba(139, 92, 246, 0.4)'
                }
            },
            green: {
                name: 'Nature',
                icon: '🌿',
                colors: {
                    '--bg-primary': '#0a1f0a',
                    '--bg-secondary': '#1a2e1a',
                    '--bg-tertiary': '#2a4a2a',
                    '--text-primary': '#e8f5e8',
                    '--text-secondary': '#c8e6c9',
                    '--text-muted': '#bbf7d0',
                    '--primary-color': '#16a34a',
                    '--secondary-color': '#15803d',
                    '--accent-color': '#10b981',
                    '--success-color': '#22c55e',
                    '--warning-color': '#eab308',
                    '--error-color': '#ef4444',
                    '--border-color': 'rgba(232, 245, 232, 0.2)',
                    '--shadow-color': 'rgba(22, 163, 74, 0.3)'
                }
            },
            manga: {
                name: 'Manga Classic',
                icon: '📚',
                colors: {
                    '--bg-primary': '#faf7f0',
                    '--bg-secondary': '#f5f2e8',
                    '--bg-tertiary': '#ede7d3',
                    '--text-primary': '#2c1810',
                    '--text-secondary': '#4a3728',
                    '--text-muted': '#8b7355',
                    '--primary-color': '#92400e',
                    '--secondary-color': '#78350f',
                    '--accent-color': '#b45309',
                    '--success-color': '#166534',
                    '--warning-color': '#a16207',
                    '--error-color': '#dc2626',
                    '--border-color': 'rgba(44, 24, 16, 0.2)',
                    '--shadow-color': 'rgba(146, 64, 14, 0.25)'
                }
            }
        };
        
        this.customization = {
            fontSize: 16,
            fontFamily: 'system',
            borderRadius: 8,
            compactMode: false,
            animations: true,
            blurEffects: true,
            highContrast: false
        };
        
        this.currentTheme = 'dark';
        this.init();
    }
    
    init() {
        console.log('🎨 Theme Manager: Initialisation');
        this.loadSettings();
        this.createThemeUI();
        this.applyTheme();
        this.setupAutoTheme();
    }
    
    loadSettings() {
        const savedTheme = localStorage.getItem('selectedTheme');
        const savedCustomization = localStorage.getItem('themeCustomization');
        
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
        
        if (savedCustomization) {
            this.customization = { ...this.customization, ...JSON.parse(savedCustomization) };
        }
    }
    
    createThemeUI() {
        const themeHTML = `
            <div class="theme-customizer" id="theme-customizer">
                <button class="theme-toggle-btn" id="theme-toggle-btn" title="Personnalisation">
                    🎨 Thèmes
                </button>
                
                <div class="theme-panel" id="theme-panel">
                    <div class="theme-panel-header">
                        <h3>🎨 Personnalisation</h3>
                        <button class="theme-close-btn" id="theme-close-btn">✕</button>
                    </div>
                    
                    <div class="theme-panel-content">
                        <!-- Sélection de thème -->
                        <div class="theme-section">
                            <h4>Thèmes prédéfinis</h4>
                            <div class="theme-grid" id="theme-grid"></div>
                        </div>
                        
                        <!-- Personnalisation -->
                        <div class="theme-section">
                            <h4>Personnalisation</h4>
                            
                            <div class="customization-group">
                                <label>Taille de police:</label>
                                <div class="font-size-controls">
                                    <button class="font-btn" data-action="decrease">A-</button>
                                    <span id="font-size-display">${this.customization.fontSize}px</span>
                                    <button class="font-btn" data-action="increase">A+</button>
                                </div>
                            </div>
                            
                            <div class="customization-group">
                                <label>Police:</label>
                                <select id="font-family-select">
                                    <option value="system">Système</option>
                                    <option value="serif">Serif</option>
                                    <option value="sans-serif">Sans-serif</option>
                                    <option value="monospace">Monospace</option>
                                    <option value="manga">Manga Style</option>
                                </select>
                            </div>
                            
                            <div class="customization-group">
                                <label>Bordures arrondies:</label>
                                <input type="range" id="border-radius-slider" min="0" max="20" value="${this.customization.borderRadius}">
                                <span id="border-radius-display">${this.customization.borderRadius}px</span>
                            </div>
                        </div>
                        
                        <!-- Options avancées -->
                        <div class="theme-section">
                            <h4>Options avancées</h4>
                            
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="compact-mode" ${this.customization.compactMode ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    Mode compact
                                </label>
                            </div>
                            
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="animations" ${this.customization.animations ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    Animations
                                </label>
                            </div>
                            
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="blur-effects" ${this.customization.blurEffects ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    Effets de flou
                                </label>
                            </div>
                            
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="high-contrast" ${this.customization.highContrast ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                    Contraste élevé
                                </label>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="theme-section">
                            <div class="theme-actions">
                                <button class="btn btn-primary" id="save-theme">💾 Sauvegarder</button>
                                <button class="btn btn-secondary" id="reset-theme">🔄 Réinitialiser</button>
                                <button class="btn btn-secondary" id="export-theme">📤 Exporter</button>
                                <button class="btn btn-secondary" id="import-theme">📥 Importer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter au DOM
        const themeContainer = document.createElement('div');
        themeContainer.innerHTML = themeHTML;
        document.body.appendChild(themeContainer.firstElementChild);
        
        this.setupThemeEvents();
        this.populateThemeGrid();
    }
    
    setupThemeEvents() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        const closeBtn = document.getElementById('theme-close-btn');
        const panel = document.getElementById('theme-panel');
        
        // Toggle panel
        toggleBtn?.addEventListener('click', () => {
            panel.classList.toggle('open');
        });
        
        // Close panel
        closeBtn?.addEventListener('click', () => {
            panel.classList.remove('open');
        });
        
        // Fermer en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-customizer')) {
                panel.classList.remove('open');
            }
        });
        
        // Contrôles de police
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'increase') {
                    this.customization.fontSize = Math.min(24, this.customization.fontSize + 1);
                } else {
                    this.customization.fontSize = Math.max(12, this.customization.fontSize - 1);
                }
                this.updateFontSize();
            });
        });
        
        // Sélecteur de police
        const fontSelect = document.getElementById('font-family-select');
        fontSelect?.addEventListener('change', (e) => {
            this.customization.fontFamily = e.target.value;
            this.applyFontFamily();
        });
        
        // Slider bordures
        const borderSlider = document.getElementById('border-radius-slider');
        borderSlider?.addEventListener('input', (e) => {
            this.customization.borderRadius = parseInt(e.target.value);
            this.updateBorderRadius();
        });
        
        // Toggles
        this.setupToggleEvents();
        
        // Boutons d'action
        this.setupActionEvents();
    }
    
    setupToggleEvents() {
        const toggles = [
            { id: 'compact-mode', property: 'compactMode', action: 'applyCompactMode' },
            { id: 'animations', property: 'animations', action: 'applyAnimations' },
            { id: 'blur-effects', property: 'blurEffects', action: 'applyBlurEffects' },
            { id: 'high-contrast', property: 'highContrast', action: 'applyHighContrast' }
        ];
        
        toggles.forEach(({ id, property, action }) => {
            const toggle = document.getElementById(id);
            toggle?.addEventListener('change', (e) => {
                this.customization[property] = e.target.checked;
                if (this[action]) {
                    this[action]();
                }
            });
        });
    }
    
    setupActionEvents() {
        document.getElementById('save-theme')?.addEventListener('click', () => {
            this.saveSettings();
            this.showNotification('💾 Thème sauvegardé !', 'success');
        });
        
        document.getElementById('reset-theme')?.addEventListener('click', () => {
            this.resetToDefault();
        });
        
        document.getElementById('export-theme')?.addEventListener('click', () => {
            this.exportTheme();
        });
        
        document.getElementById('import-theme')?.addEventListener('click', () => {
            this.importTheme();
        });
    }
    
    populateThemeGrid() {
        const grid = document.getElementById('theme-grid');
        if (!grid) return;
        
        Object.entries(this.themes).forEach(([key, theme]) => {
            const themeCard = document.createElement('div');
            themeCard.className = `theme-card ${key === this.currentTheme ? 'active' : ''}`;
            themeCard.innerHTML = `
                <div class="theme-preview" style="background: ${theme.colors['--bg-primary']}; border: 2px solid ${theme.colors['--primary-color']};">
                    <div class="theme-preview-header" style="background: ${theme.colors['--bg-secondary']};">
                        <div class="theme-preview-dot" style="background: ${theme.colors['--primary-color']};"></div>
                        <div class="theme-preview-dot" style="background: ${theme.colors['--secondary-color']};"></div>
                        <div class="theme-preview-dot" style="background: ${theme.colors['--accent-color']};"></div>
                    </div>
                    <div class="theme-preview-content" style="color: ${theme.colors['--text-primary']};">
                        <div class="theme-preview-text" style="background: ${theme.colors['--bg-tertiary']};"></div>
                        <div class="theme-preview-text" style="background: ${theme.colors['--bg-tertiary']};"></div>
                    </div>
                </div>
                <div class="theme-info">
                    <span class="theme-icon">${theme.icon}</span>
                    <span class="theme-name">${theme.name}</span>
                </div>
            `;
            
            themeCard.addEventListener('click', () => {
                this.selectTheme(key);
            });
            
            grid.appendChild(themeCard);
        });
    }
    
    selectTheme(themeKey) {
        if (!this.themes[themeKey]) return;
        
        this.currentTheme = themeKey;
        this.applyTheme();
        
        // Mettre à jour l'UI
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
        });
        
        document.querySelector(`[data-theme="${themeKey}"]`)?.classList.add('active');
        
        // Effet de transition
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
    
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        if (!theme) return;
        
        // Appliquer les couleurs CSS
        Object.entries(theme.colors).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // Appliquer les personnalisations
        this.applyCustomizations();
        
        // Mettre à jour le favicon selon le thème
        this.updateFavicon();
        
        console.log(`🎨 Thème appliqué: ${theme.name}`);
    }
    
    applyCustomizations() {
        this.updateFontSize();
        this.applyFontFamily();
        this.updateBorderRadius();
        this.applyCompactMode();
        this.applyAnimations();
        this.applyBlurEffects();
        this.applyHighContrast();
    }
    
    updateFontSize() {
        document.documentElement.style.setProperty('--base-font-size', `${this.customization.fontSize}px`);
        const display = document.getElementById('font-size-display');
        if (display) display.textContent = `${this.customization.fontSize}px`;
    }
    
    applyFontFamily() {
        const fonts = {
            system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            serif: 'Georgia, "Times New Roman", serif',
            'sans-serif': 'Arial, Helvetica, sans-serif',
            monospace: '"Fira Code", "Courier New", monospace',
            manga: '"Comic Sans MS", cursive, sans-serif'
        };
        
        const fontFamily = fonts[this.customization.fontFamily] || fonts.system;
        document.documentElement.style.setProperty('--font-family', fontFamily);
    }
    
    updateBorderRadius() {
        document.documentElement.style.setProperty('--border-radius', `${this.customization.borderRadius}px`);
        const display = document.getElementById('border-radius-display');
        if (display) display.textContent = `${this.customization.borderRadius}px`;
    }
    
    applyCompactMode() {
        document.body.classList.toggle('compact-mode', this.customization.compactMode);
        if (this.customization.compactMode) {
            document.documentElement.style.setProperty('--spacing-unit', '0.5rem');
        } else {
            document.documentElement.style.setProperty('--spacing-unit', '1rem');
        }
    }
    
    applyAnimations() {
        document.body.classList.toggle('no-animations', !this.customization.animations);
        if (this.customization.animations) {
            document.documentElement.style.setProperty('--animation-duration', '0.3s');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }
    }
    
    applyBlurEffects() {
        document.body.classList.toggle('no-blur', !this.customization.blurEffects);
        if (this.customization.blurEffects) {
            document.documentElement.style.setProperty('--backdrop-blur', 'blur(10px)');
        } else {
            document.documentElement.style.setProperty('--backdrop-blur', 'none');
        }
    }
    
    applyHighContrast() {
        document.body.classList.toggle('high-contrast', this.customization.highContrast);
        if (this.customization.highContrast) {
            document.documentElement.style.setProperty('--contrast-multiplier', '1.5');
        } else {
            document.documentElement.style.setProperty('--contrast-multiplier', '1');
        }
    }
    
    updateFavicon() {
        const theme = this.themes[this.currentTheme];
        const favicon = document.querySelector('link[rel="icon"]');
        
        if (favicon && theme) {
            // Créer un favicon avec la couleur du thème
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            // Dessiner le favicon
            ctx.fillStyle = theme.colors['--primary-color'];
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = theme.colors['--bg-primary'];
            ctx.fillRect(4, 4, 24, 24);
            ctx.fillStyle = theme.colors['--primary-color'];
            ctx.fillRect(8, 8, 16, 16);
            
            favicon.href = canvas.toDataURL();
        }
    }
    
    setupAutoTheme() {
        // Détecter la préférence système
        if (window.matchMedia) {
            const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
            
            darkMode.addEventListener('change', (e) => {
                if (!localStorage.getItem('selectedTheme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
            
            // Appliquer au chargement si aucun thème sauvé
            if (!localStorage.getItem('selectedTheme')) {
                this.currentTheme = darkMode.matches ? 'dark' : 'light';
            }
        }
    }
    
    saveSettings() {
        localStorage.setItem('selectedTheme', this.currentTheme);
        localStorage.setItem('themeCustomization', JSON.stringify(this.customization));
    }
    
    resetToDefault() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
            this.currentTheme = 'dark';
            this.customization = {
                fontSize: 16,
                fontFamily: 'system',
                borderRadius: 8,
                compactMode: false,
                animations: true,
                blurEffects: true,
                highContrast: false
            };
            
            this.applyTheme();
            this.updateUI();
            this.saveSettings();
            this.showNotification('🔄 Paramètres réinitialisés !', 'success');
        }
    }
    
    updateUI() {
        // Mettre à jour tous les contrôles de l'interface
        const fontSizeDisplay = document.getElementById('font-size-display');
        const fontFamilySelect = document.getElementById('font-family-select');
        const borderRadiusSlider = document.getElementById('border-radius-slider');
        const borderRadiusDisplay = document.getElementById('border-radius-display');
        
        if (fontSizeDisplay) fontSizeDisplay.textContent = `${this.customization.fontSize}px`;
        if (fontFamilySelect) fontFamilySelect.value = this.customization.fontFamily;
        if (borderRadiusSlider) borderRadiusSlider.value = this.customization.borderRadius;
        if (borderRadiusDisplay) borderRadiusDisplay.textContent = `${this.customization.borderRadius}px`;
        
        // Mettre à jour les toggles
        Object.entries(this.customization).forEach(([key, value]) => {
            const toggle = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (toggle && typeof value === 'boolean') {
                toggle.checked = value;
            }
        });
        
        // Mettre à jour la grille de thèmes
        document.querySelectorAll('.theme-card').forEach((card, index) => {
            const themeKey = Object.keys(this.themes)[index];
            card.classList.toggle('active', themeKey === this.currentTheme);
        });
    }
    
    exportTheme() {
        const exportData = {
            theme: this.currentTheme,
            customization: this.customization,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `manga-reader-theme-${this.currentTheme}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('📤 Thème exporté !', 'success');
    }
    
    importTheme() {
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
                    
                    if (data.theme && this.themes[data.theme]) {
                        this.currentTheme = data.theme;
                    }
                    
                    if (data.customization) {
                        this.customization = { ...this.customization, ...data.customization };
                    }
                    
                    this.applyTheme();
                    this.updateUI();
                    this.saveSettings();
                    this.showNotification('📥 Thème importé !', 'success');
                } catch (error) {
                    this.showNotification('❌ Erreur lors de l\'importation', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `theme-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // API publique
    getThemeInfo() {
        return {
            current: this.currentTheme,
            available: Object.keys(this.themes),
            customization: this.customization
        };
    }
    
    setTheme(themeKey) {
        if (this.themes[themeKey]) {
            this.selectTheme(themeKey);
            this.saveSettings();
        }
    }
    
    addCustomTheme(key, themeData) {
        this.themes[key] = themeData;
        this.populateThemeGrid();
    }
    
    removeCustomTheme(key) {
        if (key !== 'dark' && key !== 'light') { // Protéger les thèmes par défaut
            delete this.themes[key];
            this.populateThemeGrid();
        }
    }
}

// Initialiser le gestionnaire de thèmes
let themeManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
        window.themeManager = themeManager;
    });
} else {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
}
