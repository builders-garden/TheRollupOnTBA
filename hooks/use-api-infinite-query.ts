import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import ky from "ky";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiInfiniteQueryOptions<
  TData,
  TPageParam = number,
  TBody = unknown,
> extends Omit<
    UseInfiniteQueryOptions<
      TData,
      Error,
      InfiniteData<TData, TPageParam>,
      readonly TPageParam[],
      unknown
    >,
    "queryFn" | "initialPageParam"
  > {
  url: string;
  method?: HttpMethod;
  body?: TBody;
  isProtected?: boolean;
  pageParamName?: string;
  initialPageParam?: TPageParam;
  cache?: RequestCache;
}

export const useApiInfiniteQuery = <
  TData,
  TPageParam = number,
  TBody = unknown,
>(
  options: UseApiInfiniteQueryOptions<TData, TPageParam, TBody>,
) => {
  const {
    url,
    method = "GET",
    body,
    isProtected = true,
    pageParamName = "page",
    initialPageParam = 1 as TPageParam,
    cache,
    ...queryOptions
  } = options;

  return useInfiniteQuery<
    TData,
    Error,
    InfiniteData<TData, TPageParam>,
    readonly TPageParam[],
    unknown
  >({
    ...queryOptions,
    initialPageParam,
    queryFn: async ({ pageParam = initialPageParam }) => {
      // Add page parameter to URL if it's a GET request
      const requestUrl =
        method === "GET"
          ? `${url}${url.includes("?") ? "&" : "?"}${pageParamName}=${pageParam}`
          : url;

      const response = await ky(requestUrl, {
        method,
        cache,
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
