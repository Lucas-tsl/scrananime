# 🎌 Anime Scans Reader

Un lecteur de manga en ligne moderne avec interface livre, développé en Node.js et vanilla JavaScript.

![Anime Scans Reader](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-red.svg)

## ✨ Fonctionnalités

### 📖 **Lecture Immersive**
- **Interface livre** avec navigation fluide
- **Mode plein écran** pour une expérience cinématique
- **Navigation au clavier** (flèches, espace, etc.)
- **Ajustement automatique** des images (largeur, hauteur, original)
- **Zoom et luminosité** configurables

### 🎨 **Interface Moderne**
- **Design responsive** optimisé mobile/desktop
- **Mode sombre** pour lecture nocturne
- **Animations fluides** et transitions élégantes
- **7 sections de paramètres** complètement configurables
- **Plus de 20 options** de personnalisation

### 📚 **Gestion Avancée**
- **Bibliothèque organisée** avec couvertures et statistiques
- **Système de favoris** avec étoiles
- **Historique de lecture** automatique
- **Export/Import** de toutes les données personnelles
- **Recherche et filtres** intégrés

### ⚡ **Performance**
- **Cache intelligent** avec gestion automatique
- **Préchargement** des pages suivantes
- **Scraping optimisé** avec limite de taux
- **API RESTful** documentée
- **Gestion d'erreurs** robuste

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation rapideime Scans Reader - Version Épurée

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
