import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { invoicesApi } from "../api/invoices.api";
import { clientsApi } from "../api/clients.api";
import { templatesApi } from "../api/templates.api";
import { ApiError } from "../api/client";
import type { AppInvoice, AppClient, AppTemplate } from "../types";
import type { UserProfile } from "../api/user.api";

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  invoices: AppInvoice[];
  setInvoices: React.Dispatch<React.SetStateAction<AppInvoice[]>>;
  clients: AppClient[];
  setClients: React.Dispatch<React.SetStateAction<AppClient[]>>;
  templates: AppTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<AppTemplate[]>>;
  toastMsg: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
  dataError: string | null;
  clearDataError: () => void;
  refreshInvoices: () => Promise<void>;
  refreshClients: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  authLoading: boolean;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const PUBLIC_PATHS = ["/login", "/onboarding"];

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [invoices, setInvoices] = useState<AppInvoice[]>([]);
  const [clients, setClients] = useState<AppClient[]>([]);
  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const refreshInvoices = useCallback(async () => {
    try {
      const data = await invoicesApi.list();
      setInvoices(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setDataError("Failed to load invoices. Please refresh.");
    }
  }, []);

  const refreshClients = useCallback(async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setDataError("Failed to load clients. Please refresh.");
    }
  }, []);

  const refreshTemplates = useCallback(async () => {
    try {
      const data = await templatesApi.list();
      setTemplates(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setDataError("Failed to load templates. Please refresh.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setInvoices([]);
    setClients([]);
    setTemplates([]);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Auth check on mount and navigation
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const { data } = await authClient.getSession();
        if (cancelled) return;
        if (!data?.session) {
          setUser(null);
          setAuthLoading(false);
          if (!PUBLIC_PATHS.includes(location.pathname)) {
            navigate("/login", { replace: true });
          }
          return;
        }
        const u = data.user as unknown as UserProfile;
        setUser(u);
        if (!u.onboarded && location.pathname !== "/onboarding") {
          navigate("/onboarding", { replace: true });
          setAuthLoading(false);
          return;
        }
        // If on login/onboarding but already authed+onboarded, go to dashboard
        if (u.onboarded && PUBLIC_PATHS.includes(location.pathname)) {
          navigate("/", { replace: true });
        }
        // Load data
        await Promise.all([
          refreshInvoices(),
          refreshClients(),
          refreshTemplates(),
        ]);
      } catch {
        if (!cancelled) {
          setUser(null);
          if (!PUBLIC_PATHS.includes(location.pathname)) {
            navigate("/login", { replace: true });
          }
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(msg: string) {
    setToastMsg(null);
    setTimeout(() => setToastMsg(msg), 50);
  }

  function clearToast() {
    setToastMsg(null);
  }

  function clearDataError() {
    setDataError(null);
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        invoices,
        setInvoices,
        clients,
        setClients,
        templates,
        setTemplates,
        toastMsg,
        showToast,
        clearToast,
        dataError,
        clearDataError,
        refreshInvoices,
        refreshClients,
        refreshTemplates,
        authLoading,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
