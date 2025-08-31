import { eq } from "drizzle-orm";
import { Address, getAddress } from "viem";
import { db } from "@/lib/database";
import { userTable, walletTable } from "@/lib/database/db.schema";
import {
  getBasenameAvatar,
  getBasenameName,
  getEnsAvatar,
  getEnsName,
} from "@/lib/ens/client";
import { User } from "@/types";

/**
 * Add wallets to a user
 * @param userId - The database ID of the user
 * @param addresses - The addresses to add to the user
 * @returns The added wallets
 */
export const addUserWallets = async (
  userId: string,
  addresses: { address: Address; isPrimary: boolean }[],
) => {
  const [ensName, baseName] = await Promise.all([
    getEnsName(addresses[0].address),
    getBasenameName(addresses[0].address),
  ]);
  const [ensAvatar, baseAvatar] = await Promise.all([
    getEnsAvatar(ensName?.normalize() || ""),
    getBasenameAvatar(baseName?.normalize() || ""),
  ]);
  const dbWallets = await db
    .insert(walletTable)
    .values(
      addresses.map((address) => ({
        address: getAddress(address.address),
        ensName: ensName?.normalize() || null,
        baseName: baseName?.normalize() || null,
        ensAvatarUrl: ensAvatar || null,
        baseAvatarUrl: baseAvatar || null,
        userId,
        isPrimary: address.isPrimary,
      })),
    )
    .returning();
  return dbWallets;
};

/**
 * Get a user from their wallet address
 * @param address - The wallet address
 * @returns The user or null if the user is not found
 */
export const getUserFromWalletAddress = async (
  address: Address,
): Promise<User | null> => {
  const result = await db
    .select({
      // User fields
      id: userTable.id,
      avatarUrl: userTable.avatarUrl,
      username: userTable.username,
      farcasterFid: userTable.farcasterFid,
      farcasterUsername: userTable.farcasterUsername,
      farcasterDisplayName: userTable.farcasterDisplayName,
      farcasterAvatarUrl: userTable.farcasterAvatarUrl,
      farcasterNotificationDetails: userTable.farcasterNotificationDetails,
      farcasterWallets: userTable.farcasterWallets,
      farcasterReferrerFid: userTable.farcasterReferrerFid,
      userCreatedAt: userTable.createdAt,
      userUpdatedAt: userTable.updatedAt,
      // Wallet fields
      walletAddress: walletTable.address,
      walletIsPrimary: walletTable.isPrimary,
      walletEnsName: walletTable.ensName,
      walletEnsAvatarUrl: walletTable.ensAvatarUrl,
      walletBaseName: walletTable.baseName,
      walletBaseAvatarUrl: walletTable.baseAvatarUrl,
      walletUserId: walletTable.userId,
      walletCreatedAt: walletTable.createdAt,
      walletUpdatedAt: walletTable.updatedAt,
    })
    .from(walletTable)
    .where(eq(walletTable.address, address))
    .innerJoin(userTable, eq(walletTable.userId, userTable.id));

  if (!result || result.length === 0) return null;

  const firstRow = result[0];

  // Build user object with wallets array
  const user: User = {
    id: firstRow.id,
    avatarUrl: firstRow.avatarUrl,
    username: firstRow.username,
    farcasterFid: firstRow.farcasterFid,
    farcasterUsername: firstRow.farcasterUsername,
    farcasterDisplayName: firstRow.farcasterDisplayName,
    farcasterAvatarUrl: firstRow.farcasterAvatarUrl,
    farcasterNotificationDetails: firstRow.farcasterNotificationDetails,
    farcasterWallets: firstRow.farcasterWallets,
    farcasterReferrerFid: firstRow.farcasterReferrerFid,
    createdAt: firstRow.userCreatedAt,
    updatedAt: firstRow.userUpdatedAt,
    wallets: result.map((row) => ({
      address: row.walletAddress,
      ensName: row.walletEnsName,
      ensAvatarUrl: row.walletEnsAvatarUrl,
      baseName: row.walletBaseName,
      baseAvatarUrl: row.walletBaseAvatarUrl,
      isPrimary: row.walletIsPrimary,
      userId: row.walletUserId,
      createdAt: row.walletCreatedAt,
      updatedAt: row.walletUpdatedAt,
    })),
  };

  return user;
};
