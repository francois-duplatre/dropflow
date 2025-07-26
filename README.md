# 🛍️ DropFlow - Plateforme de Gestion Dropshipping

Une application web moderne pour gérer vos boutiques dropshipping avec une interface intuitive et des fonctionnalités complètes.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Inscription** : Créez votre compte gratuitement
- **Connexion** : Accédez à votre tableau de bord
- **Profil utilisateur** : Gérez vos informations personnelles
- **Sécurité** : Authentification sécurisée avec localStorage

### 🏪 Gestion des Boutiques
- **Création de boutiques** : Ajoutez autant de boutiques que vous voulez
- **Tableau de bord** : Vue d'ensemble de toutes vos boutiques
- **Statistiques** : Suivez vos performances
- **Recherche** : Trouvez rapidement vos boutiques

### 📦 Gestion des Produits
- **Ajout de produits** : Ajoutez des produits à vos boutiques
- **Gestion des liens** : Stockez vos liens Etsy et dropshipping
- **Statuts** : Activez/désactivez vos produits
- **Catégorisation** : Organisez vos produits par catégories
- **Recherche et filtres** : Trouvez facilement vos produits

### 👤 Profil Utilisateur
- **Informations personnelles** : Modifiez vos données
- **Historique** : Consultez votre date d'inscription
- **Paramètres** : Gérez vos préférences

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (gratuit)

### Installation
```bash
# Cloner le projet
git clone [url-du-repo]

# Aller dans le dossier
cd project-2

# Installer les dépendances
npm install

# Configurer Supabase (voir SUPABASE_SETUP.md)
# 1. Créer un projet Supabase
# 2. Copier les clés dans .env.local
# 3. Exécuter le script SQL

# Démarrer le serveur de développement
npm run dev
```

### Accès à l'application
Ouvrez votre navigateur et allez à : `http://localhost:3000`

## 📱 Utilisation

### 1. Créer un compte
- Allez sur la page d'accueil
- Cliquez sur "Créer un compte"
- Remplissez vos informations
- Validez votre inscription

### 2. Se connecter
- Utilisez votre email et mot de passe
- Accédez à votre tableau de bord

### 3. Créer une boutique
- Dans le tableau de bord, cliquez sur "Nouvelle Boutique"
- Donnez un nom à votre boutique
- Votre boutique est créée !

### 4. Ajouter des produits
- Cliquez sur "Gérer les produits" dans une boutique
- Ajoutez vos produits avec :
  - Nom et référence
  - Prix
  - Catégorie
  - Liens Etsy et dropshipping
  - Image du produit

### 5. Gérer votre profil
- Cliquez sur l'icône ⚙️ dans la navigation
- Modifiez vos informations personnelles
- Sauvegardez vos changements

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 13 avec App Router
- **UI** : Tailwind CSS + shadcn/ui
- **Icons** : Lucide React
- **Authentification** : Supabase Auth
- **Base de données** : Supabase PostgreSQL
- **Sécurité** : Row Level Security (RLS)

## 📁 Structure du Projet

```
project-2/
├── app/                    # Pages Next.js
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Tableau de bord
│   └── globals.css        # Styles globaux
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI
│   └── auth-guard.tsx    # Protection des routes
├── lib/                  # Utilitaires
│   ├── auth.ts           # Gestion de l'authentification
│   ├── database.ts       # Gestion des données
│   └── utils.ts          # Utilitaires généraux
└── README.md             # Documentation
```

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Personnalisation
- **Couleurs** : Modifiez `tailwind.config.ts`
- **Composants** : Personnalisez dans `components/ui/`
- **Styles** : Modifiez `app/globals.css`

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Netlify
```bash
# Build
npm run build

# Déployer le dossier .next
```

## 🔮 Améliorations Futures

### Fonctionnalités avancées
- [ ] Analytics et statistiques
- [ ] Export de données
- [ ] Intégration API Etsy
- [ ] Notifications en temps réel
- [ ] Mode sombre
- [ ] Upload d'images
- [ ] Synchronisation multi-appareils

### Sécurité
- [ ] Validation des données côté serveur
- [ ] Protection CSRF
- [ ] Rate limiting
- [ ] Audit trail
- [ ] Chiffrement des données sensibles

### Performance
- [ ] Cache Redis
- [ ] CDN pour les images
- [ ] Optimisation des requêtes
- [ ] Lazy loading

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour les entrepreneurs dropshipping** 