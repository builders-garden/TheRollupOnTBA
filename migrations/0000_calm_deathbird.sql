-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`logo_url` text,
	`description` text,
	`website_url` text,
	`active_plugins` text,
	`social_media_urls` text,
	`wallet_addresses` text NOT NULL,
	`is_active` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `bull_meters` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`prompt` text,
	`vote_price` numeric,
	`duration` integer,
	`payout_addresses` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_bull_meters_brand_id` ON `bull_meters` (`brand_id`);--> statement-breakpoint
CREATE TABLE `tips` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`payout_address` text,
	`payout_base_name` text,
	`payout_ens_name` text,
	`amounts` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `featured_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text,
	`symbol` text,
	`decimals` integer,
	`chain_id` integer,
	`chain_logo_url` text,
	`address` text,
	`logo_url` text,
	`description` text,
	`external_url` text,
	`is_active` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`avatar_url` text,
	`username` text,
	`farcaster_fid` integer,
	`farcaster_username` text,
	`farcaster_display_name` text,
	`farcaster_avatar_url` text,
	`farcaster_notification_details` text,
	`farcaster_wallets` text,
	`farcaster_referrer_fid` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_farcaster_fid_unique` ON `user` (`farcaster_fid`);--> statement-breakpoint
CREATE TABLE `wallet` (
	`address` text PRIMARY KEY NOT NULL,
	`ens_name` text,
	`base_name` text,
	`ens_avatar_url` text,
	`base_avatar_url` text,
	`user_id` text NOT NULL,
	`is_primary` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_wallet_user_id` ON `wallet` (`user_id`);
*/