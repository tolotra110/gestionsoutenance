# MOBILE — application étudiante (React Native + Node.js)

Dossier à placer **à la racine du dépôt Git**, à côté de `BACKEND` et `FRONTEND` (qui ne sont pas modifiés) :

```
gestion-soutenance/
├── BACKEND/     (web — inchangé)
├── FRONTEND/    (web — inchangé)
└── MOBILE/
    ├── backend/ API mobile (Express) -> MÊME base PostgreSQL « Soutenancedb » que le web
    └── app/     application React Native (Expo)
```

## 1. Lancer le backend mobile (même BD que le web)

PostgreSQL doit tourner sur l'ordinateur (port 5433) avec les migrations web déjà faites (001 à 006).

```bash
cd MOBILE/backend
npm install
node server.js          # http://localhost:4000
```

- Le mot de passe est lu automatiquement dans `BACKEND/.env` du web. Sinon : copier `.env.example` en `.env`.
- Au démarrage, les colonnes manquantes de `etudiants` (lieu de stage, téléphone, date et lieu de naissance, validation du thème) sont ajoutées si besoin (migrations `008` à `010`, ajouts seuls).

## 2. Préparer l'application

```bash
cd MOBILE/app
npm install
npx expo install --fix   # aligne les versions des paquets sur la version d'Expo installée
```

## 3. Tester sur un téléphone (même Wi-Fi que l'ordinateur)

```bash
# Windows : trouver l'IP de l'ordinateur -> « Adresse IPv4 »
ipconfig
# Autoriser le port 4000 (PowerShell en administrateur)
netsh advfirewall firewall add rule name="Soutenance 4000" dir=in action=allow protocol=TCP localport=4000

# Lancer l'app (remplacer 192.168.1.10 par votre IP)
set EXPO_PUBLIC_API_URL=http://192.168.1.10:4000      # PowerShell : $env:EXPO_PUBLIC_API_URL="http://192.168.1.10:4000"
npx expo start
```
Scanner le QR code avec l'application **Expo Go**.

## 4. Donner l'application par un LIEN http:// (Facebook / Messenger)

Les élèves cliquent sur le lien : l'application s'ouvre dans le navigateur, sans installation.

```bash
cd MOBILE/app
npx expo export -p web          # crée MOBILE/app/dist
cd ../backend
node server.js                  # sert l'API + l'application sur http://IP:4000
```

- Même Wi-Fi : lien = `http://192.168.1.10:4000`
- Élèves en dehors du Wi-Fi (données mobiles) : exposer l'ordinateur avec un tunnel https
  ```bash
  ngrok http 4000
  # ou : cloudflared tunnel --url http://localhost:4000
  ```
  Le lien affiché (`https://xxxx.ngrok-free.app`) est celui à envoyer. L'ordinateur doit rester allumé avec `node server.js` et le tunnel actifs. Le lien gratuit change à chaque redémarrage du tunnel.

Message type à envoyer sur Facebook :
```
📱 Soutenances EMIT — envoyez votre thème de stage et consultez votre planning :
https://xxxx.ngrok-free.app
(Ouvrez avec Chrome puis menu ⋮ > « Ajouter à l'écran d'accueil »)
```

## 5. (Option) APK Android installable

```bash
npm install -g eas-cli
eas login
# dans MOBILE/app/eas.json, remplacer REMPLACER_PAR_VOTRE_URL par l'adresse publique du serveur
eas build -p android --profile apk
```
EAS donne un lien de téléchargement de l'APK. Autre possibilité : copier l'APK dans `MOBILE/backend/apk/soutenance.apk` et partager `http://IP:4000/apk/soutenance.apk`.
(Android demande d'autoriser l'installation depuis cette source ; sur Facebook, choisir « Ouvrir dans le navigateur » avant de télécharger.)

## API (préfixe `/api/mobile`)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/parcours` | liste des parcours (mentions) |
| GET | `/etudiant/:matricule` | fiche déjà enregistrée (pré-remplissage) |
| POST | `/etudiant` | envoie / met à jour : `matricule, nom, prenom, telephone, date_naissance, lieu_naissance, parcours, theme, description, technologies, lieu_stage` |
| GET | `/planning/:matricule` | soutenance **publiée** par la scolarité (date, heure, salle, évaluateur) |

Règles : la date de naissance (JJ/MM/AAAA) et le lieu de naissance sont obligatoires (ils sont imprimés sur le PV), le téléphone est facultatif ; si le matricule existe déjà (import de la scolarité), le **nom doit correspondre** pour modifier la fiche ; sinon l'étudiant est créé dans le parcours choisi. Le planning n'apparaît qu'après « Publier » dans l'interface web.

Test rapide (PowerShell) :
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/mobile/etudiant -ContentType "application/json" -Body '{"matricule":"1234 IG","nom":"RAKOTO","prenom":"Jean","telephone":"034 12 345 67","date_naissance":"17/05/2001","lieu_naissance":"Fianarantsoa","parcours":"INFO","theme":"Gestion de stock","description":"Application de suivi","technologies":"React, Node.js"}'
Invoke-RestMethod http://localhost:4000/api/mobile/planning/1234%20IG
```
