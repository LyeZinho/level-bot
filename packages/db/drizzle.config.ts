import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/*.ts',
  out: './src/migrations',
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
