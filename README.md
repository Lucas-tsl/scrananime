# 🎌 Scrananime - Lecteur de Manga Moderne

Un lecteur de manga en ligne avec interface livre, développé en Node.js et vanilla JavaScript.

![Scrananime](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-red.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Installation Rapide

```bash
# Cloner le repository
git clone https://github.com/Lucas-tsl/scrananime.git
cd scrananime

# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

**Accès** : http://localhost:3000ime Scans Reader - Version Épurée

## 📋 Description

Application web minimaliste et optimisée pour lire des scans de manga en mode livre avec une expérience utilisateur fluide.

## � Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur
npm start

# Mode développement
npm run dev
```

**Accès** : http://localhost:3000

## � Structure épurée

```
anime-scans-reader/
├── server.js                 # Serveur Express optimisé
├── package.json              # Dépendances minimales
├── public/
│   ├── book.html            # Interface principale
│   ├── css/
│   │   └── reader.css       # Styles unifiés
│   └── js/
│       └── book-reader.js   # Logique complète
└── scrapers/
    └── DirectAnimeSamaScraper.js  # Scraper optimisé
```

## ✨ Fonctionnalités

### 📚 **Interface Livre**
- Navigation par onglets (Bibliothèque, Lecture, Favoris, Paramètres)
- Grille de mangas avec progression
- Système de favoris intégré

### 📖 **Lecteur Avancé**
- Mode plein écran immersif
- Navigation clavier (flèches, espace, F, C, Escape)
- Chapitres organisés avec sidebar
- Zoom et luminosité ajustables
- Sauvegarde automatique de progression

### 🎯 **Optimisations**
- Cache intelligent (30 minutes)
- API REST minimaliste
- Code épuré et performances optimisées
- Accessibilité complète

## 🌐 API Endpoints

- `GET /` → Redirection vers l'interface
- `GET /api/scans/popular` → Mangas populaires
- `GET /api/search?q=term` → Recherche
- `GET /health` → État du serveur
- `POST /api/cache/clear` → Vider le cache

## 🎮 Raccourcis clavier

| Touche | Action |
|--------|--------|
| ← / ↑ | Page précédente |
| → / ↓ / Espace | Page suivante |
| F | Basculer plein écran |
| C | Ouvrir/fermer chapitres |
| Escape | Fermer le lecteur |

## � Mangas disponibles

- **Naruto** (700+ chapitres)
- **One Piece** (1100+ chapitres)
- **Demon Slayer** (205 chapitres)
- **My Hero Academia** (400+ chapitres)
- **Attack on Titan** (139 chapitres)
- **Dragon Ball** (519 chapitres)

## 🔧 Technologies

- **Backend** : Node.js + Express
- **Frontend** : HTML5 + CSS3 + JavaScript vanilla
- **Scraping** : Cheerio
- **Cache** : Mémoire (30 min)

## � Données sauvegardées

- Historique de lecture (localStorage)
- Favoris (localStorage)
- Paramètres utilisateur (localStorage)

---

**🎌 Application prête à l'emploi !** Interface moderne, code épuré, performances optimisées.
