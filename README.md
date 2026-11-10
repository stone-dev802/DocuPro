# DocuPro — Plateforme SaaS de Gestion Documentaire & d'Archivage (V1)

## 1. Description du Projet
DocuPro est une solution SaaS multi-entreprises permettant la gestion sécurisée de documents numériques, organisés par dossiers, avec cloisonnement strict via PostgreSQL Row-Level Security (RLS), analyse antivirus en quarantaine et audit complet.

## 2. Structure du Monorepo
* `apps/api` : Backend modulaire NestJS (API REST, contextes d'entreprise `X-Tenant-Id`, sécurité).
* `apps/web` : Frontend React 18 + Vite + TypeScript + Tailwind CSS.
* `apps/worker` : Worker d'arrière-plan BullMQ pour les tâches asynchrones isolées (quarantaine, antivirus, aperçus).
* `packages/contracts` : Contrats, DTOs (Zod) et énumérations partagées.
* `packages/config` : Configurations TypeScript, linting et formatage communes.
* `infrastructure/` : Configuration Docker Compose pour PostgreSQL 16, Redis Cache, Redis BullMQ, MinIO et ClamAV.

## 3. Prérequis
* Node.js `22.x LTS`
* `pnpm` `10.x`
* Docker & Docker Compose

## 4. Démarrage de l'infrastructure locale
```bash
# Démarrer les services d'infrastructure (Postgres, 2 Redis, MinIO)
pnpm infra:up

# Pour démarrer avec ClamAV activé (profil antivirus) :
docker compose -f infrastructure/docker-compose.yml --profile antivirus up -d
```

## 5. Installation des dépendances et Compilation
```bash
# Copier l'environnement
cp .env.example .env

# Installer les dépendances
pnpm install

# Compiler l'ensemble des modules
pnpm build
```
