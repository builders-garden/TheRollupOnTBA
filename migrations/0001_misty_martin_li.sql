DROP INDEX "idx_bull_meters_brand_id";--> statement-breakpoint
DROP INDEX "user_farcaster_fid_unique";--> statement-breakpoint
DROP INDEX "idx_wallet_user_id";--> statement-breakpoint
ALTER TABLE `brands` ALTER COLUMN "social_media_urls" TO "social_media_urls" text DEFAULT '{"youtube":"","twitch":"","x":""}';--> statement-breakpoint
CREATE INDEX `idx_bull_meters_brand_id` ON `bull_meters` (`brand_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_farcaster_fid_unique` ON `user` (`farcaster_fid`);--> statement-breakpoint
CREATE INDEX `idx_wallet_user_id` ON `wallet` (`user_id`);--> statement-breakpoint
ALTER TABLE `brands` ALTER COLUMN "created_at" TO "created_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `brands` ALTER COLUMN "updated_at" TO "updated_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `brands` ADD `youtube_live_url` text;--> statement-breakpoint
ALTER TABLE `bull_meters` ALTER COLUMN "prompt" TO "prompt" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `bull_meters` ALTER COLUMN "created_at" TO "created_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `bull_meters` ALTER COLUMN "updated_at" TO "updated_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `bull_meters` ADD `poll_id` text DEFAULT '0x' NOT NULL;--> statement-breakpoint
ALTER TABLE `bull_meters` ADD `total_yes_votes` integer;--> statement-breakpoint
ALTER TABLE `bull_meters` ADD `total_no_votes` integer;--> statement-breakpoint
ALTER TABLE `bull_meters` ADD `deadline` integer;--> statement-breakpoint
ALTER TABLE `tips` ALTER COLUMN "created_at" TO "created_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `featured_tokens` ALTER COLUMN "created_at" TO "created_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "created_at" TO "created_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "updated_at" TO "updated_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `wallet` ALTER COLUMN "created_at" TO "created_at" text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `wallet` ALTER COLUMN "updated_at" TO "updated_at" text DEFAULT CURRENT_TIMESTAMP;