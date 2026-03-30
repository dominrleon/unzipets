# UNZIPETS Web Base

Base inicial del projecte per gestionar:

- landing pública
- experiència QR amb arbre de decisions
- finals amb vídeo
- zona admin
- PostgreSQL + Prisma
- Docker per desenvolupament i desplegament

## Stack

- Next.js 15 + TypeScript
- PostgreSQL
- Prisma
- Docker / Docker Compose
- Cloudflare Stream (integració pendent de completar)

## Estructura inicial

- `app/`: rutes públiques, admin i API
- `prisma/`: esquema i seed
- `lib/`: helpers i prisma client
- `components/`: components UI reutilitzables

## Arrancar en local amb Docker

1. Copia `.env.example` a `.env`
2. Executa:

```bash
docker compose up --build
```

3. Obri:

- landing: `http://localhost:3000`
- cas demo: `http://localhost:3000/case/flash`
- admin: `http://localhost:3000/admin`
- health: `http://localhost:3000/api/health`

## Base de dades

L'arrancada del contenidor web fa automàticament:

```bash
npx prisma db push
```

Si vols sembrar dades de demo:

```bash
docker compose exec web npm run db:seed
```

## Credencials inicials

Ara mateix l'admin és només una pantalla base. La part d'autenticació real la muntarem després.

## Properes passes recomanades

1. Tancar autenticació d'admin
2. CRUD de plush / case / questions / answers / finals
3. Generació real de QR per plush
4. Integració amb Cloudflare Stream
5. sistema multiidioma preparat
