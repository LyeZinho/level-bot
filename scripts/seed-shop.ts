import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/database/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const shopItems = [
  {
    name: 'Poção de XP +50',
    description: 'Ganhe 50 XP extras',
    price: 100,
    emoji: '🧪',
    type: 'consumable',
  },
  {
    name: 'Poção de XP +100',
    description: 'Ganhe 100 XP extras',
    price: 200,
    emoji: '🧪',
    type: 'consumable',
  },
  {
    name: 'Multiplicador 2x por 1 hora',
    description: 'Dobre seu XP por 1 hora',
    price: 500,
    emoji: '⚡',
    type: 'boost',
  },
  {
    name: 'Multiplicador 3x por 30 minutos',
    description: 'Triplique seu XP por 30 minutos',
    price: 750,
    emoji: '⚡',
    type: 'boost',
  },
  {
    name: 'Caixa Misteriosa',
    description: 'Contém um item aleatório',
    price: 300,
    emoji: '📦',
    type: 'mystery',
  },
  {
    name: 'Badge Especial',
    description: 'Uma badge rara para seu perfil',
    price: 1000,
    emoji: '🏅',
    type: 'cosmetic',
  },
  {
    name: 'Reputação +100',
    description: 'Aumente sua reputação no servidor',
    price: 600,
    emoji: '⭐',
    type: 'special',
  },
  {
    name: 'Título Especial',
    description: 'Um título personalizado para seu perfil',
    price: 2000,
    emoji: '👑',
    type: 'cosmetic',
  },
];

async function seedShop() {
  const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });

  try {
    console.log('🌱 Starting shop seed...\n');

    for (const item of shopItems) {
      const existing = await db
        .select()
        .from(schema.items)
        .where(eq(schema.items.name, item.name))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Skipping ${item.name} (already exists)`);
        continue;
      }

      await db.insert(schema.items).values(item);
      console.log(`✅ Created item: ${item.name}`);
    }

    console.log('\n✅ Shop seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding shop:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedShop();
