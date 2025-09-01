import ky from "ky";
import { NeynarUser } from "@/lib/types/neynar.type";
import { formatAvatarSrc } from "@/lib/utils";
import { env } from "@/lib/zod";

/**
 * Fetch multiple users from Neynar
 * @param fids - comma separated FIDs of the users to fetch
 * @returns The users
 */
export const fetchBulkUsersFromNeynar = async (
  fids: string,
  viewerFid?: string,
): Promise<NeynarUser[]> => {
  if (!fids) return [];

  const data = await ky
    .get<{ users: NeynarUser[] }>(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids}${viewerFid ? `&viewer_fid=${viewerFid}` : ""}`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY,
        },
      },
    )
    .json();

  return data.users || [];
};

/**
 * Fetch a single user from Neynar
 * @param fid - The FID of the user to fetch
 * @returns The user
 */
export const fetchUserFromNeynar = async (
  fid: string,
): Promise<NeynarUser | null> => {
  if (!fid) return null;
  const users = await fetchBulkUsersFromNeynar(fid);
  if (!users || users.length === 0) return null;
  return users[0];
};

/**
 * Search for users by username
 * @param username - The username to search for
 * @param viewerFid - The FID of the viewer
 * @returns The users
 */
export const searchUsersByUsername = async (
  username: string,
  viewerFid?: string,
): Promise<NeynarUser[]> => {
  const data = await ky
    .get<{ result: { users: NeynarUser[] } }>(
      `https://api.neynar.com/v2/farcaster/user/search?q=${username}${viewerFid ? `&viewer_fid=${viewerFid}` : ""}`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY,
        },
      },
    )
    .json();

  if (!data.result?.users) {
    return [];
  }
  return data.result.users.map((user) => ({
    ...user,
    pfp_url: user.pfp_url ? formatAvatarSrc(user.pfp_url) : "",
  }));
};

/**
 * Fetch a neynar user by address
 * @param address - The address to fetch the user by
 * @returns The user
 */
export const fetchUserByAddress = async (
  address: string,
): Promise<NeynarUser | undefined> => {
  const response = await ky.get<{ [key: string]: NeynarUser[] }>(
    `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY,
      },
    },
  );
  if (!response.ok) {
    return undefined;
  }
  const data = await response.json();
  const userArray = data[address.toLowerCase()];
  return userArray && userArray.length > 0 ? userArray[0] : undefined;
};
