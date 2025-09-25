# Connexion PSQL : 

```
psql "postgresql://postgres:postgres@localhost:55432/meetingdb?schema=public"
docker exec -it backend-postgres-1 psql -U postgres -d meetingdb
```

# Exemple de requetes SQL : 

```
SELECT id, name, capacity FROM "Room" ORDER BY name ASC LIMIT 10;

SELECT * FROM "Reservation" LIMIT 10;

SELECT r.id, r.title, r."startsAt", r."endsAt"
FROM "Reservation" r
WHERE r."roomId" = 'cmfwqnyjq0003vopvojxku5vf'
ORDER BY r."startsAt" DESC;

SELECT rm.name, COUNT(*) AS nb
FROM "Reservation" r
JOIN "Room" rm ON rm.id = r."roomId"
GROUP BY rm.name
ORDER BY nb DESC
LIMIT 5;

SELECT id, title,
  EXTRACT(EPOCH FROM ("endsAt" - "startsAt"))/60 AS minutes
FROM "Reservation"
ORDER BY "startsAt" DESC
LIMIT 20;
```

# Lancer le turborepo :

```
npm run dev

Api uniquement : 
npm run -w @acme/api dev

App uniquement :
npm run -w @acme/web dev

Purger le cache : 
npx turbo prune --scope=@acme/api
```

# Commandes docker : 

```
docker compose up -d

docker compose down
docker compose down -v
```

# Prisma : 

```
npm run -w @acme/api prisma:generate

npm run -w @acme/api prisma:migrate

npm run -w @acme/api prisma:seed
```

# Tests : 

```
Api : 

npm run -w @acme/api test

npm run -w @acme/api test:cov

npm run -w @acme/api test:e2e
```

```
App:

npm run -w @acme/web test

npm run -w @acme/web test -- --coverage

npm run -w @acme/web test -- --run --reporter=verbose
```

# Linter et Prettier : 

```
web ou api 

npm run -w @acme/web lint
npm run -w @acme/web lint:fix

npm run -w @acme/web format
npm run -w @acme/web format:fix
```



