import { useState } from "react";
import { S } from "./styles";
import { DEMO_CLIENTS, DEMO_TEMPLATES, DEMO_INVOICES } from "./data";
import { isOverdue } from "./utils";
import Toast from "./components/Toast";
import Icon from "./components/Icon";
import Dashboard from "./components/Dashboard";
import InvoiceList from "./components/InvoiceList";
import CreateInvoice from "./components/CreateInvoice";
import InvoiceDetail from "./components/InvoiceDetail";
import ClientInvoiceView from "./components/ClientInvoiceView";
import ClientsPage from "./components/ClientsPage";
import SettingsPage from "./components/SettingsPage";

export default function InvoiceApp() {
  const [view, setView] = useState("dashboard");
  const [invoices, setInvoices] = useState(DEMO_INVOICES);
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [sbOpen, setSbOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(null);
    setTimeout(() => setToastMsg(msg), 50);
  };

  const overdue = invoices.filter((i) => isOverdue(i)).length;

  function go(id: string) {
    setView(id);
    setActiveInvoice(null);
    setSbOpen(false);
  }

  function onCreated(inv: any) {
    setInvoices((p) => [inv, ...p]);
    setActiveInvoice(inv);
    setView("detail");
    setSbOpen(false);
    showToast("Invoice created");
  }

  function onUpdate(inv: any) {
    setInvoices((p) => p.map((i) => (i.id === inv.id ? inv : i)));
    setActiveInvoice(inv);
  }

  function viewInvoice(inv: any) {
    setActiveInvoice(inv);
    setView("detail");
  }

  const NAV = [
    { id: "dashboard", lbl: "Dashboard", icon: "grid", badge: null },
    { id: "invoices", lbl: "Invoices", icon: "file", badge: overdue || null },
    { id: "clients", lbl: "Clients", icon: "users", badge: null },
    { id: "settings", lbl: "Settings", icon: "settings", badge: null },
  ];

  const render = () => {
    if (view === "create")
      return (
        <CreateInvoice
          clients={clients}
          templates={templates}
          onCreated={onCreated}
          onCancel={() => setView("dashboard")}
        />
      );
    if (view === "detail" && activeInvoice)
      return (
        <InvoiceDetail
          invoice={activeInvoice}
          onBack={() => {
            setActiveInvoice(null);
            setView("invoices");
          }}
          onUpdate={onUpdate}
          toast={showToast}
        />
      );
    if (view === "client-view" && activeInvoice)
      return (
        <ClientInvoiceView
          invoice={activeInvoice}
          onBack={() => setView("detail")}
        />
      );
    if (view === "invoices")
      return (
        <InvoiceList
          invoices={invoices}
          onNew={() => setView("create")}
          onView={viewInvoice}
        />
      );
    if (view === "clients")
      return (
        <ClientsPage
          clients={clients}
          setClients={setClients}
          invoices={invoices}
          toast={showToast}
        />
      );
    if (view === "settings")
      return (
        <SettingsPage
          templates={templates}
          setTemplates={setTemplates}
          toast={showToast}
        />
      );
    return (
      <Dashboard
        invoices={invoices}
        onNew={() => setView("create")}
        onView={viewInvoice}
      />
    );
  };

  return (
    <>
      <style>{S}</style>
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
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
                key={n.id}
                className={
                  "ni" +
                  (view === n.id || (view === "detail" && n.id === "invoices")
                    ? " on"
                    : "")
                }
                onClick={() => go(n.id)}
              >
                <Icon
                  n={n.icon}
                  s={15}
                  c={view === n.id ? "var(--gdk)" : "var(--tx3)"}
                />
                {n.lbl}
                {n.badge && <span className="ni-badge">{n.badge}</span>}
              </button>
            ))}
            <div className="sb-div" />
            <button
              className={"ni" + (view === "create" ? " on" : "")}
              onClick={() => {
                setView("create");
                setSbOpen(false);
              }}
            >
              <Icon
                n="plus"
                s={15}
                c={view === "create" ? "var(--gdk)" : "var(--tx3)"}
              />
              New Invoice
            </button>
            {activeInvoice && (
              <button
                className={"ni" + (view === "detail" ? " on" : "")}
                onClick={() => {
                  setView("detail");
                  setSbOpen(false);
                }}
              >
                <Icon
                  n="file"
                  s={15}
                  c={view === "detail" ? "var(--gdk)" : "var(--tx3)"}
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
                className={"ni" + (view === "client-view" ? " on" : "")}
                onClick={() => {
                  setView("client-view");
                  setSbOpen(false);
                }}
              >
                <Icon
                  n="eye"
                  s={15}
                  c={view === "client-view" ? "var(--gdk)" : "var(--tx3)"}
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
          {render()}
        </div>
      </div>
    </>
  );
}
