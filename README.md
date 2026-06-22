# PetiPro — Tableau de bord SaaS pour petites entreprises

Gérez vos demandes clients, tâches et performances hebdomadaires avec un tableau de bord simple, design épuré et déployable en une commande.

---

## Stack technique

| Couche | Technologie |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript natif, Chart.js 4, Font Awesome 6 |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, Pydantic |
| **Base de données** | SQLite (fichier unique, zéro configuration) |
| **Authentification** | Token JWT maison (secrets.token_hex) |
| **Serveur frontend** | Nginx (reverse proxy vers l'API) |
| **Conteneurisation** | Docker + Docker Compose |

---

## Démarrage rapide

### Prérequis
- Docker et Docker Compose installés

### Lancer l'application

```bash
git clone https://github.com/dahousse/PetiPro.git
cd PetiPro
docker compose up -d
```

| Service | Accès |
|---|---|
| **Frontend** | http://localhost:80 |
| **API** | http://localhost:8000 |
| **Docs API** | http://localhost:8000/docs (Swagger) |

### Identifiants de démo

| Email | Mot de passe |
|---|---|
| `admin@petipro.fr` | `demo1234` |

---

## Fonctionnalités

- **Connexion sécurisée** — authentification par token
- **Vue d'ensemble** — 4 cartes stats + graphique hebdomadaire + répartition par statut
- **Demandes clients** — CRUD complet avec filtre par statut et recherche
- **Tâches** — ajout rapide, cocher/décocher, suppression
- **Performance** — graphique barres résolues vs nouvelles
- **Tarifs** — 3 plans présentés (Gratuit, Pro 19€, Entreprise 49€)
- **Responsive** — adapté mobile, tablette et desktop

---

## API REST

Tous les endpoints (sauf `/api/auth/login`) nécessitent un header :
```
Authorization: Bearer <token>
```

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Authentification |
| GET | `/api/requests` | Liste des demandes |
| POST | `/api/requests` | Créer une demande |
| DELETE | `/api/requests/{id}` | Supprimer une demande |
| GET | `/api/tasks` | Liste des tâches |
| POST | `/api/tasks` | Créer une tâche |
| PATCH | `/api/tasks/{id}/toggle` | Activer/désactiver une tâche |
| DELETE | `/api/tasks/{id}` | Supprimer une tâche |
| GET | `/api/stats` | Statistiques du tableau de bord |
| GET | `/api/health` | Health check |

---

## Structure du projet

```
PetiPro/
├── backend/
│   ├── app/
│   │   ├── main.py          # App FastAPI, CORS, routes
│   │   ├── database.py      # Connexion SQLite (SQLAlchemy)
│   │   ├── models.py        # Modèles Request / Task
│   │   ├── schemas.py       # Schémas Pydantic
│   │   └── routers/
│   │       ├── auth.py      # POST /api/auth/login
│   │       ├── requests.py  # CRUD demandes
│   │       ├── tasks.py     # CRUD tâches
│   │       └── stats.py     # Statistiques
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html           # SPA complète
│   ├── css/style.css        # Design system (Inter, bleu professionnel)
│   ├── js/app.js            # Logique frontend (appels API)
│   ├── nginx.conf           # Reverse proxy /api/ → backend
│   └── Dockerfile
├── docker-compose.yml       # Orchestration complète
└── README.md
```

---

## Déploiement sur un nouveau serveur

### Option 1 : Docker Compose (recommandé)

```bash
# 1. Cloner
git clone https://github.com/dahousse/PetiPro.git
cd PetiPro

# 2. Lancer
docker compose up -d

# 3. Vérifier
curl http://localhost:80          # → 200 (frontend)
curl http://localhost:8000/api/health  # → {"status":"ok"}
```

### Option 2 : Sans Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Frontend (serveur statique)
cd ../frontend
python3 -m http.server 8080 &

# Ou servir avec nginx manuellement
```

### Variables d'environnement (optionnel)

Le frontend détecte automatiquement l'URL de l'API :
- En local (localhost) → appelle `http://localhost:8000`
- En production (hors localhost) → appelle l'API au même domaine via le reverse proxy Nginx

Aucune configuration supplémentaire nécessaire.

---

## Développement

### Lancer le backend en mode dev

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger UI → http://localhost:8000/docs

### Lancer le frontend en mode dev

```bash
cd frontend
python3 -m http.server 8080
```

Ou utilisez l'extension Live Server de VS Code.

---

## Licence

Projet libre et open source.
