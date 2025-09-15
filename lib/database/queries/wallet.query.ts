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
import { User } from "@/lib/types/user.type";

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
  // Get the ENS and base name for all the addresses
  const ensNames: string[] = [];
  const baseNames: string[] = [];
  for (const address of addresses) {
    const [ensName, baseName] = await Promise.all([
      getEnsName(address.address),
      getBasenameName(address.address),
    ]);

    ensNames.push(ensName?.normalize() || "");
    baseNames.push(baseName?.normalize() || "");
  }

  // Get the ENS and base avatar for all the addresses
  const ensAvatars: string[] = [];
  const baseAvatars: string[] = [];
  for (const baseName of baseNames) {
    const baseAvatar = await getBasenameAvatar(baseName?.normalize() || "");
    baseAvatars.push(baseAvatar || "");
  }
  for (const ensName of ensNames) {
    const ensAvatar = await getEnsAvatar(ensName?.normalize() || "");
    ensAvatars.push(ensAvatar || "");
  }

  // Map the new values to insert in the database
  const newValues = addresses.map((address, index) => ({
    address: getAddress(address.address),
    ensName: ensNames[index]?.normalize() || null,
    baseName: baseNames[index]?.normalize() || null,
    ensAvatarUrl: ensAvatars[index] || null,
    baseAvatarUrl: baseAvatars[index] || null,
    userId,
    isPrimary: address.isPrimary,
  }));

  // Add the wallets to the database
  const dbWallets = await db.insert(walletTable).values(newValues).returning();

  // Return the added wallets
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
