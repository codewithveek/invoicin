import { http } from "./client";
import type { AppClient } from "../types";

export const clientsApi = {
  list: () => http.get<AppClient[]>("/clients"),
  create: (data: Omit<AppClient, "id">) =>
    http.post<AppClient>("/clients", data),
  update: (id: string, data: Partial<Omit<AppClient, "id">>) =>
    http.patch<AppClient>(`/clients/${id}`, data),
  delete: (id: string) => http.delete<void>(`/clients/${id}`),
};
