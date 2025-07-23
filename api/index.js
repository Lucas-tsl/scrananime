/**
 * 🎌 Scrananime API - Version Vercel
 * Serveur Express optimisé pour déploiement Vercel
 */

const express = require('express');
const path = require('path');
const DirectAnimeSamaScraper = require('./scrapers/DirectAnimeSamaScraper');

const app = express();

// Middleware
app.use(express.json());

// Cache pour optimiser les performances
let scansCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Initialisation du scraper
const scraper = new DirectAnimeSamaScraper();

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
 * API - Alias pour /api/mangas (compatibilité)
 */
app.get('/api/mangas', async (req, res) => {
    try {
        const {
            maxChaptersPerManga = 5,
            maxPagesPerChapter = 10,
            maxMangas = 6
        } = req.query;

        console.log('🔄 Récupération des mangas...');
        const scans = await scraper.getPopularScans({
            maxChaptersPerManga: parseInt(maxChaptersPerManga),
            maxPagesPerChapter: parseInt(maxPagesPerChapter),
            maxMangas: parseInt(maxMangas)
        });

        res.json({
            success: true,
            count: Object.keys(scans).length,
            data: scans,
            cached: false,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('❌ Erreur API mangas:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Erreur lors de la récupération des mangas'
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
        environment: 'vercel',
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
 * Route 404 pour API seulement
 */
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route API non trouvée',
        path: req.originalUrl
    });
});

// Export pour Vercel Serverless Functions
module.exports = app;
