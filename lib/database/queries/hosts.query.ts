import { and, eq } from "drizzle-orm";
import { db } from "..";
import { CreateHost, Host, hostsTable } from "../db.schema";

/**
 * Get all hosts by brand ID
 * @param brandId - The brand ID
 * @returns The hosts
 */
export const getHostsByBrandId = async (brandId: string): Promise<Host[]> => {
  const hosts = await db
    .select()
    .from(hostsTable)
    .where(eq(hostsTable.brandId, brandId));
  return hosts;
};

/**
 * Create a new host
 * @param host - The host to create
 * @returns The created host
 */
export const createHost = async (host: CreateHost): Promise<Host> => {
  const [newHost] = await db.insert(hostsTable).values(host).returning();
  return newHost;
};

/**
 * Delete an host by FID and brand ID
 * @param fid - The FID of the host
 * @param brandId - The brand ID
 * @returns The deleted host
 */
export const deleteHostByFidAndBrandId = async (
  fid: number,
  brandId: string,
): Promise<void> => {
  await db
    .delete(hostsTable)
    .where(and(eq(hostsTable.fid, fid), eq(hostsTable.brandId, brandId)));
};
