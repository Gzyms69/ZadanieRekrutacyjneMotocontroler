import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  console.error('❌ Nieprawidłowe zmienne środowiskowe:', result.error.format());
  throw new Error('Nieprawidłowa konfiguracja środowiska.');
}

export const env = result.data;
