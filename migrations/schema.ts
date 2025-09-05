import { sqliteTable, AnySQLiteColumn, text, integer, index, foreignKey, numeric, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const brands = sqliteTable("brands", {
	id: text().primaryKey().notNull(),
	name: text(),
	logoUrl: text("logo_url"),
	description: text(),
	websiteUrl: text("website_url"),
	activePlugins: text("active_plugins"),
	socialMediaUrls: text("social_media_urls"),
	walletAddresses: text("wallet_addresses").notNull(),
	isActive: integer("is_active").default(false),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
});

export const bullMeters = sqliteTable("bull_meters", {
	id: text().primaryKey().notNull(),
	brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" } ),
	prompt: text(),
	votePrice: numeric("vote_price"),
	duration: integer(),
	payoutAddresses: text("payout_addresses"),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
},
(table) => [
	index("idx_bull_meters_brand_id").on(table.brandId),
]);

export const tips = sqliteTable("tips", {
	id: text().primaryKey().notNull(),
	brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" } ),
	payoutAddress: text("payout_address"),
	payoutBaseName: text("payout_base_name"),
	payoutEnsName: text("payout_ens_name"),
	amounts: text(),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
});

export const featuredTokens = sqliteTable("featured_tokens", {
	id: text().primaryKey().notNull(),
	brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" } ),
	name: text(),
	symbol: text(),
	decimals: integer(),
	chainId: integer("chain_id"),
	chainLogoUrl: text("chain_logo_url"),
	address: text(),
	logoUrl: text("logo_url"),
	description: text(),
	externalUrl: text("external_url"),
	isActive: integer("is_active").default(false),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
});

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	avatarUrl: text("avatar_url"),
	username: text(),
	farcasterFid: integer("farcaster_fid"),
	farcasterUsername: text("farcaster_username"),
	farcasterDisplayName: text("farcaster_display_name"),
	farcasterAvatarUrl: text("farcaster_avatar_url"),
	farcasterNotificationDetails: text("farcaster_notification_details"),
	farcasterWallets: text("farcaster_wallets"),
	farcasterReferrerFid: integer("farcaster_referrer_fid"),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
},
(table) => [
	uniqueIndex("user_farcaster_fid_unique").on(table.farcasterFid),
]);

export const wallet = sqliteTable("wallet", {
	address: text().primaryKey().notNull(),
	ensName: text("ens_name"),
	baseName: text("base_name"),
	ensAvatarUrl: text("ens_avatar_url"),
	baseAvatarUrl: text("base_avatar_url"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	isPrimary: integer("is_primary").default(false),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
},
(table) => [
	index("idx_wallet_user_id").on(table.userId),
]);

