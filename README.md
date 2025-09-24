Skezi Tech Test — Monorepo (Turborepo)

Prérequis

Node.js 20+ (ou 22)

npm 10+

PostgreSQL qui tourne via Docker (donc docker)

1) Cloner & installer
git clone git@github.com:Dreaxxx/skezi-technical-test.git
cd skezi-technical-test

# Installe toutes les dépendances des apps & packages
npm install (à la racine, sa lancera dans les 2 apps)

2) Configurer les variables d’environnement
API (Nest + Prisma)

Fichier apps/api/.env :

# Exemple : adapte l’URL à la stack (port/identifiants/Bdd)
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/meetingdb?schema=public
PORT=3001

⚠️ Mets une vraie URL Postgres valide (login/mdp/port corrects).
Si tu utilises Docker, assure-toi que le conteneur expose le bon port en local.

Front (Next)

Fichier apps/web/.env.local :

NEXT_PUBLIC_API_BASE=http://localhost:3001

3) Démarrer Postgres via Docker Compose (option recommandé)

docker compose up -d
# Vérifier l’état
docker compose ps

Connexions

Postgres : postgresql://postgres:postgres@localhost:55432/meetingdb

pgAdmin : http://localhost:5050
 (login admin@local / admin)

Ajouter un serveur :

Host: db (ou localhost si tu préfères)

Port: 5432 (ou 55432 si tu cibles l’hôte)

User: postgres / Password: postgres

4) Générer Prisma (API)
cd apps/api
npm run prisma:generate
# (optionnel, si dev DB vierge)
npm run prisma:migrate
# (optionnel)
npm run prisma:seed
cd ../..

5) Lancer en dev
Tout le monorepo (front + back)
npm run dev
# => turbo run dev --parallel

Uniquement l’API
npm run dev -- --filter=./apps/api
# API: http://localhost:3001 (selon ton .env)

Uniquement le Front
npm run dev -- --filter=./apps/web
# Web: http://localhost:3000

6) Tests (côté API)

Depuis apps/api :

npm test           # unit
npm run test:e2e   # e2e (nécessite DB de test et .env.test)
DATABASE_URL="file:./test.db"

Dépannage rapide

Prisma : P1000 / auth failed
Vérifie DATABASE_URL et que Postgres accepte bien la connexion (user/mdp/port).
Relancer une migration/génération si besoin :

cd apps/api
npm run prisma:generate
npm run prisma:migrate