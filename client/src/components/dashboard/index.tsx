"use client";
import { useRouter } from "next/navigation";
import Icon from "../shared/Icon";
import StatsGrid from "./StatsGrid";
import RecentInvoicesTable from "./RecentInvoicesTable";
import ActivityFeed from "./ActivityFeed";
import { isOverdue } from "../../utils";
import { useInvoices } from "../../hooks/useInvoices";
import { useApp } from "../../context/AppContext";
import type { AppInvoice } from "../../types";

export default function Dashboard() {
  const { invoices } = useInvoices();
  const { user } = useApp();
  const router = useRouter();

  const onNew = () => router.push("/app/invoices/new");
  const onView = (inv: AppInvoice) => router.push("/app/invoices/" + inv.id);

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
          <div className="pg-sub">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}
          </div>
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
        currency={user?.defaultCurrency ?? "USD"}
      />

      <div className="two-col flex flex-row flex-wrap gap-[18px] items-start">
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
