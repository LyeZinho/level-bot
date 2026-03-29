import postgres from 'postgres';

async function migrate() {
  const sql = postgres({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'levelbot',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'levelbot',
  });

  try {
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'last_daily_claim'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'last_daily_claim_at'
        ) THEN
          ALTER TABLE users ADD COLUMN last_daily_claim_at timestamptz;
          UPDATE users
            SET last_daily_claim_at = to_timestamp(last_daily_claim / 1000.0)
            WHERE last_daily_claim IS NOT NULL AND last_daily_claim > 0;
          ALTER TABLE users DROP COLUMN last_daily_claim;
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_inventory' AND column_name = 'id'
        ) THEN
          ALTER TABLE user_inventory DROP CONSTRAINT IF EXISTS user_inventory_pkey;
          ALTER TABLE user_inventory ADD COLUMN id serial;
          ALTER TABLE user_inventory ADD PRIMARY KEY (id);
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_inventory'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_inventory'
            AND column_name = 'acquired_at'
            AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE user_inventory ALTER COLUMN acquired_at DROP DEFAULT;
          ALTER TABLE user_inventory
            ALTER COLUMN acquired_at TYPE timestamptz
            USING to_timestamp(acquired_at);
          ALTER TABLE user_inventory ALTER COLUMN acquired_at SET DEFAULT now();
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_badges'
            AND column_name = 'earned_at'
            AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE user_badges ALTER COLUMN earned_at DROP DEFAULT;
          ALTER TABLE user_badges
            ALTER COLUMN earned_at TYPE timestamptz
            USING to_timestamp(earned_at / 1000.0);
          ALTER TABLE user_badges ALTER COLUMN earned_at SET DEFAULT now();
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_badges'
            AND column_name = 'expires_at'
            AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE user_badges ALTER COLUMN expires_at DROP DEFAULT;
          ALTER TABLE user_badges
            ALTER COLUMN expires_at TYPE timestamptz
            USING CASE WHEN expires_at IS NOT NULL AND expires_at > 0
                       THEN to_timestamp(expires_at / 1000.0)
                       ELSE NULL END;
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_inventory'
        ) THEN
          CREATE UNIQUE INDEX IF NOT EXISTS unique_user_item
            ON user_inventory (user_id, guild_id, item_id);
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges'
        ) THEN
          CREATE UNIQUE INDEX IF NOT EXISTS unique_user_badge
            ON user_badges (user_id, guild_id, badge_id);
        END IF;
      END$$;
    `;

    console.log('[migrate] Done.');
  } catch (err) {
    console.error('[migrate] Failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();

