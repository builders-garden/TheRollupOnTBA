import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import ky from "ky";
import { AuthTokenType } from "@/lib/enums";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn"> {
  url: string | ((variables: TVariables) => string);
  method?: HttpMethod;
  tokenType: AuthTokenType | null;
  isProtected?: boolean;
  body?: (variables: TVariables) => unknown;
  timeout?: number | false;
}

export const useApiMutation = <TData, TVariables = unknown>(
  options: UseApiMutationOptions<TData, TVariables>,
) => {
  const {
    url,
    tokenType,
    method = "POST",
    isProtected = true,
    timeout = false,
    ...mutationOptions
  } = options;

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      const resolvedUrl = typeof url === "function" ? url(variables) : url;
      const resolvedBody = options.body ? options.body(variables) : null;
      const response = await ky(resolvedUrl, {
        method,
        ...(isProtected && {
          credentials: "include",
        }),
        headers: {
          "x-token-type": tokenType || "",
        },
        ...(resolvedBody ? { json: resolvedBody } : {}),
        timeout,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
