/**
 * 🔍 Search Manager - Système de recherche avancée
 */

class SearchManager {
    constructor() {
        this.searchIndex = new Map();
        this.filters = {
            genre: [],
            status: 'all',
            rating: 0,
            year: null,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.maxHistorySize = 20;
        
        this.init();
    }
    
    init() {
        console.log('🔍 Search Manager: Initialisation');
        this.setupSearchUI();
        this.buildSearchIndex();
    }
    
    setupSearchUI() {
        // Créer l'interface de recherche
        const searchHTML = `
            <div class="search-container" id="search-container">
                <div class="search-header">
                    <div class="search-input-group">
                        <input type="text" id="search-input" placeholder="🔍 Rechercher des mangas..." autocomplete="off">
                        <button id="search-clear" class="search-clear-btn" title="Effacer">✕</button>
                    </div>
                    <button id="search-filters-toggle" class="search-filters-btn" title="Filtres avancés">
                        🎛️ Filtres
                    </button>
                </div>
                
                <div class="search-suggestions" id="search-suggestions"></div>
                
                <div class="search-filters" id="search-filters">
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label>Genre:</label>
                            <div class="genre-tags" id="genre-tags"></div>
                        </div>
                        
                        <div class="filter-group">
                            <label>Statut:</label>
                            <select id="status-filter">
                                <option value="all">Tous</option>
                                <option value="ongoing">En cours</option>
                                <option value="completed">Terminé</option>
                                <option value="hiatus">En pause</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>Note minimale:</label>
                            <div class="rating-filter">
                                <input type="range" id="rating-filter" min="0" max="5" step="0.5" value="0">
                                <span id="rating-value">0★</span>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <label>Trier par:</label>
                            <select id="sort-by">
                                <option value="name">Nom</option>
                                <option value="rating">Note</option>
                                <option value="year">Année</option>
                                <option value="popularity">Popularité</option>
                                <option value="updated">Dernière MAJ</option>
                            </select>
                            <button id="sort-order" class="sort-order-btn" data-order="asc" title="Ordre croissant">↑</button>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button id="apply-filters" class="btn btn-primary">Appliquer</button>
                        <button id="reset-filters" class="btn btn-secondary">Réinitialiser</button>
                    </div>
                </div>
                
                <div class="search-stats" id="search-stats"></div>
            </div>
        `;
        
        // Injecter dans l'onglet bibliothèque
        const libraryTab = document.getElementById('library-tab');
        if (libraryTab) {
            const searchContainer = document.createElement('div');
            searchContainer.innerHTML = searchHTML;
            libraryTab.insertBefore(searchContainer.firstElementChild, libraryTab.firstElementChild);
            
            this.setupSearchEvents();
        }
    }
    
    setupSearchEvents() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const filtersToggle = document.getElementById('search-filters-toggle');
        const applyFilters = document.getElementById('apply-filters');
        const resetFilters = document.getElementById('reset-filters');
        const sortOrder = document.getElementById('sort-order');
        
        // Recherche en temps réel
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            searchInput.addEventListener('focus', this.showSuggestions.bind(this));
            searchInput.addEventListener('blur', () => {
                setTimeout(() => this.hideSuggestions(), 200);
            });
        }
        
        // Bouton effacer
        if (searchClear) {
            searchClear.addEventListener('click', this.clearSearch.bind(this));
        }
        
        // Toggle filtres
        if (filtersToggle) {
            filtersToggle.addEventListener('click', this.toggleFilters.bind(this));
        }
        
        // Appliquer filtres
        if (applyFilters) {
            applyFilters.addEventListener('click', this.applyFilters.bind(this));
        }
        
        // Réinitialiser filtres
        if (resetFilters) {
            resetFilters.addEventListener('click', this.resetFilters.bind(this));
        }
        
        // Ordre de tri
        if (sortOrder) {
            sortOrder.addEventListener('click', this.toggleSortOrder.bind(this));
        }
        
        // Filtres individuels
        this.setupFilterEvents();
        
        console.log('✅ Événements de recherche configurés');
    }
    
    setupFilterEvents() {
        const ratingFilter = document.getElementById('rating-filter');
        const ratingValue = document.getElementById('rating-value');
        
        if (ratingFilter && ratingValue) {
            ratingFilter.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                ratingValue.textContent = value > 0 ? `${value}★` : '0★';
                this.filters.rating = value;
            });
        }
        
        // Genres (sera implémenté quand on aura des données de genre)
        this.setupGenreFilters();
    }
    
    setupGenreFilters() {
        const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'];
        const genreTags = document.getElementById('genre-tags');
        
        if (genreTags) {
            genres.forEach(genre => {
                const tag = document.createElement('div');
                tag.className = 'genre-tag';
                tag.textContent = genre;
                tag.addEventListener('click', () => this.toggleGenre(genre, tag));
                genreTags.appendChild(tag);
            });
        }
    }
    
    toggleGenre(genre, element) {
        const index = this.filters.genre.indexOf(genre);
        
        if (index >= 0) {
            this.filters.genre.splice(index, 1);
            element.classList.remove('active');
        } else {
            this.filters.genre.push(genre);
            element.classList.add('active');
        }
        
        this.updateSearchResults();
    }
    
    buildSearchIndex() {
        if (!window.mangasLibrary) return;
        
        this.searchIndex.clear();
        
        Object.entries(window.mangasLibrary).forEach(([id, manga]) => {
            const searchableText = [
                manga.info.name,
                manga.info.description || '',
                manga.info.author || '',
                ...(manga.info.genres || [])
            ].join(' ').toLowerCase();
            
            this.searchIndex.set(id, {
                id,
                name: manga.info.name,
                searchText: searchableText,
                rating: manga.info.rating || 0,
                year: manga.info.year || 0,
                status: manga.info.status || 'unknown',
                popularity: manga.scans.length,
                updated: manga.info.lastUpdate || Date.now(),
                data: manga
            });
        });
        
        console.log(`📚 Index de recherche créé: ${this.searchIndex.size} mangas`);
    }
    
    handleSearch(e) {
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            this.showAllMangas();
            this.hideSuggestions();
            return;
        }
        
        // Ajouter à l'historique
        this.addToHistory(query);
        
        // Effectuer la recherche
        const results = this.search(query);
        this.displayResults(results);
        this.updateStats(results.length, query);
    }
    
    search(query) {
        const normalizedQuery = query.toLowerCase();
        const results = [];
        
        this.searchIndex.forEach(item => {
            let score = 0;
            
            // Score basé sur la correspondance du nom
            if (item.name.toLowerCase().includes(normalizedQuery)) {
                score += item.name.toLowerCase().startsWith(normalizedQuery.toLowerCase()) ? 100 : 50;
            }
            
            // Score basé sur la correspondance du texte de recherche
            if (item.searchText.includes(normalizedQuery)) {
                score += 20;
            }
            
            // Score basé sur la correspondance exacte des mots
            const queryWords = normalizedQuery.split(' ');
            queryWords.forEach(word => {
                if (item.searchText.includes(word)) {
                    score += 10;
                }
            });
            
            // Filtres
            if (!this.passesFilters(item)) {
                score = 0;
            }
            
            if (score > 0) {
                results.push({ ...item, score });
            }
        });
        
        // Trier par score puis par critères sélectionnés
        return this.sortResults(results);
    }
    
    passesFilters(item) {
        // Filtre par genre
        if (this.filters.genre.length > 0) {
            const hasGenre = this.filters.genre.some(genre =>
                item.data.info.genres?.includes(genre)
            );
            if (!hasGenre) return false;
        }
        
        // Filtre par statut
        if (this.filters.status !== 'all' && item.status !== this.filters.status) {
            return false;
        }
        
        // Filtre par note
        if (item.rating < this.filters.rating) {
            return false;
        }
        
        return true;
    }
    
    sortResults(results) {
        return results.sort((a, b) => {
            let comparison = 0;
            
            // Tri principal par score
            comparison = b.score - a.score;
            
            // Tri secondaire par critère sélectionné
            if (comparison === 0) {
                switch (this.filters.sortBy) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'rating':
                        comparison = b.rating - a.rating;
                        break;
                    case 'year':
                        comparison = b.year - a.year;
                        break;
                    case 'popularity':
                        comparison = b.popularity - a.popularity;
                        break;
                    case 'updated':
                        comparison = b.updated - a.updated;
                        break;
                }
                
                if (this.filters.sortOrder === 'desc') {
                    comparison *= -1;
                }
            }
            
            return comparison;
        });
    }
    
    displayResults(results) {
        const mangaGrid = document.querySelector('.manga-library');
        if (!mangaGrid) return;
        
        if (results.length === 0) {
            mangaGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>Aucun résultat trouvé</h3>
                    <p>Essayez d'ajuster vos critères de recherche</p>
                </div>
            `;
            return;
        }
        
        // Utiliser la fonction d'affichage existante mais avec les résultats filtrés
        const filteredLibrary = {};
        results.forEach(result => {
            filteredLibrary[result.id] = result.data;
        });
        
        // Sauvegarder temporairement la bibliothèque complète
        const originalLibrary = window.mangasLibrary;
        window.mangasLibrary = filteredLibrary;
        
        // Afficher les résultats
        if (typeof window.displayMangaLibrary === 'function') {
            window.displayMangaLibrary();
        }
        
        // Restaurer la bibliothèque complète
        window.mangasLibrary = originalLibrary;
    }
    
    showAllMangas() {
        if (typeof window.displayMangaLibrary === 'function') {
            window.displayMangaLibrary();
        }
        this.updateStats(Object.keys(window.mangasLibrary || {}).length);
    }
    
    updateStats(count, query = '') {
        const statsEl = document.getElementById('search-stats');
        if (!statsEl) return;
        
        if (query) {
            statsEl.innerHTML = `📊 ${count} résultat${count > 1 ? 's' : ''} pour "${query}"`;
        } else {
            statsEl.innerHTML = `📚 ${count} manga${count > 1 ? 's' : ''} au total`;
        }
        
        statsEl.style.display = count > 0 ? 'block' : 'none';
    }
    
    showSuggestions() {
        const suggestionsEl = document.getElementById('search-suggestions');
        const searchInput = document.getElementById('search-input');
        
        if (!suggestionsEl || !searchInput) return;
        
        const query = searchInput.value.trim();
        let suggestions = [];
        
        if (query.length > 0) {
            // Suggestions basées sur les noms de mangas
            this.searchIndex.forEach(item => {
                if (item.name.toLowerCase().includes(query.toLowerCase()) && suggestions.length < 5) {
                    suggestions.push(item.name);
                }
            });
        } else {
            // Afficher l'historique de recherche
            suggestions = this.searchHistory.slice(0, 5);
        }
        
        if (suggestions.length > 0) {
            suggestionsEl.innerHTML = suggestions.map(suggestion => 
                `<div class="suggestion-item" onclick="searchManager.selectSuggestion('${suggestion}')">${suggestion}</div>`
            ).join('');
            suggestionsEl.style.display = 'block';
        } else {
            suggestionsEl.style.display = 'none';
        }
    }
    
    hideSuggestions() {
        const suggestionsEl = document.getElementById('search-suggestions');
        if (suggestionsEl) {
            suggestionsEl.style.display = 'none';
        }
    }
    
    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = suggestion;
            this.handleSearch({ target: { value: suggestion } });
            this.hideSuggestions();
        }
    }
    
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            this.showAllMangas();
            this.hideSuggestions();
        }
    }
    
    toggleFilters() {
        const filtersEl = document.getElementById('search-filters');
        const toggleBtn = document.getElementById('search-filters-toggle');
        
        if (filtersEl && toggleBtn) {
            const isVisible = filtersEl.style.display === 'block';
            filtersEl.style.display = isVisible ? 'none' : 'block';
            toggleBtn.classList.toggle('active', !isVisible);
        }
    }
    
    applyFilters() {
        // Récupérer les valeurs des filtres
        const statusFilter = document.getElementById('status-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const sortBy = document.getElementById('sort-by');
        
        if (statusFilter) this.filters.status = statusFilter.value;
        if (ratingFilter) this.filters.rating = parseFloat(ratingFilter.value);
        if (sortBy) this.filters.sortBy = sortBy.value;
        
        // Réappliquer la recherche
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            this.handleSearch({ target: { value: searchInput.value } });
        } else {
            this.updateSearchResults();
        }
        
        this.toggleFilters(); // Fermer les filtres
    }
    
    resetFilters() {
        this.filters = {
            genre: [],
            status: 'all',
            rating: 0,
            year: null,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        // Réinitialiser l'UI
        const statusFilter = document.getElementById('status-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const ratingValue = document.getElementById('rating-value');
        const sortBy = document.getElementById('sort-by');
        const sortOrder = document.getElementById('sort-order');
        
        if (statusFilter) statusFilter.value = 'all';
        if (ratingFilter) ratingFilter.value = '0';
        if (ratingValue) ratingValue.textContent = '0★';
        if (sortBy) sortBy.value = 'name';
        if (sortOrder) {
            sortOrder.dataset.order = 'asc';
            sortOrder.textContent = '↑';
            sortOrder.title = 'Ordre croissant';
        }
        
        // Réinitialiser les genres
        document.querySelectorAll('.genre-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        this.updateSearchResults();
    }
    
    toggleSortOrder() {
        const sortOrder = document.getElementById('sort-order');
        if (!sortOrder) return;
        
        const currentOrder = sortOrder.dataset.order;
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        
        sortOrder.dataset.order = newOrder;
        sortOrder.textContent = newOrder === 'asc' ? '↑' : '↓';
        sortOrder.title = newOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant';
        
        this.filters.sortOrder = newOrder;
        this.updateSearchResults();
    }
    
    updateSearchResults() {
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            this.handleSearch({ target: { value: searchInput.value } });
        } else {
            this.showAllMangas();
        }
    }
    
    addToHistory(query) {
        if (!query || this.searchHistory.includes(query)) return;
        
        this.searchHistory.unshift(query);
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
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
    updateIndex() {
        this.buildSearchIndex();
    }
    
    getStats() {
        return {
            totalMangas: this.searchIndex.size,
            searchHistory: this.searchHistory.length,
            activeFilters: Object.values(this.filters).filter(f => 
                f !== 'all' && f !== 0 && f !== 'name' && f !== 'asc' && 
                (Array.isArray(f) ? f.length > 0 : f !== null)
            ).length
        };
    }
}

// CSS pour la recherche
const searchStyles = `
.search-container {
    margin-bottom: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1rem;
    backdrop-filter: blur(10px);
}

.search-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
}

.search-input-group {
    flex: 1;
    position: relative;
}

.search-input-group input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.3s ease;
}

.search-input-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.15);
}

.search-clear-btn {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.search-clear-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.search-filters-btn {
    background: var(--primary-color);
    border: none;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.search-filters-btn:hover,
.search-filters-btn.active {
    background: var(--secondary-color);
    transform: translateY(-1px);
}

.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(26, 26, 26, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    display: none;
    backdrop-filter: blur(10px);
}

.suggestion-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.suggestion-item:last-child {
    border-bottom: none;
}

.search-filters {
    display: none;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 500;
    color: var(--text-primary);
}

.filter-group select,
.filter-group input {
    padding: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.genre-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.genre-tag {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.genre-tag:hover {
    background: rgba(255, 255, 255, 0.2);
}

.genre-tag.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.rating-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.rating-filter input {
    flex: 1;
}

.sort-order-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.2rem;
    width: 40px;
    margin-left: 0.5rem;
}

.sort-order-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.filter-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.search-stats {
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
}

.no-results-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-results h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

@media (max-width: 768px) {
    .search-header {
        flex-direction: column;
    }
    
    .filters-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-actions {
        justify-content: stretch;
    }
    
    .filter-actions .btn {
        flex: 1;
    }
}
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = searchStyles;
document.head.appendChild(styleSheet);

// Initialiser le gestionnaire de recherche
let searchManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que la bibliothèque soit chargée
        setTimeout(() => {
            if (window.mangasLibrary) {
                searchManager = new SearchManager();
                window.searchManager = searchManager;
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (window.mangasLibrary) {
            searchManager = new SearchManager();
            window.searchManager = searchManager;
        }
    }, 1000);
}
