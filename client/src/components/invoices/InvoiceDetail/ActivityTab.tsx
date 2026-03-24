import Icon from "../../shared/Icon";
import { STATUS_META } from "../../../constants";
import type { AppInvoice } from "../../../types";

interface ActivityTabProps {
  inv: AppInvoice;
  effectiveStatus: string;
}

const iconMap: Record<string, string> = {
  created: "tag",
  sent: "send",
  viewed: "eye",
  downloaded: "download",
  paid: "check",
  cancelled: "close",
  disputed: "alert",
  reminder: "bell",
};

export default function ActivityTab({
  inv,
  effectiveStatus,
}: ActivityTabProps) {
  const viewCount = inv.events.filter((e) => e.type === "viewed").length;

  return (
    <div className="two-col grid grid-cols-[1fr_280px] gap-[18px]">
      <div>
        {/* Tracking stats */}
        <div className="card mb4">
          <div className="card-ttl">Tracking</div>
          <div className="flex gap-3 mb-4 flex-wrap">
            {(
              [
                ["Views", viewCount, viewCount > 0 ? "b-purple" : "b-gray"],
                [
                  "Status",
                  STATUS_META[effectiveStatus]?.label || "Draft",
                  (
                    {
                      green: "b-green",
                      blue: "b-blue",
                      red: "b-red",
                      amber: "b-amber",
                      purple: "b-purple",
                      gray: "b-gray",
                    } as Record<string, string>
                  )[STATUS_META[effectiveStatus]?.color || "gray"],
                ],
                [
                  "Sent",
                  inv.events.filter((e) => e.type === "sent").length + "x",
                  "b-blue",
                ],
              ] as [string, string | number, string][]
            ).map(([l, v, c]) => (
              <div
                key={l}
                className="bg-sf2 rounded-lg px-[14px] py-[10px] flex-1 min-w-[80px]"
              >
                <div className="text-[10px] font-bold text-tx3 uppercase tracking-[.06em] mb-1">
                  {l}
                </div>
                <span className={`badge ${c}`}>{v}</span>
              </div>
            ))}
          </div>
          {viewCount > 0 && (
            <div className="bg-purple-light border border-[#c4b5fd] rounded-lg px-[14px] py-[10px] mb-4">
              <div className="text-[12px] font-semibold text-purple mb-[2px]">
                Client opened this invoice
              </div>
              <div className="text-[11px] text-purple opacity-80">
                Last viewed:{" "}
                {inv.events.filter((e) => e.type === "viewed").pop()?.ts}
              </div>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="card">
          <div className="card-ttl">Activity Log</div>
          <div className="timeline">
            {[...inv.events].reverse().map((ev, i: number) => (
              <div key={i} className="tl-item">
                <div
                  className={`tl-dot ${
                    ev.type === "paid" ? "done" : i === 0 ? "active" : ""
                  }`}
                >
                  <Icon
                    n={iconMap[ev.type] || "activity"}
                    s={11}
                    c={
                      ev.type === "paid"
                        ? "var(--g)"
                        : i === 0
                        ? "var(--bl)"
                        : "var(--tx3)"
                    }
                  />
                </div>
                <div>
                  <div className="tl-lbl capitalize">
                    {ev.type.replace("_", " ")}
                  </div>
                  <div className="tl-ts">{ev.ts}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="card h-fit">
        <div className="card-ttl">Invoice Status</div>
        <div className="timeline">
          {[
            { label: "Draft", done: true, active: inv.status === "draft" },
            {
              label: "Sent",
              done: ["sent", "viewed", "overdue", "paid"].includes(inv.status),
              active: inv.status === "sent",
            },
            {
              label: "Viewed",
              done: ["viewed", "paid"].includes(inv.status) || viewCount > 0,
              active: inv.status === "viewed",
            },
            { label: "Paid", done: inv.status === "paid", active: false },
          ].map((st, i) => (
            <div key={i} className="tl-item">
              <div
                className={`tl-dot ${st.done ? "done" : ""} ${
                  st.active ? "active" : ""
                }`}
              >
                {st.done ? (
                  <Icon n="check" s={10} c="var(--g)" />
                ) : (
                  <div className="w-[5px] h-[5px] rounded-full bg-bd2" />
                )}
              </div>
              <div>
                <div
                  className={`tl-lbl ${
                    st.done || st.active
                      ? "text-tx font-semibold"
                      : "text-tx3 font-normal"
                  }`}
                >
                  {st.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
