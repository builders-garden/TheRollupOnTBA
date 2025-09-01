import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import ky from "ky";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiQueryOptions<TData, TBody = unknown>
  extends Omit<UseQueryOptions<TData>, "queryFn"> {
  url: string;
  method?: HttpMethod;
  body?: TBody;
  isProtected?: boolean;
}

export const useApiQuery = <TData, TBody = unknown>(
  options: UseApiQueryOptions<TData, TBody>,
) => {
  const {
    url,
    method = "GET",
    body,
    isProtected = false,
    ...queryOptions
  } = options;

  return useQuery<TData>({
    ...queryOptions,
    queryFn: async () => {
      const response = await ky(url, {
        method,
        headers: {
          ...(body && { "Content-Type": "application/json" }),
        },
        ...(isProtected && {
          credentials: "include",
        }),
        ...(body && { json: body }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
