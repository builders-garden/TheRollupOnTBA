import { relations } from "drizzle-orm/relations";
import { brands, bullMeters, tips, featuredTokens, user, wallet } from "./schema";

export const bullMetersRelations = relations(bullMeters, ({one}) => ({
	brand: one(brands, {
		fields: [bullMeters.brandId],
		references: [brands.id]
	}),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	bullMeters: many(bullMeters),
	tips: many(tips),
	featuredTokens: many(featuredTokens),
}));

export const tipsRelations = relations(tips, ({one}) => ({
	brand: one(brands, {
		fields: [tips.brandId],
		references: [brands.id]
	}),
}));

export const featuredTokensRelations = relations(featuredTokens, ({one}) => ({
	brand: one(brands, {
		fields: [featuredTokens.brandId],
		references: [brands.id]
	}),
}));

export const walletRelations = relations(wallet, ({one}) => ({
	user: one(user, {
		fields: [wallet.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	wallets: many(wallet),
}));