import { relations } from "drizzle-orm/relations";
import {
  adminsTable,
  brandNotificationsTable,
  brandsTable,
  bullMetersTable,
  featuredTokensTable,
  notificationSubscriptionsTable,
  tipSettingsTable,
  userTable,
  walletTable,
} from "./db.schema";

export const brandsRelations = relations(brandsTable, ({ many }) => ({
  bullMeters: many(bullMetersTable),
  tips: many(tipSettingsTable),
  featuredTokens: many(featuredTokensTable),
  notificationSubscriptions: many(notificationSubscriptionsTable),
  brandNotifications: many(brandNotificationsTable),
}));

export const bullMetersRelations = relations(bullMetersTable, ({ one }) => ({
  brand: one(brandsTable, {
    fields: [bullMetersTable.brandId],
    references: [brandsTable.id],
  }),
}));

export const tipsRelations = relations(tipSettingsTable, ({ one }) => ({
  brand: one(brandsTable, {
    fields: [tipSettingsTable.brandId],
    references: [brandsTable.id],
  }),
}));

export const featuredTokensRelations = relations(
  featuredTokensTable,
  ({ one }) => ({
    brand: one(brandsTable, {
      fields: [featuredTokensTable.brandId],
      references: [brandsTable.id],
    }),
  }),
);

export const userRelations = relations(userTable, ({ many }) => ({
  wallets: many(walletTable),
  notificationSubscriptions: many(notificationSubscriptionsTable),
}));

export const walletRelations = relations(walletTable, ({ one }) => ({
  user: one(userTable, {
    fields: [walletTable.userId],
    references: [userTable.id],
  }),
}));

export const adminRelations = relations(adminsTable, ({ one }) => ({
  brand: one(brandsTable, {
    fields: [adminsTable.brandId],
    references: [brandsTable.id],
  }),
}));

export const notificationSubscriptionsRelations = relations(
  notificationSubscriptionsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationSubscriptionsTable.userId],
      references: [userTable.id],
    }),
    brand: one(brandsTable, {
      fields: [notificationSubscriptionsTable.brandId],
      references: [brandsTable.id],
    }),
  }),
);

export const brandNotificationsRelations = relations(
  brandNotificationsTable,
  ({ one }) => ({
    brand: one(brandsTable, {
      fields: [brandNotificationsTable.brandId],
      references: [brandsTable.id],
    }),
  }),
);
