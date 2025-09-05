import { MiniAppNotificationDetails } from "@farcaster/miniapp-core";
import { and, eq, isNotNull } from "drizzle-orm";
import { Address, getAddress, isAddressEqual } from "viem";
import { db } from "@/lib/database";
import { userTable, walletTable } from "@/lib/database/db.schema";
import { fetchUserFromNeynar } from "@/lib/neynar";
import { NeynarUser } from "@/lib/types/neynar.type";
import { User } from "@/lib/types/user.type";
import { formatAvatarSrc } from "@/lib/utils";
import { addUserWallets, getUserFromWalletAddress } from "./wallet.query";

/**
 * Create a user in the database
 * @param user - The user to create
 * @param referrerFid - The Farcaster fid of the referrer
 * @returns The created user
 */
async function createUserFromNeynar(
  user: NeynarUser,
  referrerFid?: number,
): Promise<User> {
  const dbUser = await db
    .insert(userTable)
    .values({
      username: user.username,
      avatarUrl: user.pfp_url ? formatAvatarSrc(user.pfp_url) : null,
      farcasterFid: user.fid,
      farcasterUsername: user.username,
      farcasterDisplayName: user.display_name,
      farcasterAvatarUrl: user.pfp_url ? formatAvatarSrc(user.pfp_url) : null,
      farcasterWallets: user.verified_addresses.eth_addresses.map((address) =>
        getAddress(address),
      ),
      farcasterNotificationDetails: null,
      farcasterReferrerFid: referrerFid ? referrerFid : null,
    })
    .returning();
  const ethAddresses = user.verified_addresses.eth_addresses.map((address) => ({
    address: getAddress(address),
    isPrimary: isAddressEqual(
      getAddress(user.verified_addresses.primary.eth_address),
      getAddress(address),
    ),
  }));
  const wallets = await addUserWallets(dbUser[0].id, ethAddresses);
  return { ...dbUser[0], wallets };
}

/**
 * Create a user in the database
 * @param user - The user to create
 * @param referrerFid - The Farcaster fid of the referrer
 * @returns The created user
 */
async function createUserFromWalletAddress(
  address: Address,
  farcasterUser?: NeynarUser,
): Promise<User> {
  const dbUser = await db
    .insert(userTable)
    .values({
      username: farcasterUser?.username || null,
      avatarUrl: farcasterUser?.pfp_url
        ? formatAvatarSrc(farcasterUser.pfp_url)
        : null,
      farcasterFid: farcasterUser?.fid || null,
      farcasterUsername: farcasterUser?.username || null,
      farcasterDisplayName: farcasterUser?.display_name || null,
      farcasterAvatarUrl: farcasterUser?.pfp_url
        ? formatAvatarSrc(farcasterUser.pfp_url)
        : null,
      farcasterWallets: farcasterUser
        ? farcasterUser.verified_addresses.eth_addresses.map((address) =>
            getAddress(address),
          )
        : [],
      farcasterNotificationDetails: null,
      farcasterReferrerFid: null,
    })
    .returning();
  const wallets = await addUserWallets(dbUser[0].id, [
    { address, isPrimary: true },
  ]);
  const ensOrBaseName = wallets.find(
    (wallet) => wallet.ensName || wallet.baseName,
  );
  if (ensOrBaseName) {
    // if the user doesnt have farcaster associated => add avatar and username based on ENS
    if (!farcasterUser) {
      await updateUser(dbUser[0].id, {
        username: ensOrBaseName.ensName || ensOrBaseName.baseName || null,
        avatarUrl:
          ensOrBaseName.ensAvatarUrl || ensOrBaseName.baseAvatarUrl || null,
      });
    }
  }
  return { ...dbUser[0], wallets };
}

/**
 * Get a user from their ID
 * @param id - The database ID of the user
 * @returns The user item
 */
export const getUserFromId = async (userId: string): Promise<User | null> => {
  if (!userId) return null;

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
      // Wallet fields (nullable since it's a LEFT JOIN)
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
    .from(userTable)
    .where(eq(userTable.id, userId))
    .leftJoin(walletTable, eq(userTable.id, walletTable.userId));

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
    wallets: result
      .filter((row) => row.walletAddress !== null)
      .map((row) => ({
        address: row.walletAddress!,
        ensName: row.walletEnsName,
        ensAvatarUrl: row.walletEnsAvatarUrl,
        baseName: row.walletBaseName,
        baseAvatarUrl: row.walletBaseAvatarUrl,
        isPrimary: row.walletIsPrimary!,
        userId: row.walletUserId!,
        createdAt: row.walletCreatedAt!,
        updatedAt: row.walletUpdatedAt!,
      })),
  };

  return user;
};

/**
 * Get a user from their Farcaster fid
 * @param fid - The Farcaster fid of the user
 * @returns The user or null if the user is not found
 */
export async function getUserFromFid(fid: number): Promise<User | null> {
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
      // Wallet fields (nullable since it's a LEFT JOIN)
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
    .from(userTable)
    .where(eq(userTable.farcasterFid, fid))
    .leftJoin(walletTable, eq(userTable.id, walletTable.userId));

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
    wallets: result
      .filter((row) => row.walletAddress !== null)
      .map((row) => ({
        address: row.walletAddress!,
        ensName: row.walletEnsName,
        ensAvatarUrl: row.walletEnsAvatarUrl,
        baseName: row.walletBaseName,
        baseAvatarUrl: row.walletBaseAvatarUrl,
        isPrimary: row.walletIsPrimary!,
        userId: row.walletUserId!,
        createdAt: row.walletCreatedAt!,
        updatedAt: row.walletUpdatedAt!,
      })),
  };

  return user;
}

/**
 * Get a user from their Farcaster fid or create them if they don't exist
 * @param fid - The Farcaster fid of the user
 * @param referrerFid - The Farcaster fid of the referrer
 * @returns The user in the database
 */
export async function getOrCreateUserFromFid(
  fid: number,
  referrerFid?: number,
): Promise<User> {
  const user = await getUserFromFid(fid);
  if (user) return user;
  // else create the user fetching data from neynar
  const userFromNeynar = await fetchUserFromNeynar(fid.toString());
  if (!userFromNeynar) {
    console.error("FID not found in Neynar", fid, referrerFid);
    throw new Error("Farcaster user not found in Neynar");
  }

  const dbUser = await createUserFromNeynar(userFromNeynar, referrerFid);
  return dbUser;
}

/**
 * Get a user from their wallet address or create them if they don't exist
 * @param address - The wallet address
 * @returns The user in the database
 */
export const getOrCreateUserFromWalletAddress = async (
  address: Address,
  farcasterUser?: NeynarUser,
): Promise<User> => {
  const user = await getUserFromWalletAddress(address);
  if (user) return user;
  const dbUser = await createUserFromWalletAddress(address, farcasterUser);
  return dbUser;
};

/**
 * Get the notification details for a user
 * @param fid - The Farcaster FID of the user
 * @returns The notification details
 */
export const getUserNotificationDetails = async (
  fid: number,
): Promise<MiniAppNotificationDetails | null> => {
  const notificationDetails = await db.query.userTable.findFirst({
    where: eq(userTable.farcasterFid, fid),
    columns: {
      farcasterNotificationDetails: true,
    },
  });
  if (!notificationDetails) return null;

  try {
    return notificationDetails.farcasterNotificationDetails;
  } catch (error) {
    return null;
  }
};

/**
 * Set the notification details for a user
 * @param fid - The Farcaster FID of the user
 * @param notificationDetails - The notification details to set
 * @returns The updated user
 */
export const setUserNotificationDetails = async (
  fid: number,
  notificationDetails: MiniAppNotificationDetails,
) => {
  return await db
    .update(userTable)
    .set({
      farcasterNotificationDetails: notificationDetails,
    })
    .where(eq(userTable.farcasterFid, fid));
};

/**
 * Delete the notification details for a user
 * @param fid - The Farcaster FID of the user
 * @returns The updated user
 */
export const deleteUserNotificationDetails = async (fid: number) => {
  return await db
    .update(userTable)
    .set({
      farcasterNotificationDetails: null,
    })
    .where(eq(userTable.farcasterFid, fid));
};

/**
 * Get all users with notification details
 * @returns All users with notification details
 */
export const getAllUsersNotificationDetails = async (): Promise<
  | {
      farcasterFid: number;
      farcasterNotificationDetails: MiniAppNotificationDetails;
    }[]
  | null
> => {
  const userNotificationDetails = await db.query.userTable.findMany({
    where: and(
      isNotNull(userTable.farcasterNotificationDetails),
      isNotNull(userTable.farcasterFid),
    ),
    columns: {
      farcasterFid: true,
      farcasterNotificationDetails: true,
    },
  });
  if (!userNotificationDetails) return null;
  return userNotificationDetails.map((user) => ({
    farcasterFid: user.farcasterFid!,
    farcasterNotificationDetails: user.farcasterNotificationDetails!,
  }));
};

/**
 * Update a user in the database
 * @param userId - The database ID of the user
 * @param newUser - The new user data
 * @returns The updated user
 */
export const updateUser = async (userId: string, newUser: Partial<User>) => {
  return await db
    .update(userTable)
    .set(newUser)
    .where(eq(userTable.id, userId));
};
