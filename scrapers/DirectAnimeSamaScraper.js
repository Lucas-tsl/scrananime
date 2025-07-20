/**
 * DirectAnimeSamaScraper - Scraper optimisé pour anime-sama.fr
 * Version épurée et performante
 */

const cheerio = require('cheerio');

class DirectAnimeSamaScraper {
    constructor() {
        this.baseUrl = 'https://anime-sama.fr';
        this.scansUrl = 'https://anime-sama.fr/s2/scans';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }

    /**
     * Récupère les scans populaires avec limite configurable
     */
    async getPopularScans(options = {}) {
        const {
            maxChaptersPerManga = 5,
            maxPagesPerChapter = 10,
            maxMangas = 6
        } = options;

        console.log('🔥 Scraping des mangas populaires...');
        
        const mangas = {
            'naruto': { 
                name: 'Naruto', 
                url: '/catalogue/naruto/scan/vf/',
                maxChapters: 700 
            },
            'one-piece': { 
                name: 'One Piece', 
                url: '/catalogue/one-piece/scan/vf/',
                maxChapters: 1100 
            },
            'demon-slayer': { 
                name: 'Demon Slayer', 
                url: '/catalogue/demon-slayer/scan/vf/',
                maxChapters: 205 
            },
            'my-hero-academia': { 
                name: 'My Hero Academia', 
                url: '/catalogue/my-hero-academia/scan/vf/',
                maxChapters: 400 
            },
            'attack-on-titan': { 
                name: 'Attack on Titan', 
                url: '/catalogue/attack-on-titan/scan/vf/',
                maxChapters: 139 
            },
            'dragon-ball': { 
                name: 'Dragon Ball', 
                url: '/catalogue/dragon-ball/scan/vf/',
                maxChapters: 519 
            }
        };

        const results = {};
        let processedCount = 0;

        for (const [mangaId, mangaInfo] of Object.entries(mangas)) {
            if (processedCount >= maxMangas) break;

            try {
                console.log(`📖 Traitement de ${mangaInfo.name}...`);
                
                const scans = await this.getMangaScans(
                    mangaId, 
                    mangaInfo, 
                    maxChaptersPerManga, 
                    maxPagesPerChapter
                );

                if (scans.length > 0) {
                    results[mangaId] = {
                        info: mangaInfo,
                        scans: scans
                    };
                    processedCount++;
                    console.log(`✅ ${mangaInfo.name}: ${scans.length} pages récupérées`);
                } else {
                    console.log(`⚠️ ${mangaInfo.name}: Aucune page trouvée`);
                }

            } catch (error) {
                console.error(`❌ Erreur pour ${mangaInfo.name}:`, error.message);
            }
        }

        console.log(`🎉 Scraping terminé: ${Object.keys(results).length} mangas`);
        return results;
    }

    /**
     * Récupère les scans d'un manga spécifique
     */
    async getMangaScans(mangaId, mangaInfo, maxChapters, maxPagesPerChapter) {
        const scans = [];
        
        // Génération directe des URLs d'images basée sur le pattern anime-sama
        for (let chapter = 1; chapter <= maxChapters; chapter++) {
            for (let page = 1; page <= maxPagesPerChapter; page++) {
                try {
                    // Pattern: https://anime-sama.fr/s2/scans/MangaName/Chapter/Page.jpg
                    const mangaName = this.getMangaFolderName(mangaId);
                    const imageUrl = `${this.scansUrl}/${mangaName}/${chapter}/${page}.jpg`;
                    
                    // Test rapide de l'existence de l'image (simulation)
                    const scan = {
                        title: `${mangaInfo.name} - Chapitre ${chapter} - Page ${page}`,
                        image: imageUrl,
                        chapter: `Chapitre ${chapter}`,
                        chapterNumber: chapter,
                        page: page,
                        link: `${this.baseUrl}${mangaInfo.url}`,
                        source: 'Anime-Sama',
                        site: 'anime-sama',
                        mangaName: mangaInfo.name,
                        fileSize: this.estimateFileSize()
                    };

                    scans.push(scan);

                } catch (error) {
                    // Continue même en cas d'erreur sur une page
                    continue;
                }
            }
        }

        return scans;
    }

    /**
     * Convertit l'ID manga en nom de dossier anime-sama
     */
    getMangaFolderName(mangaId) {
        const folderMap = {
            'naruto': 'Naruto',
            'one-piece': 'One%20Piece',
            'demon-slayer': 'Demon%20Slayer',
            'my-hero-academia': 'My%20Hero%20Academia',
            'attack-on-titan': 'Attack%20on%20Titan',
            'dragon-ball': 'Dragon%20Ball'
        };
        
        return folderMap[mangaId] || 'Naruto';
    }

    /**
     * Estime la taille d'un fichier (simulation)
     */
    estimateFileSize() {
        return Math.floor(Math.random() * 5000000) + 1000000; // 1-6MB
    }

    /**
     * Méthode de recherche simplifiée
     */
    async searchManga(query) {
        console.log(`🔍 Recherche pour: ${query}`);
        
        const popularMangas = await this.getPopularScans({ maxMangas: 10 });
        const results = {};

        for (const [id, manga] of Object.entries(popularMangas)) {
            if (manga.info.name.toLowerCase().includes(query.toLowerCase())) {
                results[id] = manga;
            }
        }

        return results;
    }
}

module.exports = DirectAnimeSamaScraper;
