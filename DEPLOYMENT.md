# 🚀 Guide de Déploiement DropFlow

## 📋 Prérequis
- Compte GitHub
- Compte Vercel (gratuit)
- Projet Supabase configuré

## 🔧 Variables d'Environnement Requises

### Dans Vercel (Settings > Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton-anon-key
NEXT_PUBLIC_APP_URL=https://ton-domaine.com
```

## 📦 Étapes de Déploiement

### 1. Préparer le Code
```bash
# Vérifier que tout fonctionne
npm run build
npm start
```

### 2. Pousser sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ton-utilisateur/dropflow.git
git push -u origin main
```

### 3. Déployer sur Vercel
1. Va sur [vercel.com](https://vercel.com)
2. Crée un compte (connexion GitHub)
3. Clique "New Project"
4. Sélectionne ton repo GitHub
5. Configure les variables d'environnement
6. Clique "Deploy"

### 4. Ajouter ton Domaine
1. Dans Vercel → Ton projet → Settings → Domains
2. Ajoute ton domaine
3. Configure les DNS selon les instructions Vercel

## 🌐 URLs de Production
- **Site** : https://ton-domaine.com
- **Dashboard** : https://ton-domaine.com/dashboard
- **Auth** : https://ton-domaine.com/auth/login

## 🔒 Sécurité
- ✅ HTTPS automatique
- ✅ Variables d'environnement sécurisées
- ✅ RLS Supabase activé
- ✅ Authentification sécurisée

## 📊 Monitoring
- Vercel Analytics (gratuit)
- Supabase Dashboard
- Logs en temps réel

## 🆘 Support
- Vercel : Documentation officielle
- Supabase : Dashboard + Support
- Next.js : Documentation officielle 