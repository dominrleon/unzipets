#!/bin/sh
set -e

echo "Esperant PostgreSQL..."

until nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL disponible"

echo "Prisma generate..."
npx prisma generate

echo "Prisma db push..."
npx prisma db push

if [ "$RUN_SEED" = "true" ]; then
  echo "Executant seed..."
  npm run seed || true
else
  echo "Seed desactivat"
fi

echo "Arrancant app..."
npm run dev