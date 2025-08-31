import { getAvatar, getName } from "@coinbase/onchainkit/identity";
import { Address, createPublicClient, http } from "viem";
import { base, mainnet } from "viem/chains";

export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function getEnsName(address: Address) {
  const ensName = await mainnetClient.getEnsName({ address });
  return ensName;
}

export async function getEnsAvatar(ensName: string) {
  const ensAvatar = await mainnetClient.getEnsAvatar({ name: ensName });
  return ensAvatar;
}

export async function getBasenameAvatar(baseName: string) {
  const baseAvatar = await getAvatar({ ensName: baseName, chain: base });
  return baseAvatar;
}

export async function getBasenameName(address: Address) {
  const baseName = await getName({ address, chain: base });
  return baseName;
}
