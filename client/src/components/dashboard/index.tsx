import { useNavigate } from "react-router-dom";
import Icon from "../shared/Icon";
import StatsGrid from "./StatsGrid";
import RecentInvoicesTable from "./RecentInvoicesTable";
import ActivityFeed from "./ActivityFeed";
import { isOverdue } from "../../utils";
import { useInvoices } from "../../hooks/useInvoices";
import type { AppInvoice } from "../../types";

export default function Dashboard() {
  const { invoices } = useInvoices();
  const navigate = useNavigate();

  const onNew = () => navigate("/invoices/new");
  const onView = (inv: AppInvoice) => navigate("/invoices/" + inv.id);

  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status));
  const overdue = invoices.filter(
    (i) => i.status === "overdue" || isOverdue(i)
  );
  const draft = invoices.filter((i) => i.status === "draft");

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

      <StatsGrid
        totalEarned={paid.reduce((s, i) => s + i.total, 0)}
        paidCount={paid.length}
        outstanding={pending.reduce((s, i) => s + i.total, 0)}
        pendingCount={pending.length}
        overdueAmt={overdue.reduce((s, i) => s + i.total, 0)}
        overdueCount={overdue.length}
        draftCount={draft.length}
      />

      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <RecentInvoicesTable
          invoices={invoices}
          onNew={onNew}
          onView={onView}
        />
        <ActivityFeed invoices={invoices} />
      </div>
    </div>
  );
}
