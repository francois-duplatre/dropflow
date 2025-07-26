# 🧪 Guide de Test - Sécurité et Authentification

## ✅ **Étapes de Test**

### **1. Configuration Supabase**
- [ ] Exécuter le script `fix-rls-complete.sql` dans l'éditeur SQL de Supabase
- [ ] Vérifier que les politiques RLS sont créées (12 politiques au total)
- [ ] S'assurer que "Enable email confirmations" est activé dans Authentication Settings

### **2. Test d'Inscription**
1. **Créer un nouveau compte** avec email valide
2. **Vérifier** que le message de confirmation email s'affiche
3. **Aller dans votre email** et cliquer sur le lien de confirmation
4. **Retourner sur le site** et se connecter

### **3. Test de Connexion**
1. **Se connecter** avec le compte confirmé
2. **Vérifier** que vous arrivez sur le dashboard
3. **Vérifier** que seules vos boutiques s'affichent

### **4. Test de Sécurité**
1. **Créer 2 comptes différents** (email1@test.com et email2@test.com)
2. **Se connecter avec le premier compte** et créer quelques boutiques
3. **Se déconnecter** et se connecter avec le deuxième compte
4. **Vérifier** que le deuxième compte ne voit que ses propres boutiques

### **5. Test de Persistance**
1. **Créer des boutiques** dans un compte
2. **Fermer le navigateur** complètement
3. **Rouvrir** et se reconnecter
4. **Vérifier** que les boutiques sont toujours là

## 🔍 **Vérifications dans Supabase**

### **Table Authentication > Users**
- Vérifier que les utilisateurs sont créés
- Vérifier que `email_confirmed_at` est renseigné après confirmation

### **Table Database > users**
- Vérifier que les profils utilisateurs sont créés
- Vérifier que `id` correspond à l'ID dans Authentication

### **Table Database > shops**
- Vérifier que `user_id` correspond bien à l'utilisateur connecté
- Vérifier que chaque utilisateur ne voit que ses boutiques

## 🚨 **Problèmes Courants**

### **Problème : "Je vois les boutiques des autres"**
**Solution :** Exécuter le script `fix-rls-complete.sql` dans Supabase

### **Problème : "Je ne peux pas me connecter après inscription"**
**Solution :** Vérifier que l'email est confirmé dans Supabase Authentication

### **Problème : "Les boutiques ne se chargent pas"**
**Solution :** Vérifier que l'utilisateur a un profil dans la table `users`

## 📊 **Logs de Debug**

Ouvrir la console du navigateur (F12) et vérifier :
- Pas d'erreurs 403 (Forbidden)
- Les requêtes SQL incluent bien `user_id = auth.uid()`
- Les sessions sont correctement gérées

## ✅ **Résultats Attendus**

- ✅ **Chaque utilisateur ne voit que ses données**
- ✅ **Inscription avec confirmation email**
- ✅ **Connexion après confirmation**
- ✅ **Sessions persistantes**
- ✅ **Sécurité RLS active** 