import { apiClient } from "./client";

export interface AuthUser {
  id: number;
  phone: string;
  name: string;
  is_admin?: boolean;
}

export interface AuthSuccessData {
  token_type: string;
  access_token: string;
  user: AuthUser;
}

export interface SmsData {
  action: "confirm_register";
  phone: string;
  expires_in: number;
}

export type LoginResult =
  | { type: "token"; data: AuthSuccessData }
  | { type: "sms"; data: SmsData };

export function extractApiError(error: unknown, fallback = "Something went wrong."): string {
  const data = (error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })
    ?.response?.data;
  if (data?.errors) {
    const firstField = Object.keys(data.errors)[0];
    return data.errors[firstField][0];
  }
  return data?.message ?? fallback;
}

export const authApi = {
  login: async (phone: string, password: string): Promise<LoginResult> => {
    const { data } = await apiClient.post("/v1/auth/login", { phone, password });
    if (data.data?.access_token) {
      return { type: "token", data: data.data };
    }
    return { type: "sms", data: data.data };
  },

  confirmRegister: async (phone: string, code: string): Promise<AuthSuccessData> => {
    const { data } = await apiClient.post("/v1/auth/register/confirm", { phone, code });
    return data.data;
  },

  forgotPassword: async (phone: string): Promise<SmsData> => {
    const { data } = await apiClient.post("/v1/auth/forgot-password", { phone });
    return data.data;
  },

  resetPassword: async (phone: string, code: string, password: string): Promise<AuthSuccessData> => {
    const { data } = await apiClient.post("/v1/auth/reset-password", { phone, code, password });
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/v1/auth/logout", {});
  },
};
