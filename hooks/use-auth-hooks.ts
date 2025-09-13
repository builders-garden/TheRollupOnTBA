import { Brand } from "@/lib/database/db.schema";
import { User } from "@/lib/types/user.type";
import { useApiMutation, UseApiMutationOptions } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Auth queries
export function useAuthCheck(enabled: boolean = true) {
  const { data, isPending, isLoading, isFetched, refetch, error } =
    useApiQuery<{
      user?: User;
      brand?: Brand;
      status: "ok" | "nok";
      error?: string;
    }>({
      queryKey: ["auth-check"],
      url: "/api/auth/check",
      enabled,
      retry: false,
      refetchOnWindowFocus: false,
    });

  return {
    user: data?.user,
    brand: data?.brand,
    error: error || (data?.error ? new Error(data.error) : null),
    isLoading,
    isFetched,
    isPending,
    refetch,
  };
}

// Auth mutations
export function useFarcasterSignIn(
  options?: Partial<
    UseApiMutationOptions<
      { success: boolean; error?: string; user?: User },
      {
        fid: number;
        referrerFid?: number;
        token: string;
        connectedAddress?: string;
      }
    >
  >,
) {
  return useApiMutation<
    { success: boolean; error?: string; user?: User },
    {
      fid: number;
      referrerFid?: number;
      token: string;
      connectedAddress?: string;
    }
  >({
    url: "/api/auth/farcaster/sign-in",
    method: "POST",
    body: (variables) => variables,
    ...options,
  });
}

// Auth mutations
export function useFakeFarcasterSignIn(
  options?: Partial<
    UseApiMutationOptions<
      { success: boolean; error?: string; user?: User },
      {
        fid: number;
        referrerFid?: number;
        connectedAddress?: string;
      }
    >
  >,
) {
  return useApiMutation<
    { success: boolean; error?: string; user?: User },
    {
      fid: number;
      referrerFid?: number;
      connectedAddress?: string;
    }
  >({
    url: "/api/auth/farcaster/fake-sign-in",
    method: "POST",
    body: (variables) => variables,
    ...options,
  });
}

export function useBaseSignIn(
  options?: Partial<
    UseApiMutationOptions<
      { success: boolean; error?: string; brand?: Brand },
      { address: string; message: string; signature: string; nonce: string }
    >
  >,
) {
  return useApiMutation<
    { success: boolean; error?: string; brand?: Brand },
    { address: string; message: string; signature: string; nonce: string }
  >({
    url: "/api/auth/base/sign-in",
    method: "POST",
    body: (variables) => variables,
    ...options,
  });
}

export function useLogout(
  options?: Partial<UseApiMutationOptions<{ success: boolean }, object>>,
) {
  return useApiMutation<{ success: boolean }, object>({
    url: "/api/auth/logout",
    method: "POST",
    body: () => ({}),
    ...options,
  });
}
