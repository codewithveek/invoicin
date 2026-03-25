"use client";
import { useState } from "react";
import Icon from "../shared/Icon";
import { fmt } from "../../utils";
import { useClients, useClientMutations } from "../../hooks/useClients";
import { useInvoices } from "../../hooks/useInvoices";
import type { AppClient } from "../../types";

function ClientModal({
  initial,
  onSave,
  onClose,
  title,
}: {
  initial?: AppClient;
  onSave: (data: Omit<AppClient, "id">) => void;
  onClose: () => void;
  title: string;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">{title}</div>
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
            disabled={!form.name || !form.email || saving}
          >
            <Icon n={initial ? "check" : "plus"} s={13} c="#fff" />
            {saving ? "Saving…" : initial ? "Save Changes" : "Add Client"}
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
  onEdit,
  onDelete,
  deleting,
}: {
  client: AppClient;
  invoiceCount: number;
  totalEarned: number;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="card flex items-center gap-[14px] flex-wrap">
      <div className="av w-10 h-10 text-[14px] shrink-0">
        {client.name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-[14px] text-tx">{client.name}</div>
        <div className="text-[12px] text-tx3">
          {client.email}
          {client.phone && " \u00b7 " + client.phone}
        </div>
        {client.address && (
          <div className="text-[11px] text-tx3 mt-px">{client.address}</div>
        )}
      </div>
      <div className="text-right mr-2">
        <div className="font-mono text-[14px] font-bold text-tx">
          {"$"}
          {fmt(totalEarned, 0)}
        </div>
        <div className="text-[11px] text-tx3">
          {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
        </div>
      </div>
      <div className="flex gap-1">
        <button className="btn bs px-2 py-1" onClick={onEdit}>
          <Icon n="settings" s={13} c="var(--tx2)" />
        </button>
        <button
          className="btn bs px-2 py-1"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Icon n="spin" s={13} c="var(--rd)" />
          ) : (
            <Icon n="close" s={13} c="var(--rd)" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { addClient, updateClient, deleteClient, showToast } =
    useClientMutations();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AppClient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(data: Omit<AppClient, "id">) {
    await addClient(data);
    showToast("Client added");
  }

  async function handleEdit(data: Omit<AppClient, "id">) {
    if (!editing) return;
    await updateClient(editing.id, data);
    showToast("Client updated");
    setEditing(null);
  }

  async function handleDelete(client: AppClient) {
    if (!confirm(`Delete ${client.name}?`)) return;
    setDeletingId(client.id);
    try {
      await deleteClient(client.id);
      showToast("Client deleted");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="pg fade">
      {showAdd && (
        <ClientModal
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
          title="Add Client"
        />
      )}
      {editing && (
        <ClientModal
          initial={editing}
          onSave={handleEdit}
          onClose={() => setEditing(null)}
          title="Edit Client"
        />
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
      <div className="flex flex-col gap-[10px]">
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
              onEdit={() => setEditing(c)}
              onDelete={() => handleDelete(c)}
              deleting={deletingId === c.id}
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
