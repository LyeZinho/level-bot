import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'levelbot',
    password: process.env.DB_PASSWORD || 'levelbot123',
    database: process.env.DB_NAME || 'levelbot',
  },
});
