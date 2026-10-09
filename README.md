# FST Notes

Application mobile de consultation des notes (React Native 0.88, Android) et son API (Node.js / Express).

> ⚠️ **Application volontairement vulnérable**, fournie pour le mini-projet « Audit et remédiation d'une application mobile ».
> Ne la déployez jamais sur un réseau ouvert et n'y saisissez aucune donnée réelle.
> Les techniques offensives ne s'appliquent qu'à cette application (voir la charte éthique de l'énoncé).

```
app/       Application React Native (Android)
backend/   API Express (port 3000)
```

## 1. Lancer l'API

Prérequis : Node.js 22. Le fichier `backend/.env` est fourni dans l'archive.

```bash
cd backend
npm install
npm start
```

Ou avec Docker : `docker compose up --build`

Vérification : ouvrir http://localhost:3000/health

## 2. Installer l'application

Avec l'APK fourni par l'enseignant :

```bash
adb install fst-notes.apk
```

Ou en le compilant (Android Studio + JDK 17) :

```bash
cd app
npm install
cd android
./gradlew assembleRelease
# APK : app/android/app/build/outputs/apk/release/app-release.apk
```

Le workflow GitHub Actions *Build APK* produit aussi l'APK si le dépôt est sur GitHub.

## 3. Se connecter

Le champ **Serveur** vaut `http://10.0.2.2:3000` (la machine hôte vue depuis l'émulateur). Sur un téléphone physique, remplacez par l'IP de votre machine, par exemple `http://192.168.1.20:3000`.

| E-mail | Mot de passe |
|---|---|
| yassine.idrissi@etu.fstt.lab | Etudiant1! |
| imane.tazi@etu.fstt.lab | Etudiant2! |
| omar.chraibi@etu.fstt.lab | Etudiant3! |

Les données sont fictives et réinitialisées à chaque redémarrage de l'API.
