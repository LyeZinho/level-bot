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
    // Ensure badges table exists
    console.log('[migrate] Checking badges table...');
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'badges'
        ) THEN
          CREATE TABLE badges (
            badge_id serial PRIMARY KEY,
            name varchar(100) UNIQUE NOT NULL,
            description text,
            image_path varchar(255),
            badge_type varchar(50) NOT NULL,
            tier integer DEFAULT 1,
            is_active boolean DEFAULT true,
            expires_at bigint,
            created_at bigint DEFAULT (EXTRACT(epoch FROM now()) * 1000)::bigint
          );
          CREATE INDEX idx_badges_badge_type ON badges (badge_type);
          CREATE INDEX idx_badges_tier ON badges (tier);
        END IF;
      END$$;
    `;

    // Convert badges created_at from bigint to timestamp
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'badges' AND column_name = 'created_at'
          AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE badges ALTER COLUMN created_at DROP DEFAULT;
          ALTER TABLE badges
            ALTER COLUMN created_at TYPE timestamptz
            USING to_timestamp(created_at / 1000.0);
          ALTER TABLE badges ALTER COLUMN created_at SET DEFAULT now();
        END IF;
      END$$;
    `;

    // Convert badges expires_at from bigint to timestamp
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'badges' AND column_name = 'expires_at'
          AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE badges ALTER COLUMN expires_at DROP DEFAULT;
          ALTER TABLE badges
            ALTER COLUMN expires_at TYPE timestamptz
            USING CASE WHEN expires_at IS NOT NULL AND expires_at > 0
                       THEN to_timestamp(expires_at / 1000.0)
                       ELSE NULL END;
        END IF;
      END$$;
    `;

    // Ensure items table exists
    console.log('[migrate] Checking items table...');
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'items'
        ) THEN
          CREATE TABLE items (
            item_id serial PRIMARY KEY,
            name text UNIQUE NOT NULL,
            description text,
            price integer NOT NULL,
            emoji text DEFAULT '📦'::text,
            type text DEFAULT 'consumable'::text,
            hidden boolean DEFAULT false,
            created_at bigint DEFAULT (EXTRACT(epoch FROM now()))::bigint
          );
          CREATE INDEX idx_items_type ON items (type);
          CREATE INDEX idx_items_hidden ON items (hidden);
        END IF;
      END$$;
    `;

    // Convert items created_at from bigint to timestamp
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'items' AND column_name = 'created_at'
          AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE items ALTER COLUMN created_at DROP DEFAULT;
          ALTER TABLE items
            ALTER COLUMN created_at TYPE timestamptz
            USING to_timestamp(created_at / 1000.0);
          ALTER TABLE items ALTER COLUMN created_at SET DEFAULT now();
        END IF;
      END$$;
    `;

    // Ensure missions table exists
    console.log('[migrate] Checking missions table...');
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'missions'
        ) THEN
          CREATE TABLE missions (
            mission_id serial PRIMARY KEY,
            name varchar(100) NOT NULL,
            description text,
            mission_type varchar(50) NOT NULL,
            target_value integer NOT NULL,
            reward_badge_id integer,
            reward_coins integer DEFAULT 0,
            is_active boolean DEFAULT true,
            is_repeatable boolean DEFAULT false,
            expires_at bigint,
            created_at bigint DEFAULT (EXTRACT(epoch FROM now()) * 1000)::bigint
          );
          CREATE INDEX idx_missions_mission_type ON missions (mission_type);
        END IF;
      END$$;
    `;

    // Convert missions created_at from bigint to timestamp
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'missions' AND column_name = 'created_at'
          AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE missions ALTER COLUMN created_at DROP DEFAULT;
          ALTER TABLE missions
            ALTER COLUMN created_at TYPE timestamptz
            USING to_timestamp(created_at / 1000.0);
          ALTER TABLE missions ALTER COLUMN created_at SET DEFAULT now();
        END IF;
      END$$;
    `;

    // Convert missions expires_at from bigint to timestamp
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'missions' AND column_name = 'expires_at'
          AND data_type IN ('bigint', 'integer', 'numeric')
        ) THEN
          ALTER TABLE missions ALTER COLUMN expires_at DROP DEFAULT;
          ALTER TABLE missions
            ALTER COLUMN expires_at TYPE timestamptz
            USING CASE WHEN expires_at IS NOT NULL AND expires_at > 0
                       THEN to_timestamp(expires_at / 1000.0)
                       ELSE NULL END;
        END IF;
      END$$;
    `;

    console.log('[migrate] Checking users table...');
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

    console.log('[migrate] Checking user_inventory table...');
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_inventory'
        ) THEN
          CREATE TABLE user_inventory (
            id serial PRIMARY KEY,
            user_id varchar(30) NOT NULL,
            guild_id varchar(30) NOT NULL,
            item_id integer NOT NULL,
            quantity integer DEFAULT 1,
            acquired_at timestamptz DEFAULT now() NOT NULL
          );
          CREATE UNIQUE INDEX unique_user_item ON user_inventory (user_id, guild_id, item_id);
          CREATE INDEX idx_user_inventory_user_id ON user_inventory (user_id);
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
            USING to_timestamp(acquired_at / 1000.0);
          ALTER TABLE user_inventory ALTER COLUMN acquired_at SET DEFAULT now();
        END IF;
      END$$;
    `;

    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_inventory'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_inventory' AND column_name = 'id'
        ) THEN
          ALTER TABLE user_inventory DROP CONSTRAINT IF EXISTS user_inventory_pkey;
          ALTER TABLE user_inventory ADD COLUMN id serial PRIMARY KEY;
          CREATE UNIQUE INDEX IF NOT EXISTS unique_user_item ON user_inventory (user_id, guild_id, item_id);
        END IF;
      END$$;
    `;

    console.log('[migrate] Checking user_badges table...');
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges'
        ) THEN
          CREATE TABLE user_badges (
            id serial PRIMARY KEY,
            user_id varchar(30) NOT NULL,
            guild_id varchar(30) NOT NULL,
            badge_id integer NOT NULL,
            earned_at timestamptz DEFAULT now() NOT NULL,
            expires_at timestamptz
          );
          CREATE UNIQUE INDEX unique_user_badge ON user_badges (user_id, guild_id, badge_id);
          CREATE INDEX idx_user_badges_user_id ON user_badges (user_id);
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
          SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_badges' AND column_name = 'id'
        ) THEN
          ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_pkey;
          ALTER TABLE user_badges ADD COLUMN id serial PRIMARY KEY;
          CREATE UNIQUE INDEX IF NOT EXISTS unique_user_badge ON user_badges (user_id, guild_id, badge_id);
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

