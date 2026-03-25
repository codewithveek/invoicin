"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "~/context/AppContext";
import { isOverdue } from "~/utils";
import Toast from "~/components/shared/Toast";
import Icon from "~/components/shared/Icon";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { invoices, toastMsg, clearToast, user, signOut, authLoading } =
    useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center font-sans text-tx3">
        Loading…
      </div>
    );
  }

  const overdue = invoices.filter(isOverdue).length;
  const path = pathname;

  const invoiceIdMatch = path.match(/^\/app\/invoices\/([^/]+)/);
  const currentInvoiceId = invoiceIdMatch?.[1];
  const activeInvoice =
    currentInvoiceId && currentInvoiceId !== "new"
      ? invoices.find((i) => i.id === currentInvoiceId)
      : null;

  const NAV = [
    {
      path: "/app",
      lbl: "Dashboard",
      icon: "grid",
      badge: null as number | null,
    },
    {
      path: "/app/invoices",
      lbl: "Invoices",
      icon: "file",
      badge: overdue || (null as number | null),
    },
    {
      path: "/app/clients",
      lbl: "Clients",
      icon: "users",
      badge: null as number | null,
    },
    {
      path: "/app/settings",
      lbl: "Settings",
      icon: "settings",
      badge: null as number | null,
    },
  ];

  function isNavActive(navPath: string) {
    if (navPath === "/app") return path === "/app" || path === "/app/dashboard";
    if (navPath === "/app/invoices")
      return path.startsWith("/app/invoices") && path !== "/app/invoices/new";
    return path.startsWith(navPath);
  }

  function go(p: string) {
    router.push(p);
    setSidebarOpen(false);
  }

  return (
    <>
      {toastMsg && <Toast msg={toastMsg} onClose={clearToast} />}
      <div className="app">
        <div
          className={"overlay" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={"sb" + (sidebarOpen ? " open" : "")}>
          <div className="sb-top">
            <div className="sb-mark">I</div>
            <div className="flex-1">
              <div className="sb-name">Invoicin</div>
              <div className="sb-ver">
                v1.0 {"\u00b7"}{" "}
                {user?.plan === "pro"
                  ? "Pro"
                  : user?.plan === "business"
                  ? "Business"
                  : "Free plan"}
              </div>
            </div>
            <button className="sb-close" onClick={() => setSidebarOpen(false)}>
              <Icon n="close" s={17} />
            </button>
          </div>
          <nav className="sb-nav">
            {NAV.map((n) => (
              <button
                key={n.path}
                className={"ni" + (isNavActive(n.path) ? " on" : "")}
                onClick={() => go(n.path)}
              >
                <Icon
                  n={n.icon}
                  s={15}
                  c={isNavActive(n.path) ? "var(--gdk)" : "var(--tx3)"}
                />
                {n.lbl}
                {n.badge && <span className="ni-badge">{n.badge}</span>}
              </button>
            ))}
            <div className="sb-div" />
            <button
              className={"ni" + (path === "/app/invoices/new" ? " on" : "")}
              onClick={() => go("/app/invoices/new")}
            >
              <Icon
                n="plus"
                s={15}
                c={path === "/app/invoices/new" ? "var(--gdk)" : "var(--tx3)"}
              />
              New Invoice
            </button>
            {activeInvoice && (
              <button
                className={
                  "ni" +
                  (path === `/app/invoices/${activeInvoice.id}` ? " on" : "")
                }
                onClick={() => go(`/app/invoices/${activeInvoice.id}`)}
              >
                <Icon
                  n="file"
                  s={15}
                  c={
                    path === `/app/invoices/${activeInvoice.id}`
                      ? "var(--gdk)"
                      : "var(--tx3)"
                  }
                />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {activeInvoice.id}
                </span>
              </button>
            )}
          </nav>
          <div className="sb-user">
            <div className="av">
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="av-name">{user?.name ?? "User"}</div>
              <div className="av-plan">
                {user?.businessName ?? user?.email ?? ""}
              </div>
            </div>
            <button
              onClick={signOut}
              className="bg-transparent border-0 cursor-pointer p-1"
              title="Sign out"
            >
              <Icon n="close" s={14} c="var(--tx3)" />
            </button>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="tb-logo">
              <div className="sb-mark w-[27px] h-[27px] text-[12px]">I</div>
              <div className="text-[13px] font-[800] text-tx tracking-[-0.02em]">
                Invoicin
              </div>
            </div>
            <button className="tb-btn" onClick={() => setSidebarOpen(true)}>
              <Icon n="menu" s={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
