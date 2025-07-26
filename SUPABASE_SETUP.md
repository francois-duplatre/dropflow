# 🚀 Configuration Supabase - Guide Simple

## Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub
4. Cliquez sur "New Project"
5. Choisissez votre organisation
6. Donnez un nom à votre projet (ex: "dropflow")
7. Créez un mot de passe pour la base de données
8. Choisissez une région proche de vous
9. Cliquez sur "Create new project"

## Étape 2 : Récupérer vos clés

1. Dans votre projet Supabase, allez dans "Settings" → "API"
2. Copiez :
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key (commence par `eyJ...`)

## Étape 3 : Configurer les variables d'environnement

1. Créez un fichier `.env.local` à la racine de votre projet
2. Ajoutez vos clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Étape 4 : Créer les tables

1. Dans votre projet Supabase, allez dans "SQL Editor"
2. Copiez tout le contenu du fichier `supabase-schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run"

## Étape 5 : Tester votre application

1. Redémarrez votre serveur de développement :
```bash
npm run dev
```

2. Allez sur `http://localhost:3000`
3. Testez l'inscription et la connexion

## ✅ Vérification

Votre application devrait maintenant :
- ✅ Permettre l'inscription de nouveaux utilisateurs
- ✅ Permettre la connexion
- ✅ Sauvegarder les boutiques dans Supabase
- ✅ Sauvegarder les produits dans Supabase
- ✅ Sécuriser les données avec RLS

## 🔧 Dépannage

### Erreur "Invalid API key"
- Vérifiez que vos clés sont correctes dans `.env.local`
- Redémarrez le serveur après modification

### Erreur "Table doesn't exist"
- Vérifiez que le script SQL a été exécuté
- Vérifiez dans "Table Editor" que les tables existent

### Erreur d'authentification
- Vérifiez que l'authentification est activée dans Supabase
- Allez dans "Authentication" → "Settings"

## 🎉 Félicitations !

Votre application est maintenant connectée à Supabase avec :
- 🔐 Authentification sécurisée
- 🗄️ Base de données PostgreSQL
- 🔒 Sécurité RLS
- ⚡ API automatique

Votre site est prêt pour la production ! 🚀 