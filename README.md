# 📚 Scraper Animé - Lecteur de Mangas en Ligne

Une application web moderne pour scraper et afficher les scans d'animés avec une interface de lecture type livre.

## 🌐 Démos En Ligne

- **✅ Vercel Production** : [anime-reader-nf945dbca-lucas-tsls-projects.vercel.app](https://anime-reader-nf945dbca-lucas-tsls-projects.vercel.app) **FONCTIONNEL** 🆕
- **✅ Vercel Alias** : [anime-reader-app.vercel.app](https://anime-reader-app.vercel.app) **FONCTIONNEL**
- **GitHub Pages (Demo)** : [lucas-tsl.github.io/scrananime](https://lucas-tsl.github.io/scrananime) ✅ **FONCTIONNEL**

## ✨ Fonctionnalités### 🎯 Scraping Intelligent
- Support de 6 mangas populaires : One Piece, Naruto, Dragon Ball Super, My Hero Academia, Attack on Titan, Demon Slayer
- Limitation configurable du nombre de chapitres scrapés
- Cache automatique pour des performances optimales
- API RESTful pour l'intégration

### 📖 Interface de Lecture
- **Mode Livre** : Expérience de lecture immersive
- **🆕 Images Manga Optimisées** : Affichage grande taille pour voir tous les détails
- **🆕 Détection Automatique** : Images verticales agrandies automatiquement
- **🆕 Scroll Intelligent** : Navigation fluide dans les pages haute résolution
- Navigation fluide entre les pages et chapitres
- Interface responsive pour tous les appareils
- Design moderne et épuré

### ⚙️ Paramètres Avancés (20+ Options)#### 🎨 Apparence
- Thèmes sombre/clair avec basculement automatique
- Ajustement de la luminosité et du contraste
- Personnalisation des couleurs d'interface

#### 📚 Lecture
- Sens de lecture (gauche-droite / droite-gauche)
- Mode plein écran automatique
- Zoom et ajustement des images

#### 🖼️ Images
- **🆕 Affichage Grande Taille** : Images manga jusqu'à 95vh pour les détails
- **🆕 Détection Verticale** : Optimisation automatique des pages manga
- **🆕 Mode Scroll** : Navigation fluide dans les images haute résolution
- Qualité d'affichage configurable
- Préchargement intelligent
- Compression adaptive

#### ⚡ Performance
- Gestion du cache navigateur
- Optimisation de la bande passante
- Préchargement des chapitres

#### ⌨️ Raccourcis Clavier
- Navigation rapide (flèches, espace, etc.)
- Raccourcis personnalisables
- Mode navigation avancée

#### 💾 Gestion des Données
- Synchronisation des préférences
- Sauvegarde automatique des positions de lecture
- Export/Import des paramètres

#### ❓ Aide & Support
- Guide d'utilisation intégré
- FAQ interactive
- Informations de version

## 🛠️ Technologies### Backend
- **Node.js** + **Express.js** (Serverless sur Vercel)
- **Cheerio** pour le parsing HTML
- **Puppeteer** pour le contenu dynamique
- **DirectAnimeSamaScraper** personnalisé

### Frontend
- **HTML5** / **CSS3** / **JavaScript ES6+**
- Design responsive avec CSS Grid/Flexbox
- Interface utilisateur moderne et intuitive

### Sécurité & Performance
- **Helmet.js** pour les en-têtes de sécurité
- **CORS** configuré
- Rate limiting intégré
- Cache intelligent multi-niveaux

## 🚀 Déploiement

### ⚠️ Note sur Vercel
Vercel a activé une protection d'authentification. Pour un accès public :

**Option 1 - Utilisation locale** (recommandée) :
```bash
# Clone et installation
git clone https://github.com/Lucas-tsl/scrananime.git
cd scrananime
npm install
npm start

# L'application sera accessible sur http://localhost:3000
```

**Option 2 - GitHub Pages** (demo data) :
- URL directe : [lucas-tsl.github.io/scrananime](https://lucas-tsl.github.io/scrananime)
- Interface complète fonctionnelle

**Option 3 - Vercel** (production) :
- URL directe : [anime-reader-app.vercel.app](https://anime-reader-app.vercel.app)
- API complète et interface fonctionnelle
- Déploiement serverless optimisé

### Déploiement Vercel
```bash
# Installation et connexion
npm install -g vercel
vercel login

# Déploiement
vercel --prod
```

### Développement Local
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm start

# L'application sera accessible sur http://localhost:3000
```

## 🚀 Status de Déploiement

✅ **GitHub Pages** - Demo avec données statiques  
✅ **Vercel Production** - API complète + Interface  
✅ **Local Development** - Serveur Express complet  

### 🎯 URLs de Production
- **Interface principale** : https://anime-reader-9ct5w8ss5-lucas-tsls-projects.vercel.app
- **API endpoint** : https://anime-reader-9ct5w8ss5-lucas-tsls-projects.vercel.app/api/mangas
- **Health check** : https://anime-reader-9ct5w8ss5-lucas-tsls-projects.vercel.app/health

## 📁 Structure du Projet
```📦 scrap-anime/├── 📂 api/│   └── index.js              # Fonction serverless Vercel├── 📂 css/│   └── reader.css           # Styles unifiés├── 📂 js/│   └── book-reader.js       # Logique frontend├── 📂 lib/│   └── DirectAnimeSamaScraper.js # Scraper personnalisé├── 📄 book.html             # Interface principale├── 📄 server.js             # Serveur Express local├── 📄 vercel.json           # Configuration Vercel└── 📄 package.json          # Dépendances et scripts```## 🔧 Configuration### Variables d'Environnement```envNODE_ENV=production           # Environnement
RATE_LIMIT=100               # Limite de requêtes par IP
CACHE_DURATION=3600          # Durée du cache (secondes)
```

### Paramètres du Scraper
```javascript
// Configuration dans DirectAnimeSamaScraper.js
const MANGAS = {
  'one-piece': { limit: 50, priority: 'high' },
  'naruto': { limit: 30, priority: 'medium' },
  // ... autres mangas
};
```

## 📊 API Endpoints

### GET `/api/scrap`
Récupère les derniers chapitres de tous les mangas.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "one-piece": [
      {
        "title": "Chapitre 1105",
        "url": "https://...",
        "image": "https://...",
        "date": "2025-07-20"
      }
    ]
  },
  "timestamp": "2025-07-20T10:30:00Z"
}
```

### GET `/health`
Vérification de l'état du service.

## 🎯 Roadmap

- [ ] 🔐 Authentification utilisateur
- [ ] 📱 Application mobile (PWA)
- [ ] 🌍 Support multilingue
- [ ] 📺 Mode présentaion/diaporama
- [ ] 🔔 Notifications de nouveaux chapitres
- [ ] 👥 Fonctionnalités sociales (favoris, commentaires)

## 📝 Changelog

### v2.1.0 (2025-07-20) 🆕
- 🖼️ **Images Manga Optimisées** : Affichage grande taille (95vh) pour voir tous les détails
- 🔍 **Détection Automatique** : Images verticales identifiées et optimisées automatiquement
- 📱 **Mode Scroll Intelligent** : Navigation fluide dans les pages haute résolution
- 📲 **Responsive Mobile** : Affichage optimisé pour tous les appareils
- 🎮 **UX Améliorée** : Curseurs interactifs et feedback visuel

### v2.0.0 (2025-07-20)
- 🚀 Déploiement Vercel serverless
- ⚙️ Page de paramètres avancés (20+ options)
- 🧹 Refactorisation complète (-75% de fichiers)
- 📱 Interface responsive améliorée

### v1.0.0 (2025-07-15)
- 🎉 Version initiale
- 📖 Interface de lecture livre
- 🔍 Scraper DirectAnimeSama
- 🎨 Design moderne

## 🤝 Contribution

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add: Amazing Feature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **DirectAnimeSama** pour les sources de contenu
- **Vercel** pour l'hébergement serverless
- **GitHub** pour l'hébergement du code et Pages
- La communauté **Node.js** pour les outils exceptionnels

---

**💡 Note** : Cette application est à des fins éducatives. Respectez les droits d'auteur et les conditions d'utilisation des sites scrapés.

**🌟 Astuce** : Utilisez les raccourcis clavier pour une navigation rapide !
