import { useState } from "react";
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useApp } from "./context/AppContext";
import { isOverdue } from "./utils";
import Toast from "./components/shared/Toast";
import Icon from "./components/shared/Icon";
import Dashboard from "./components/dashboard/index";
import InvoiceList from "./components/invoices/InvoiceList";
import CreateInvoice from "./components/invoices/CreateInvoice";
import InvoiceDetail from "./components/invoices/InvoiceDetail";
import ClientInvoiceView from "./components/public/ClientInvoiceView";
import ClientsPage from "./components/clients/ClientsPage";
import SettingsPage from "./components/settings";

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoices, toastMsg, clearToast } = useApp();
  const [sbOpen, setSbOpen] = useState(false);

  const overdue = invoices.filter(isOverdue).length;
  const path = location.pathname;

  // Detect the current invoice ID from the URL for contextual sidebar items
  const invoiceIdMatch = path.match(/^\/invoices\/([^/]+)/);
  const currentInvoiceId = invoiceIdMatch?.[1];
  const activeInvoice =
    currentInvoiceId && currentInvoiceId !== "new"
      ? invoices.find((i) => i.id === currentInvoiceId)
      : null;

  const NAV = [
    { path: "/", lbl: "Dashboard", icon: "grid", badge: null as number | null },
    {
      path: "/invoices",
      lbl: "Invoices",
      icon: "file",
      badge: overdue || (null as number | null),
    },
    {
      path: "/clients",
      lbl: "Clients",
      icon: "users",
      badge: null as number | null,
    },
    {
      path: "/settings",
      lbl: "Settings",
      icon: "settings",
      badge: null as number | null,
    },
  ];

  function isNavActive(navPath: string) {
    if (navPath === "/") return path === "/" || path === "/dashboard";
    if (navPath === "/invoices")
      return path.startsWith("/invoices") && path !== "/invoices/new";
    return path.startsWith(navPath);
  }

  function go(p: string) {
    navigate(p);
    setSbOpen(false);
  }

  return (
    <>
      {toastMsg && <Toast msg={toastMsg} onClose={clearToast} />}
      <div className="app">
        <div
          className={"overlay" + (sbOpen ? " open" : "")}
          onClick={() => setSbOpen(false)}
        />
        <div className={"sb" + (sbOpen ? " open" : "")}>
          <div className="sb-top">
            <div className="sb-mark">I</div>
            <div style={{ flex: 1 }}>
              <div className="sb-name">InvoiceApp</div>
              <div className="sb-ver">v1.0 {"\u00b7"} Free plan</div>
            </div>
            <button className="sb-close" onClick={() => setSbOpen(false)}>
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
              className={"ni" + (path === "/invoices/new" ? " on" : "")}
              onClick={() => go("/invoices/new")}
            >
              <Icon
                n="plus"
                s={15}
                c={path === "/invoices/new" ? "var(--gdk)" : "var(--tx3)"}
              />
              New Invoice
            </button>
            {activeInvoice && (
              <button
                className={
                  "ni" + (path === `/invoices/${activeInvoice.id}` ? " on" : "")
                }
                onClick={() => go(`/invoices/${activeInvoice.id}`)}
              >
                <Icon
                  n="file"
                  s={15}
                  c={
                    path === `/invoices/${activeInvoice.id}`
                      ? "var(--gdk)"
                      : "var(--tx3)"
                  }
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeInvoice.id}
                </span>
              </button>
            )}
            {activeInvoice?.linkId && (
              <button
                className={
                  "ni" +
                  (path === `/invoices/${activeInvoice.id}/client` ? " on" : "")
                }
                onClick={() => go(`/invoices/${activeInvoice.id}/client`)}
              >
                <Icon
                  n="eye"
                  s={15}
                  c={
                    path === `/invoices/${activeInvoice.id}/client`
                      ? "var(--gdk)"
                      : "var(--tx3)"
                  }
                />
                Client View
              </button>
            )}
          </nav>
          <div className="sb-user">
            <div className="av">LE</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div className="av-name">Lucky Eze</div>
              <div className="av-plan">DevCraft Studio</div>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="tb-logo">
              <div
                className="sb-mark"
                style={{ width: 27, height: 27, fontSize: 12 }}
              >
                I
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--tx)",
                  letterSpacing: "-.02em",
                }}
              >
                InvoiceApp
              </div>
            </div>
            <button className="tb-btn" onClick={() => setSbOpen(true)}>
              <Icon n="menu" s={20} />
            </button>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default function InvoiceApp() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<CreateInvoice />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="invoices/:id/client" element={<ClientInvoiceView />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
