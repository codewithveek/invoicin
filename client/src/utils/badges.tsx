import { STATUS_META } from "../constants";

export function statusBadge(status: string) {
  const m = STATUS_META[status] || STATUS_META.draft;
  const cls =
    (
      {
        green: "b-green",
        blue: "b-blue",
        red: "b-red",
        amber: "b-amber",
        purple: "b-purple",
        gray: "b-gray",
        teal: "b-teal",
      } as Record<string, string>
    )[m.color] || "b-gray";
  return (
    <span className={`badge ${cls}`}>
      <span className="bdot" />
      {m.label}
    </span>
  );
}

export function typeBadge(type: string) {
  const m: Record<string, { l: string; c: string }> = {
    standard: { l: "Invoice", c: "b-gray" },
    proforma: { l: "Proforma", c: "b-blue" },
    deposit: { l: "Deposit", c: "b-purple" },
    credit: { l: "Credit Note", c: "b-teal" },
  };
  const t = m[type] || m.standard;
  return <span className={`badge ${t.c}`}>{t.l}</span>;
}
