import { useApiQuery } from "@/hooks/use-api-query";
import { User } from "@/lib/types/user.type";

export const useGetUser = ({
  userId,
  enabled,
}: {
  userId: string | null;
  enabled: boolean;
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
  });

  return {
    data,
    error,
    isPending,
    isLoading,
    isSuccess: data?.status === "ok",
  };
};
