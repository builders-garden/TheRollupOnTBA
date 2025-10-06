import { useApiQuery } from "@/hooks/use-api-query";
import { AuthTokenType } from "@/lib/enums";
import { User } from "@/lib/types/user.type";

export const useGetUser = ({
  userId,
  enabled,
  tokenType,
}: {
  userId: string | null;
  enabled: boolean;
  tokenType: AuthTokenType;
}) => {
  const { data, isPending, isLoading, error } = useApiQuery<{
    status: "ok" | "nok";
    user?: User;
    error?: string;
  }>({
    url: `/api/users/${userId}`,
    method: "GET",
    queryKey: ["user", userId],
    isProtected: true,
    enabled,
    tokenType,
  });

  return {
    data,
    error,
    isPending,
    isLoading,
    isSuccess: data?.status === "ok",
  };
};
