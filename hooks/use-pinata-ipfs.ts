import { useMutation } from "@tanstack/react-query";
import ky from "ky";

// Types for API responses
interface PinataApiResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Query hooks
export const usePinataIpfsUpload = () => {
  return useMutation<PinataApiResponse, Error, { file: File }>({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await ky("/api/pinata/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
