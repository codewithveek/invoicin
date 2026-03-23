import { http } from "./client";
import type { AppClient } from "../types";

export const clientsApi = {
  list: () => http.get<AppClient[]>("/clients"),
  create: (data: Omit<AppClient, "id">) =>
    http.post<AppClient>("/clients", data),
};
