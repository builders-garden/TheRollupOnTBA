import { and, desc, eq, like } from "drizzle-orm";
import { db } from "@/lib/database";
import {
  brandsTable,
  featuredTokensTable,
  type CreateFeaturedToken,
  type FeaturedToken,
  type UpdateFeaturedToken,
} from "@/lib/database/db.schema";

/**
 * Create a new featured token
 * @param tokenData - The token data to create
 * @returns The created token
 */
export const createFeaturedToken = async (
  tokenData: CreateFeaturedToken,
): Promise<FeaturedToken> => {
  const [newToken] = await db
    .insert(featuredTokensTable)
    .values(tokenData)
    .returning();

  return newToken;
};

/**
 * Get a featured token by ID
 * @param tokenId - The token ID
 * @returns The token or null if not found
 */
export const getFeaturedTokenById = async (
  tokenId: string,
): Promise<FeaturedToken | null> => {
  const token = await db
    .select()
    .from(featuredTokensTable)
    .where(eq(featuredTokensTable.id, tokenId))
    .limit(1);

  return token[0] || null;
};

/**
 * Get all featured tokens for a brand
 * @param brandId - The brand ID
 * @param activeOnly - Whether to get only active tokens
 * @returns Array of featured tokens for the brand
 */
export const getFeaturedTokensByBrand = async (
  brandId: string,
  activeOnly = false,
): Promise<FeaturedToken[]> => {
  const conditions = [eq(featuredTokensTable.brandId, brandId)];

  if (activeOnly) {
    conditions.push(eq(featuredTokensTable.isActive, true));
  }

  return await db
    .select()
    .from(featuredTokensTable)
    .where(and(...conditions))
    .orderBy(desc(featuredTokensTable.createdAt));
};

/**
 * Get all active featured tokens
 * @returns Array of active featured tokens
 */
export const getActiveFeaturedTokens = async (): Promise<FeaturedToken[]> => {
  return await db
    .select()
    .from(featuredTokensTable)
    .where(eq(featuredTokensTable.isActive, true))
    .orderBy(desc(featuredTokensTable.createdAt));
};

/**
 * Get all featured tokens with brand information
 * @param activeOnly - Whether to get only active tokens
 * @param limit - Optional limit for results
 * @returns Array of featured tokens with brand data
 */
export const getAllFeaturedTokensWithBrand = async (
  activeOnly = false,
  limit?: number,
) => {
  const conditions = [];

  if (activeOnly) {
    conditions.push(eq(featuredTokensTable.isActive, true));
  }

  const baseQuery = db
    .select({
      token: featuredTokensTable,
      brand: brandsTable,
    })
    .from(featuredTokensTable)
    .innerJoin(brandsTable, eq(featuredTokensTable.brandId, brandsTable.id))
    .orderBy(desc(featuredTokensTable.createdAt));

  const queryWithConditions =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  return limit
    ? await queryWithConditions.limit(limit)
    : await queryWithConditions;
};

/**
 * Get featured tokens by chain ID
 * @param chainId - The chain ID
 * @param activeOnly - Whether to get only active tokens
 * @returns Array of featured tokens on the specified chain
 */
export const getFeaturedTokensByChain = async (
  chainId: number,
  activeOnly = false,
): Promise<FeaturedToken[]> => {
  const conditions = [eq(featuredTokensTable.chainId, chainId)];

  if (activeOnly) {
    conditions.push(eq(featuredTokensTable.isActive, true));
  }

  return await db
    .select()
    .from(featuredTokensTable)
    .where(and(...conditions))
    .orderBy(desc(featuredTokensTable.createdAt));
};

/**
 * Search featured tokens by name or symbol
 * @param searchTerm - The search term
 * @param activeOnly - Whether to search only active tokens
 * @returns Array of matching featured tokens
 */
export const searchFeaturedTokens = async (
  searchTerm: string,
  activeOnly = false,
): Promise<FeaturedToken[]> => {
  const conditions = [
    like(featuredTokensTable.name, `%${searchTerm}%`),
    like(featuredTokensTable.symbol, `%${searchTerm}%`),
  ];

  if (activeOnly) {
    conditions.push(eq(featuredTokensTable.isActive, true));
  }

  return await db
    .select()
    .from(featuredTokensTable)
    .where(and(...conditions))
    .orderBy(desc(featuredTokensTable.createdAt));
};

/**
 * Get featured token by contract address
 * @param address - The contract address
 * @param chainId - Optional chain ID to filter by
 * @returns The token or null if not found
 */
export const getFeaturedTokenByAddress = async (
  address: string,
  chainId?: number,
): Promise<FeaturedToken | null> => {
  const conditions = [eq(featuredTokensTable.address, address)];

  if (chainId) {
    conditions.push(eq(featuredTokensTable.chainId, chainId));
  }

  const token = await db
    .select()
    .from(featuredTokensTable)
    .where(and(...conditions))
    .limit(1);

  return token[0] || null;
};

/**
 * Update a featured token
 * @param tokenId - The token ID
 * @param updateData - The data to update
 * @returns The updated token or null if not found
 */
export const updateFeaturedToken = async (
  tokenId: string,
  updateData: UpdateFeaturedToken,
): Promise<FeaturedToken | null> => {
  const [updatedToken] = await db
    .update(featuredTokensTable)
    .set(updateData)
    .where(eq(featuredTokensTable.id, tokenId))
    .returning();

  return updatedToken || null;
};

/**
 * Toggle featured token active status
 * @param tokenId - The token ID
 * @returns The updated token or null if not found
 */
export const toggleFeaturedTokenActiveStatus = async (
  tokenId: string,
): Promise<FeaturedToken | null> => {
  const token = await getFeaturedTokenById(tokenId);
  if (!token) return null;

  return await updateFeaturedToken(tokenId, { isActive: !token.isActive });
};

/**
 * Delete a featured token
 * @param tokenId - The token ID
 * @returns Whether the token was deleted
 */
export const deleteFeaturedToken = async (
  tokenId: string,
): Promise<boolean> => {
  const result = await db
    .delete(featuredTokensTable)
    .where(eq(featuredTokensTable.id, tokenId));

  return result.rowsAffected > 0;
};

/**
 * Count featured tokens by brand
 * @param brandId - The brand ID
 * @param activeOnly - Whether to count only active tokens
 * @returns Number of featured tokens for the brand
 */
export const countFeaturedTokensByBrand = async (
  brandId: string,
  activeOnly = false,
): Promise<number> => {
  const conditions = [eq(featuredTokensTable.brandId, brandId)];

  if (activeOnly) {
    conditions.push(eq(featuredTokensTable.isActive, true));
  }

  const result = await db
    .select()
    .from(featuredTokensTable)
    .where(and(...conditions));

  return result.length;
};
