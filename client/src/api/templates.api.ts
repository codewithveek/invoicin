import { http } from "./client";
import type { AppTemplate } from "../types";

export const templatesApi = {
  list: () => http.get<AppTemplate[]>("/templates"),
  create: (data: Omit<AppTemplate, "id">) =>
    http.post<AppTemplate>("/templates", data),
  update: (id: string, data: Partial<Omit<AppTemplate, "id">>) =>
    http.patch<AppTemplate>(`/templates/${id}`, data),
  delete: (id: string) => http.delete<void>(`/templates/${id}`),
};
