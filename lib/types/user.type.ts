import { User as DbUser, Wallet as DbWallet } from "@/lib/database/db.schema";

export type User = DbUser & {
  wallets: DbWallet[];
};
