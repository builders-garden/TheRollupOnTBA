import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import ky from "ky";
import { AuthTokenType } from "@/lib/enums";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiQueryOptions<TData, TBody = unknown>
  extends Omit<UseQueryOptions<TData>, "queryFn"> {
  url: string;
  tokenType: AuthTokenType | null;
  method?: HttpMethod;
  body?: TBody;
  isProtected?: boolean;
  timeout?: number | false;
}

export const useApiQuery = <TData, TBody = unknown>(
  options: UseApiQueryOptions<TData, TBody>,
) => {
  const {
    url,
    method = "GET",
    body,
    tokenType,
    isProtected = false,
    timeout = false,
    ...queryOptions
  } = options;

  return useQuery<TData>({
    ...queryOptions,
    queryFn: async () => {
      const response = await ky(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-token-type": tokenType || "",
        },
        ...(isProtected && {
          credentials: "include",
        }),
        ...(body && { json: body }),
        timeout,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
