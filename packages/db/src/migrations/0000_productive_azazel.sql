CREATE TYPE "public"."audit_action" AS ENUM('settings.update', 'shop.item.create', 'shop.item.update', 'shop.item.delete', 'badge.create', 'badge.update', 'badge.delete', 'badge.grant', 'badge.revoke', 'vip.grant', 'vip.revoke', 'vip.update', 'event.create', 'event.update', 'event.delete', 'user.ban', 'user.unban', 'user.coins.adjust', 'user.xp.adjust', 'user.role.change', 'admin.login', 'admin.logout');--> statement-breakpoint
CREATE TYPE "public"."badge_tier" AS ENUM('common', 'uncommon', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."badge_type" AS ENUM('mission', 'seasonal', 'special', 'level', 'achievement');--> statement-breakpoint
CREATE TYPE "public"."shop_item_type" AS ENUM('consumable', 'cosmetic', 'mystery_box', 'special', 'role');--> statement-breakpoint
CREATE TYPE "public"."vip_tier_key" AS ENUM('gold', 'platinum', 'ruby');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" "audit_action" NOT NULL,
	"performed_by" varchar(20) NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"target_id" varchar(64),
	"target_label" varchar(256),
	"before" json,
	"after" json,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"image_path" text,
	"badge_type" "badge_type" NOT NULL,
	"tier" "badge_tier",
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"prefix" varchar(10) DEFAULT '!' NOT NULL,
	"xp_per_message_min" integer DEFAULT 15 NOT NULL,
	"xp_per_message_max" integer DEFAULT 25 NOT NULL,
	"xp_cooldown_seconds" integer DEFAULT 60 NOT NULL,
	"xp_per_voice_minute" integer DEFAULT 1 NOT NULL,
	"coins_per_100xp" integer DEFAULT 1 NOT NULL,
	"coins_max_per_message" integer DEFAULT 25 NOT NULL,
	"coins_daily_claim" integer DEFAULT 100 NOT NULL,
	"level_up_channel_id" varchar(20) DEFAULT '' NOT NULL,
	"level_up_dm_enabled" boolean DEFAULT false NOT NULL,
	"recalculation_interval_ms" integer DEFAULT 300000 NOT NULL,
	"min_voice_seconds" integer DEFAULT 60 NOT NULL,
	"allowed_guild_ids" json DEFAULT '[]'::json NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" varchar(20) DEFAULT '' NOT NULL,
	CONSTRAINT "bot_settings_guild_id_unique" UNIQUE("guild_id")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mission_type" varchar(64) NOT NULL,
	"target_value" integer NOT NULL,
	"reward_badge_id" integer,
	"reward_coins" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasonal_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"trigger_chance" real DEFAULT 0.1 NOT NULL,
	"message" text NOT NULL,
	"reaction_emoji" varchar(32) NOT NULL,
	"error_message" text NOT NULL,
	"reaction_timeout" integer DEFAULT 30000 NOT NULL,
	"rewards" json NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"cooldown_per_user" integer DEFAULT 3600000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seasonal_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "shop_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"emoji" varchar(32),
	"type" "shop_item_type" NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"mission_id" integer NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_vip" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"tier_id" integer NOT NULL,
	"tier" varchar(32) NOT NULL,
	"multiplier" real DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" varchar(20) NOT NULL,
	"guild_id" varchar(20) NOT NULL,
	"username" varchar(64),
	"avatar" varchar(128),
	"xp" bigint DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"coins" bigint DEFAULT 0 NOT NULL,
	"messages" bigint DEFAULT 0 NOT NULL,
	"voice_time" bigint DEFAULT 0 NOT NULL,
	"last_daily_claim_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vip_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier_key" "vip_tier_key" NOT NULL,
	"name" varchar(64) NOT NULL,
	"multiplier" real DEFAULT 1 NOT NULL,
	"role_id" varchar(20) DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"duration_days" integer DEFAULT 30 NOT NULL,
	"benefits" json DEFAULT '{}'::json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_logs_performed_by_idx" ON "audit_logs" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_guild_id_idx" ON "audit_logs" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badges_name_idx" ON "badges" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "missions_type_target_idx" ON "missions" USING btree ("mission_type","target_value");--> statement-breakpoint
CREATE INDEX "seasonal_events_active_idx" ON "seasonal_events" USING btree ("active");--> statement-breakpoint
CREATE INDEX "seasonal_events_dates_idx" ON "seasonal_events" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "shop_items_type_idx" ON "shop_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "shop_items_hidden_idx" ON "shop_items" USING btree ("hidden");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_user_guild_badge_idx" ON "user_badges" USING btree ("user_id","guild_id","badge_id");--> statement-breakpoint
CREATE INDEX "user_badges_user_id_idx" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badges_badge_id_idx" ON "user_badges" USING btree ("badge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_inventory_user_guild_item_idx" ON "user_inventory" USING btree ("user_id","guild_id","item_id");--> statement-breakpoint
CREATE INDEX "user_inventory_user_id_idx" ON "user_inventory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_inventory_item_id_idx" ON "user_inventory" USING btree ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_missions_user_guild_mission_idx" ON "user_missions" USING btree ("user_id","guild_id","mission_id");--> statement-breakpoint
CREATE INDEX "user_missions_user_id_idx" ON "user_missions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_missions_mission_id_idx" ON "user_missions" USING btree ("mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_vip_user_guild_idx" ON "user_vip" USING btree ("user_id","guild_id");--> statement-breakpoint
CREATE INDEX "user_vip_user_id_idx" ON "user_vip" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_vip_tier_id_idx" ON "user_vip" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "user_vip_active_idx" ON "user_vip" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "users_discord_guild_idx" ON "users" USING btree ("discord_id","guild_id");--> statement-breakpoint
CREATE INDEX "users_discord_id_idx" ON "users" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_guild_id_idx" ON "users" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "users_level_idx" ON "users" USING btree ("level");--> statement-breakpoint
CREATE INDEX "users_xp_idx" ON "users" USING btree ("xp");--> statement-breakpoint
CREATE UNIQUE INDEX "vip_tiers_tier_key_idx" ON "vip_tiers" USING btree ("tier_key");