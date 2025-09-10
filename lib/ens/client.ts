import { getAddress, getAvatar, getName } from "@coinbase/onchainkit/identity";
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

export async function getAddressFromBaseName(baseName: string) {
  const address = await getAddress({ name: baseName, chain: base });
  return address;
}

export async function getAddressFromEnsName(ensName: string) {
  const address = await mainnetClient.getEnsAddress({ name: ensName });
  return address;
}
