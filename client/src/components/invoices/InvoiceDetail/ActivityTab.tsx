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
    <div
      className="two-col"
      style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
    >
      <div>
        {/* Tracking stats */}
        <div className="card mb4">
          <div className="card-ttl">Tracking</div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
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
                style={{
                  background: "var(--sf2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  flex: 1,
                  minWidth: 80,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--tx3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 4,
                  }}
                >
                  {l}
                </div>
                <span className={`badge ${c}`}>{v}</span>
              </div>
            ))}
          </div>
          {viewCount > 0 && (
            <div
              style={{
                background: "var(--pult)",
                border: "1px solid #c4b5fd",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--pu)",
                  marginBottom: 2,
                }}
              >
                Client opened this invoice
              </div>
              <div style={{ fontSize: 11, color: "var(--pu)", opacity: 0.8 }}>
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
                  <div
                    className="tl-lbl"
                    style={{ textTransform: "capitalize" }}
                  >
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
      <div className="card" style={{ height: "fit-content" }}>
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
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--bd2)",
                    }}
                  />
                )}
              </div>
              <div>
                <div
                  className="tl-lbl"
                  style={{
                    color: st.done
                      ? "var(--tx)"
                      : st.active
                      ? "var(--tx)"
                      : "var(--tx3)",
                    fontWeight: st.done || st.active ? 600 : 400,
                  }}
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
