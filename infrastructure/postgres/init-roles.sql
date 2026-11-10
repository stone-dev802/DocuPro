-- Initialisation des rôles de base de données pour DocuPro

-- 1. Rôle Migrator : propriétaire des tables, utilisé par Prisma Migrate
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'docupro_migrator') THEN
      CREATE ROLE docupro_migrator WITH LOGIN PASSWORD 'migrator_dev_password';
   END IF;
END
$do$;

-- 2. Rôle Applicatif : utilisé par l'API NestJS en exécution courante
-- STRICTEMENT SANS BYPASSRLS ET NON SUPERUSER
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'docupro_app') THEN
      CREATE ROLE docupro_app WITH LOGIN PASSWORD 'app_dev_password' NOBYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE;
   END IF;
END
$do$;

-- 3. Accès au schéma public
GRANT ALL ON SCHEMA public TO docupro_migrator;
GRANT USAGE ON SCHEMA public TO docupro_app;

-- Droits par défaut pour les futures tables créées par docupro_migrator
ALTER DEFAULT PRIVILEGES FOR ROLE docupro_migrator IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO docupro_app;
ALTER DEFAULT PRIVILEGES FOR ROLE docupro_migrator IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO docupro_app;
