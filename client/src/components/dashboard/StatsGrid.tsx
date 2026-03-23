import { fmt } from "../../utils";

interface StatsGridProps {
  totalEarned: number;
  paidCount: number;
  outstanding: number;
  pendingCount: number;
  overdueAmt: number;
  overdueCount: number;
  draftCount: number;
}

export default function StatsGrid({
  totalEarned,
  paidCount,
  outstanding,
  pendingCount,
  overdueAmt,
  overdueCount,
  draftCount,
}: StatsGridProps) {
  return (
    <div className="stats mb6">
      <div className="stat">
        <div className="stat-lbl">Total Earned</div>
        <div className="stat-val">
          {"$"}
          {fmt(totalEarned, 0)}
        </div>
        <div className="stat-meta">{paidCount} paid invoices</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Outstanding</div>
        <div className="stat-val" style={{ color: "var(--bl)" }}>
          {"$"}
          {fmt(outstanding, 0)}
        </div>
        <div className="stat-meta">{pendingCount} awaiting payment</div>
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
        <div className="stat-meta">{overdueCount} invoices past due</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Drafts</div>
        <div className="stat-val">{draftCount}</div>
        <div className="stat-meta">not yet sent</div>
      </div>
    </div>
  );
}
