import { http } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  businessName?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  defaultCurrency?: string;
  homeCurrency?: string;
  defaultTerms?: string;
  defaultNotes?: string;
  plan?: string;
  onboarded?: boolean;
}

export const userApi = {
  me: () => http.get<UserProfile>("/user/me"),
  onboard: (data: { name: string; homeCurrency?: string }) =>
    http.post<UserProfile>("/user/onboard", data),
  updateProfile: (data: Partial<UserProfile>) =>
    http.patch<UserProfile>("/user/profile", data),
};
