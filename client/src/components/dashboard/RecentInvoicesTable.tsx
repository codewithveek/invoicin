import Icon from "../shared/Icon";
import { StatusBadge, TypeBadge } from "../shared/Badges";
import { isOverdue, fmt, currencySymbol } from "../../utils";
import type { AppInvoice } from "../../types";

interface RecentInvoicesTableProps {
  invoices: AppInvoice[];
  onNew: () => void;
  onView: (inv: AppInvoice) => void;
}

export default function RecentInvoicesTable({
  invoices,
  onNew,
  onView,
}: RecentInvoicesTableProps) {
  return (
    <div className="tcard">
      <div className="tcard-hd">
        <div className="tcard-ttl">Recent Invoices</div>
        <button className="btn bg btn-sm" onClick={onNew}>
          <Icon n="plus" s={12} />
          Create
        </button>
      </div>
      <div className="tscroll">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 8).map((inv) => (
              <tr key={inv.id} onClick={() => onView(inv)}>
                <td>
                  <div className="t-id">{inv.id}</div>
                  <div
                    style={{ fontSize: 11, color: "var(--tx3)", marginTop: 1 }}
                  >
                    <TypeBadge type={inv.type} />
                  </div>
                </td>
                <td>
                  <div className="t-client">{inv.client.name}</div>
                  <div className="t-email">{inv.client.email}</div>
                </td>
                <td>
                  <div className="t-amt">
                    {currencySymbol(inv.currency)}
                    {fmt(inv.total)}
                  </div>
                  {inv.homeTotal && inv.homeCurrency && (
                    <div className="t-ngn">
                      {currencySymbol(inv.homeCurrency)}
                      {fmt(inv.homeTotal, 0)}
                    </div>
                  )}
                </td>
                <td>
                  <StatusBadge
                    status={isOverdue(inv) ? "overdue" : inv.status}
                  />
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
    </div>
  );
}
