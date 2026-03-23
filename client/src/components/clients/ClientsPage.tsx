import { useState } from "react";
import Icon from "../shared/Icon";
import { fmt } from "../../utils";
import { useClients, useClientMutations } from "../../hooks/useClients";
import { useInvoices } from "../../hooks/useInvoices";
import type { AppClient } from "../../types";

function AddClientModal({
  onAdd,
  onClose,
}: {
  onAdd: (client: AppClient) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  function submit() {
    if (!form.name || !form.email) return;
    onAdd({ id: "c" + Date.now(), ...form });
    onClose();
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Add Client</div>
        <div className="modal-sub">Save a client to your address book</div>
        <div className="fgrid mb4">
          <div className="fg full">
            <label>Name</label>
            <input
              placeholder="Acme Corp"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="fg full">
            <label>Email</label>
            <input
              type="email"
              placeholder="billing@acmecorp.io"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>
          <div className="fg full">
            <label>Address (optional)</label>
            <input
              placeholder="123 Main St, San Francisco"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
          </div>
          <div className="fg full">
            <label>Phone (optional)</label>
            <input
              placeholder="+1 415 555 0123"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="row">
          <button
            className="btn bp btn-full"
            onClick={submit}
            disabled={!form.name || !form.email}
          >
            <Icon n="plus" s={13} c="#fff" />
            Add Client
          </button>
          <button className="btn bs" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientCard({
  client,
  invoiceCount,
  totalEarned,
}: {
  client: AppClient;
  invoiceCount: number;
  totalEarned: number;
}) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div
        className="av"
        style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}
      >
        {client.name.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--tx)" }}>
          {client.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--tx3)" }}>
          {client.email}
          {client.phone && " \u00b7 " + client.phone}
        </div>
        {client.address && (
          <div style={{ fontSize: 11, color: "var(--tx3)", marginTop: 1 }}>
            {client.address}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "var(--mo)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--tx)",
          }}
        >
          {"$"}
          {fmt(totalEarned, 0)}
        </div>
        <div style={{ fontSize: 11, color: "var(--tx3)" }}>
          {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { addClient, showToast } = useClientMutations();
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(client: AppClient) {
    addClient(client);
    showToast("Client added");
  }

  return (
    <div className="pg fade">
      {showAdd && (
        <AddClientModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Clients</div>
          <div className="pg-sub">{clients.length} in address book</div>
        </div>
        <button className="btn bp" onClick={() => setShowAdd(true)}>
          <Icon n="plus" s={14} c="#fff" />
          Add Client
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clients.map((c) => {
          const cInvs = invoices.filter((i) => i.client.email === c.email);
          const cTotal = cInvs
            .filter((i) => i.status === "paid")
            .reduce((s: number, i) => s + i.total, 0);
          return (
            <ClientCard
              key={c.id}
              client={c}
              invoiceCount={cInvs.length}
              totalEarned={cTotal}
            />
          );
        })}
        {clients.length === 0 && (
          <div className="empty">
            <Icon n="users" s={40} c="var(--tx3)" />
            <p>No clients yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
