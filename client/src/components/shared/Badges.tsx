export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    draft: ["Draft", "b-gray"],
    sent: ["Sent", "b-blue"],
    viewed: ["Viewed", "b-purple"],
    overdue: ["Overdue", "b-red"],
    paid: ["Paid", "b-green"],
    cancelled: ["Cancelled", "b-gray"],
    disputed: ["Disputed", "b-amber"],
  };
  const [label, cls] = map[status] ?? [status, "b-gray"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function TypeBadge({ type }: { type: string }) {
  const map: Record<string, [string, string]> = {
    standard: ["Invoice", "b-gray"],
    proforma: ["Proforma", "b-blue"],
    deposit: ["Deposit", "b-purple"],
    credit: ["Credit", "b-amber"],
  };
  const [label, cls] = map[type] ?? [type, "b-gray"];
  return <span className={`badge ${cls}`}>{label}</span>;
}
