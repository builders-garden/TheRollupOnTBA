import { eq } from "drizzle-orm";
import { Address } from "viem";
import { db } from "..";
import { Admin, adminsTable, CreateAdmin } from "../db.schema";

/**
 * Get all admins by brand ID
 * @param brandId - The brand ID
 * @returns The admins
 */
export const getAdminsByBrandId = async (brandId: string): Promise<Admin[]> => {
  const admins = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.brandId, brandId));
  return admins;
};

/**
 * Create a new admin
 * @param admin - The admin to create
 * @returns The created admin
 */
export const createAdmin = async (admin: CreateAdmin): Promise<Admin> => {
  const [newAdmin] = await db.insert(adminsTable).values(admin).returning();
  return newAdmin;
};

/**
 * Delete an admin by address
 * @param address - The address to delete
 * @returns The deleted admin
 */
export const deleteAdminByAddress = async (address: string): Promise<void> => {
  await db
    .delete(adminsTable)
    .where(eq(adminsTable.address, address as Address));
};
