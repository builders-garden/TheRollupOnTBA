import { User } from "@/lib/types/user.type";
import { useApiMutation, UseApiMutationOptions } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Auth queries
export function useAuthCheck(enabled: boolean = true) {
  const { data, isPending, isLoading, isFetched, refetch, error } =
    useApiQuery<{
      user?: User;
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
    isAuthenticated: data?.status === "ok",
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
      { fid: number; referrerFid?: number; token: string }
    >
  >,
) {
  return useApiMutation<
    { success: boolean; error?: string; user?: User },
    { fid: number; referrerFid?: number; token: string }
  >({
    url: "/api/auth/sign-in",
    method: "POST",
    body: (variables) => variables,
    ...options,
  });
}

export function useWalletSignIn(
  options?: Partial<
    UseApiMutationOptions<
      { success: boolean; error?: string; user?: User },
      { address: string; message: string; signature: string }
    >
  >,
) {
  return useApiMutation<
    { success: boolean; error?: string; user?: User },
    { address: string; message: string; signature: string }
  >({
    url: "/api/auth/wallet-sign-in",
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
