import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { isOverdue, fmt, currencySymbol } from "../utils";
import { statusBadge, typeBadge } from "../utils/badges";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const { invoices } = useApp();
  const navigate = useNavigate();
  const onNew = () => navigate("/invoices/new");
  const onView = (inv: any) => navigate("/invoices/" + inv.id);
  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status));
  const overdue = invoices.filter(
    (i) => i.status === "overdue" || isOverdue(i)
  );
  const draft = invoices.filter((i) => i.status === "draft");

  const totalEarned = paid.reduce((s, i) => s + i.total, 0);
  const outstanding = pending.reduce((s, i) => s + i.total, 0);
  const overdueAmt = overdue.reduce((s, i) => s + i.total, 0);

  const recentActivity = invoices
    .flatMap((inv) => (inv.events || []).map((e: any) => ({ ...e, inv })))
    .sort((a: any, b: any) => b.ts.localeCompare(a.ts))
    .slice(0, 6);

  const activityIcon = (type: string): [string, string] =>
    ((
      {
        created: ["tag", "b-gray"],
        sent: ["send", "b-blue"],
        viewed: ["eye", "b-purple"],
        downloaded: ["download", "b-gray"],
        paid: ["check", "b-green"],
        overdue: ["alert", "b-red"],
        cancelled: ["close", "b-gray"],
        disputed: ["alert", "b-amber"],
      } as Record<string, [string, string]>
    )[type] || ["activity", "b-gray"]);

  return (
    <div className="pg fade">
      <div className="pg-hd">
        <div>
          <div className="pg-ttl">Dashboard</div>
          <div className="pg-sub">Welcome back, Lucky</div>
        </div>
        <button className="btn bp" onClick={onNew}>
          <Icon n="plus" s={14} c="#fff" />
          New Invoice
        </button>
      </div>

      <div className="stats mb6">
        <div className="stat">
          <div className="stat-lbl">Total Earned</div>
          <div className="stat-val">
            {"$"}
            {fmt(totalEarned, 0)}
          </div>
          <div className="stat-meta">{paid.length} paid invoices</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Outstanding</div>
          <div className="stat-val" style={{ color: "var(--bl)" }}>
            {"$"}
            {fmt(outstanding, 0)}
          </div>
          <div className="stat-meta">{pending.length} awaiting payment</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Overdue</div>
          <div
            className="stat-val"
            style={{ color: overdueAmt > 0 ? "var(--rd)" : "var(--tx)" }}
          >
            {"$"}
            {fmt(overdueAmt, 0)}
          </div>
          <div className="stat-meta">{overdue.length} invoices past due</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Drafts</div>
          <div className="stat-val">{draft.length}</div>
          <div className="stat-meta">not yet sent</div>
        </div>
      </div>

      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
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
                          style={{
                            fontSize: 11,
                            color: "var(--tx3)",
                            marginTop: 1,
                          }}
                        >
                          {typeBadge(inv.type)}
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
                        {inv.ngn && (
                          <div className="t-ngn">
                            {"₦"}
                            {fmt(inv.ngn, 0)}
                          </div>
                        )}
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
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-ttl">Recent Activity</div>
            {recentActivity.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--tx3)" }}>
                No activity yet.
              </div>
            ) : (
              recentActivity.map((ev: any, i: number) => {
                const [ico, cls] = activityIcon(ev.type);
                return (
                  <div key={i} className="af-item">
                    <div className={`af-icon ${cls}`}>
                      <Icon n={ico} s={13} c="currentColor" />
                    </div>
                    <div>
                      <div className="af-lbl">{ev.inv.client.name}</div>
                      <div className="af-sub">
                        {ev.inv.id} {"\u00b7"} {ev.type} {"\u00b7"} {ev.ts}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
