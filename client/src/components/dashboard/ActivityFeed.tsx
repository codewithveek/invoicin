import Icon from "../shared/Icon";
import type { AppInvoice, InvoiceEvent } from "../../types";

interface ActivityFeedProps {
  invoices: AppInvoice[];
}

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

export default function ActivityFeed({ invoices }: ActivityFeedProps) {
  const recentActivity = invoices
    .flatMap((inv) =>
      (inv.events || []).map((e: InvoiceEvent) => ({ ...e, inv }))
    )
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 6);

  return (
    <div className="card">
      <div className="card-ttl">Recent Activity</div>
      {recentActivity.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--tx3)" }}>
          No activity yet.
        </div>
      ) : (
        recentActivity.map((ev, i: number) => {
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
  );
}
