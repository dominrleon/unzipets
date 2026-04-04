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

echo "Executant seed si cal..."
npm run seed || true

echo "Arrancant app..."
npm run dev