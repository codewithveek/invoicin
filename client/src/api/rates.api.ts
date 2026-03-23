import { http } from "./client";

export const ratesApi = {
  getRate: (from: string, to: string) =>
    http.get<{ rate: number }>(`/rates?from=${from}&to=${to}`),
};
