"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
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

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/i/")
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
    // Use push so the login page is on the history stack and the browser
    // treats this as a full navigation, ensuring cookies/session are cleared
    // before the next page renders.
    router.push("/login");
  }, [router]);

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
          if (!isPublicPath(pathname)) {
            router.replace("/login");
          }
          return;
        }
        const u = data.user as unknown as UserProfile;
        setUser(u);
        if (!u.onboarded && pathname !== "/onboarding") {
          router.replace("/onboarding");
          setAuthLoading(false);
          return;
        }
        // If on a public page but already authed+onboarded, go to app
        // Don't redirect /i/ paths — those are guest-accessible invoice links
        if (
          u.onboarded &&
          isPublicPath(pathname) &&
          !pathname.startsWith("/i/")
        ) {
          router.replace("/app");
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
          if (!isPublicPath(pathname)) {
            router.replace("/login");
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

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
