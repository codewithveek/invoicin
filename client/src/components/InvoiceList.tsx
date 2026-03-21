import { useState } from "react";
import Icon from "./Icon";
import { isOverdue, fmt, currencySymbol } from "../utils";
import { statusBadge, typeBadge } from "../utils/badges";

interface InvoiceListProps {
  invoices: any[];
  onNew: () => void;
  onView: (inv: any) => void;
}

export default function InvoiceList({
  invoices,
  onNew,
  onView,
}: InvoiceListProps) {
  const [filter, setFilter] = useState("all");

  const filters: [string, string][] = [
    ["all", "All"],
    ["draft", "Draft"],
    ["sent", "Sent"],
    ["viewed", "Viewed"],
    ["overdue", "Overdue"],
    ["paid", "Paid"],
  ];

  const counts = Object.fromEntries(
    filters.map(([k]) => [
      k,
      k === "all"
        ? invoices.length
        : invoices.filter((i) => (isOverdue(i) ? "overdue" : i.status) === k)
            .length,
    ])
  );

  const shown =
    filter === "all"
      ? invoices
      : invoices.filter(
          (i) => (isOverdue(i) ? "overdue" : i.status) === filter
        );

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Invoices</div>
          <div className="pg-sub">{invoices.length} total</div>
        </div>
        <button className="btn bp" onClick={onNew}>
          <Icon n="plus" s={14} c="#fff" />
          New Invoice
        </button>
      </div>

      <div className="tabs mb4">
        {filters.map(([k, l]) => (
          <button
            key={k}
            className={`tab ${filter === k ? "on" : ""}`}
            onClick={() => setFilter(k)}
          >
            {l}
            {counts[k] > 0 && (
              <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                ({counts[k]})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="tcard">
        {shown.length === 0 ? (
          <div className="empty">
            <Icon n="inbox" s={40} c="var(--tx3)" />
            <p>No {filter !== "all" ? filter : ""} invoices yet.</p>
          </div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((inv) => (
                  <tr key={inv.id} onClick={() => onView(inv)}>
                    <td className="t-id">{inv.id}</td>
                    <td>
                      <div className="t-client">{inv.client.name}</div>
                      <div className="t-email">{inv.client.email}</div>
                    </td>
                    <td>{typeBadge(inv.type)}</td>
                    <td>
                      <div className="t-amt">
                        {currencySymbol(inv.currency)}
                        {fmt(inv.total)}
                      </div>
                    </td>
                    <td>
                      {statusBadge(isOverdue(inv) ? "overdue" : inv.status)}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                      }}
                    >
                      {inv.dueDate || "-"}
                    </td>
                    <td>
                      <button
                        className="btn bg btn-sm"
                        style={{ padding: "5px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(inv);
                        }}
                      >
                        <Icon n="eye" s={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
