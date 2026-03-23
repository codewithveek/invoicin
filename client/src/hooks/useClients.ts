import { useApp } from "../context/AppContext";
import type { AppClient } from "../types";

export function useClients() {
  const { clients } = useApp();
  return { clients };
}

export function useClientMutations() {
  const { setClients, showToast } = useApp();

  function addClient(client: AppClient) {
    setClients((p) => [...p, client]);
  }

  return { addClient, showToast };
}
