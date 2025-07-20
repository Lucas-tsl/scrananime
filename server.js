/**
 * 🎌 Anime Scans Server - Version épurée et optimisée
 * Serveur Express minimaliste pour le lecteur de scans manga
 */

const express = require('express');
const path = require('path');
const DirectAnimeSamaScraper = require('./scrapers/DirectAnimeSamaScraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Cache pour optimiser les performances
let scansCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Initialisation du scraper
const scraper = new DirectAnimeSamaScraper();

/**
 * Route principale - Redirection vers l'interface livre
 */
app.get('/', (req, res) => {
    res.redirect('/book.html');
});

/**
 * API - Récupération des scans populaires avec cache
 */
app.get('/api/scans/popular', async (req, res) => {
    try {
        const {
            maxChaptersPerManga = 5,
            maxPagesPerChapter = 10,
            maxMangas = 6
        } = req.query;

        // Vérifier le cache
        const now = Date.now();
        if (scansCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
            console.log('📦 Utilisation du cache');
            return res.json({
                success: true,
                count: Object.keys(scansCache).length,
                data: scansCache,
                cached: true,
                timestamp: cacheTimestamp
            });
        }

        console.log('🔄 Récupération de nouveaux scans...');
        const scans = await scraper.getPopularScans({
            maxChaptersPerManga: parseInt(maxChaptersPerManga),
            maxPagesPerChapter: parseInt(maxPagesPerChapter),
            maxMangas: parseInt(maxMangas)
        });

        // Mettre à jour le cache
        scansCache = scans;
        cacheTimestamp = now;

        res.json({
            success: true,
            count: Object.keys(scans).length,
            data: scans,
            cached: false,
            timestamp: cacheTimestamp
        });

    } catch (error) {
        console.error('❌ Erreur API:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Erreur lors de la récupération des scans'
        });
    }
});

/**
 * API - Recherche de mangas
 */
app.get('/api/search', async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Paramètre de recherche manquant'
            });
        }

        const results = await scraper.searchManga(query);
        
        res.json({
            success: true,
            query: query,
            count: Object.keys(results).length,
            data: results
        });

    } catch (error) {
        console.error('❌ Erreur recherche:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * API - Vider le cache (utile pour le développement)
 */
app.post('/api/cache/clear', (req, res) => {
    scansCache = null;
    cacheTimestamp = null;
    
    res.json({
        success: true,
        message: 'Cache vidé avec succès'
    });
});

/**
 * Route de santé
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cache: {
            active: !!scansCache,
            timestamp: cacheTimestamp,
            count: scansCache ? Object.keys(scansCache).length : 0
        }
    });
});

/**
 * Middleware de gestion d'erreurs
 */
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
    });
});

/**
 * Route 404
 */
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        path: req.originalUrl
    });
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log('🎌 ====================================');
    console.log('🎌    ANIME SCANS READER SERVER    ');
    console.log('🎌 ====================================');
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📱 Interface: http://localhost:${PORT}/book.html`);
    console.log(`📊 Santé: http://localhost:${PORT}/health`);
    console.log(`🔍 API: http://localhost:${PORT}/api/scans/popular`);
    console.log('🎌 ====================================');
    
    // Pré-charger le cache au démarrage
    setTimeout(async () => {
        try {
            console.log('📦 Pré-chargement du cache...');
            await scraper.getPopularScans();
            console.log('✅ Cache pré-chargé avec succès');
        } catch (error) {
            console.warn('⚠️ Erreur lors du pré-chargement:', error.message);
        }
    }, 1000);
});

module.exports = app;
