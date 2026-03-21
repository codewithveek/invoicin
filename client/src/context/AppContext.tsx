import { createContext, useContext, useState, type ReactNode } from "react";
import { DEMO_CLIENTS, DEMO_TEMPLATES, DEMO_INVOICES } from "../data";

interface AppContextType {
  invoices: any[];
  setInvoices: React.Dispatch<React.SetStateAction<any[]>>;
  clients: any[];
  setClients: React.Dispatch<React.SetStateAction<any[]>>;
  templates: any[];
  setTemplates: React.Dispatch<React.SetStateAction<any[]>>;
  toastMsg: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState(DEMO_INVOICES);
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(null);
    setTimeout(() => setToastMsg(msg), 50);
  }

  function clearToast() {
    setToastMsg(null);
  }

  return (
    <AppContext.Provider
      value={{
        invoices,
        setInvoices,
        clients,
        setClients,
        templates,
        setTemplates,
        toastMsg,
        showToast,
        clearToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
