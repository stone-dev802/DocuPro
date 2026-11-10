import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requise pour le rôle applicatif docupro_app'),
  MIGRATION_DATABASE_URL: z.string().optional(),

  REDIS_CACHE_URL: z.string().default('redis://localhost:6379/0'),
  REDIS_BULLMQ_URL: z.string().default('redis://localhost:6380/0'),

  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_PORT: z.coerce.number().default(9000),
  S3_USE_SSL: z.coerce.boolean().default(false),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadmin'),
  S3_BUCKET_NAME: z.string().default('docupro-storage'),
  S3_REGION: z.string().default('us-east-1'),

  // Driver antivirus obligatoire : 'clamav' ou 'mock'
  ANTIVIRUS_DRIVER: z.enum(['clamav', 'mock']).default('mock'),
  CLAMAV_HOST: z.string().default('localhost'),
  CLAMAV_PORT: z.coerce.number().default(3310),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET doit comporter au moins 32 caractères'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET doit comporter au moins 32 caractères'),
  MFA_ENCRYPTION_KEY: z.string().length(64, 'MFA_ENCRYPTION_KEY doit être une clé hexadécimale de 32 octets (64 caractères hex)'),
}).superRefine((data, ctx) => {
  // RÈGLE STRICTE : Interdiction absolue du mock antivirus en environnement de production
  if (data.NODE_ENV === 'production' && data.ANTIVIRUS_DRIVER === 'mock') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ANTIVIRUS_DRIVER'],
      message: 'Le driver ANTIVIRUS_DRIVER=mock est formellement interdit en environnement de production.',
    });
  }
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.errors.map(e => `[${e.path.join('.')}] ${e.message}`).join('\n');
    throw new Error(`\n❌ Échec de validation de la configuration d'environnement DocuPro :\n${errors}\n`);
  }
  return result.data;
}
