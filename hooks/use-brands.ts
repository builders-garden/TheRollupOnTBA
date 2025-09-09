import type { Brand, CreateBrand, UpdateBrand } from "@/lib/database/db.schema";
import { useApiMutation } from "./use-api-mutation";
import { useApiQuery } from "./use-api-query";

// Types for API responses
interface BrandsApiResponse {
  success: boolean;
  data: Brand[];
}

interface BrandApiResponse {
  success: boolean;
  data: Brand;
}

// Query hooks
export const useBrands = (params?: {
  active?: boolean;
  search?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.active !== undefined)
    searchParams.set("active", params.active.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/brands${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<BrandsApiResponse>({
    queryKey: ["brands", params],
    url,
    isProtected: true,
  });
};

export const useBrandById = (brandId: string) => {
  return useApiQuery<BrandApiResponse>({
    queryKey: ["brands", brandId],
    url: `/api/brands/${brandId}`,
    enabled: !!brandId,
    isProtected: true,
  });
};

export const useBrandByAddress = (address?: string) => {
  return useApiQuery<BrandApiResponse>({
    queryKey: ["brands", address],
    url: `/api/brands/addresses/${address}`,
    enabled: !!address,
    isProtected: true,
  });
};

// Mutation hooks
export const useCreateBrand = () => {
  return useApiMutation<BrandApiResponse, CreateBrand>({
    url: "/api/brands",
    method: "POST",
    body: (variables) => variables,
  });
};

export const useUpdateBrand = () => {
  return useApiMutation<BrandApiResponse, { brandId: string } & UpdateBrand>({
    url: (variables) => `/api/brands/${variables.brandId}`,
    method: "PUT",
    body: ({ brandId, ...data }) => data,
  });
};

export const useDeleteBrand = () => {
  return useApiMutation<
    { success: boolean; message: string },
    { brandId: string }
  >({
    url: (variables) => `/api/brands/${variables.brandId}`,
    method: "DELETE",
  });
};

export const useToggleBrandActive = () => {
  return useApiMutation<BrandApiResponse, { brandId: string }>({
    url: (variables) => `/api/brands/${variables.brandId}`,
    method: "PATCH",
    body: () => ({ action: "toggle-active" }),
  });
};
