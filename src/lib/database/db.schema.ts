import { MiniAppNotificationDetails } from "@farcaster/miniapp-core";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { Address } from "viem";

/**
 * Farcaster User table
 */
export const userTable = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  avatarUrl: text("avatar_url"),
  username: text("username"),
  // Farcaster
  farcasterFid: integer("farcaster_fid").unique(),
  farcasterUsername: text("farcaster_username"),
  farcasterDisplayName: text("farcaster_display_name"),
  farcasterAvatarUrl: text("farcaster_avatar_url"),
  farcasterNotificationDetails: text("farcaster_notification_details", {
    mode: "json",
  }).$type<MiniAppNotificationDetails | null>(),
  farcasterWallets: text("farcaster_wallets", { mode: "json" }).$type<
    Address[]
  >(),
  farcasterReferrerFid: integer("farcaster_referrer_fid"),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type User = typeof userTable.$inferSelect;
export type CreateFarcasterUser = typeof userTable.$inferInsert;
export type UpdateFarcasterUser = Partial<CreateFarcasterUser>;

export const walletTable = sqliteTable(
  "wallet",
  {
    address: text("address", { mode: "json" }).$type<Address>().primaryKey(),
    ensName: text("ens_name"),
    baseName: text("base_name"),
    ensAvatarUrl: text("ens_avatar_url"),
    baseAvatarUrl: text("base_avatar_url"),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_wallet_user_id").on(t.userId)],
);

export type Wallet = typeof walletTable.$inferSelect;
export type CreateWallet = typeof walletTable.$inferInsert;
export type UpdateWallet = Partial<CreateWallet>;
