import { useApp } from "../context/AppContext";
import { clientsApi } from "../api/clients.api";
import type { AppClient } from "../types";

export function useClients() {
  const { clients } = useApp();
  return { clients };
}

export function useClientMutations() {
  const { setClients, showToast, refreshClients } = useApp();

  async function addClient(data: Omit<AppClient, "id">) {
    const client = await clientsApi.create(data);
    setClients((p) => [...p, client]);
    return client;
  }

  async function updateClient(
    id: string,
    data: Partial<Omit<AppClient, "id">>
  ) {
    const updated = await clientsApi.update(id, data);
    setClients((p) => p.map((c) => (c.id === id ? updated : c)));
    return updated;
  }

  async function deleteClient(id: string) {
    await clientsApi.delete(id);
    setClients((p) => p.filter((c) => c.id !== id));
  }

  return { addClient, updateClient, deleteClient, showToast, refreshClients };
}
