# MoviieBooker 🎬

**MoviieBooker** est une application web Fullstack moderne et sécurisée permettant de consulter un catalogue de films synchronisé avec l'API TMDB (The Movie Database) et de réserver des séances de cinéma.

Ce projet met en avant des pratiques d'ingénierie logicielle professionnelles :
* 🔒 **Sécurité renforcée** : Pas de secrets ou d'identifiants de base de données codés en dur. Gestion stricte via variables d'environnement.
* 📦 **Architecture modulaire** : Backend NestJS structuré en modules découplés (Auth, Movies, Reservations).
* 🎨 **Interface moderne** : Interface utilisateur sous React (Vite + TS) conçue avec un design sombre premium, des effets de flou (glassmorphism) et une expérience utilisateur soignée.
* ⚙️ **Qualité de code** : Historique Git propre et conventionnel (Conventional Commits), couverture de tests unitaires et E2E complète, et formatage standardisé.

---

## 🛠️ Stack Technique

### Backend (API REST)
* **Framework** : [NestJS](https://nestjs.com/) (TypeScript)
* **ORMs & Base de données** : [TypeORM](https://typeorm.io/) avec [PostgreSQL](https://www.postgresql.org/)
* **Sécurité & Auth** : Hachage de mots de passe via [bcrypt](https://github.com/kelektiv/node.bcrypt.js) et Tokens [JSON Web Tokens (JWT)](https://jwt.io/)
* **Validation & DTOs** : `class-validator` et `class-transformer`
* **Documentation** : [Swagger](https://swagger.io/) (`@nestjs/swagger`)

### Frontend (SPA)
* **Framework** : [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Scaffolding via [Vite](https://vite.dev/))
* **Design & Icons** : Lucide React & Design System personnalisé basé sur le Glassmorphic Dark Mode.

---

## 📂 Structure du Projet

```text
MoviieBooker/
├── src/                      # API NestJS
│   ├── auth/                 # Module d'authentification (Inscription, Login, Guards)
│   ├── movies/               # Module catalogue de films (intégration TMDB API)
│   ├── reservation/          # Module de réservations (logique métier & TypeORM entités)
│   ├── app.module.ts         # Module principal NestJS (configuration DB asynchrone)
│   └── main.ts               # Point d'entrée de l'API (CORS activé & Swagger setup)
├── front/                    # Application React (Vite)
│   ├── src/
│   │   ├── App.tsx           # Dashboard de l'application & gestion d'état
│   │   ├── index.css         # Design system & Glassmorphic CSS tokens
│   │   └── main.tsx          # Point d'entrée React
│   └── index.html            # Fichier d'index configuré pour l'accessibilité & le SEO
├── test/                     # Tests d'intégration et E2E (NestJS)
├── .env.example              # Template des variables d'environnement indispensables
└── README.md                 # Cette documentation
```

---

## ⚙️ Installation et Configuration

### 1. Variables d'Environnement

Dupliquez le fichier template `.env.example` à la racine du projet et nommez-le `.env` :
```bash
cp .env.example .env
```

Renseignez les variables correspondantes :
```env
# Connexion PostgreSQL (Render, Docker, ou Local)
DB_HOST=dpg-cvrtfvjuibrs73bqq8v0-a.frankfurt-postgres.render.com
DB_PORT=5432
DB_USERNAME=exercice_nest_user
DB_PASSWORD=votre_mot_de_passe_ici
DB_DATABASE=exercice_nest
DB_SSL=true

# Clé de signature JWT
JWT_SECRET=generer_une_cle_securisee_ici

# TMDB API (Accès au catalogue de films)
TMDB_API_KEY=votre_cle_api_tmdb
TMDB_ACCESS_TOKEN=votre_token_d_acces_tmdb
TMDB_API_URL=https://api.themoviedb.org/3
```

---

### 2. Démarrage du Backend (NestJS)

1. Installez les dépendances à la racine du projet :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run start:dev
   ```
   L'API sera disponible sur : **`http://localhost:3000`**

3. Accédez à la documentation interactive Swagger :
   Ouvrez **`http://localhost:3000/api`** dans votre navigateur pour tester et interagir avec les endpoints de l'API.

---

### 3. Démarrage du Frontend (React + Vite)

1. Rendez-vous dans le dossier `front` :
   ```bash
   cd front
   ```

2. Installez les dépendances du frontend :
   ```bash
   npm install
   ```

3. Démarrez le serveur de développement local :
   ```bash
   npm run dev
   ```
   L'interface web s'ouvrira sur : **`http://localhost:5173`**

---

## 🧪 Tests

Le projet dispose d'une couverture complète de tests unitaires et de tests d'intégration E2E pour valider la robustesse de l'API :

### Tests Unitaires
Pour exécuter les suites de tests unitaires de NestJS (avec des mocks complets des connexions DB et de la configuration) :
```bash
npm run test
```

### Tests E2E (End-to-End)
Pour exécuter les tests d'intégration NestJS qui valident les requêtes HTTP et le cycle de vie de l'application :
```bash
npm run test:e2e
```

---

## 🌟 Fonctionnalités Implémentées

1. **Authentification Utilisateur** :
   * Création de compte sécurisée avec hachage de mot de passe (`bcrypt`).
   * Authentification JWT avec persistance du token et des détails utilisateurs locaux.
   * Routes sécurisées via un Guard JWT global synchronisé via `ConfigService`.

2. **Catalogue de Films** :
   * Recherche de films par mot-clé en temps réel.
   * Filtres et tris de films (par popularité, note moyenne, date de sortie).
   * Affichage des affiches officielles de films TMDB (avec fallback SVG élégant si indisponible).

3. **Système de Réservations** :
   * Sélection d'un film et choix de l'horaire de la séance.
   * Validation métier : les séances doivent être réservées **au moins 2 heures à l'avance**.
   * Récupération automatique de la liste enrichie des réservations de l'utilisateur connecté (titres de films et affiches).
   * Option d'annulation instantanée des séances réservées.
