export const styles = {
  body: {
    backgroundColor: "#f4f6f4",
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    margin: 0,
  },
  container: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "32px 16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    // overflow: hidden removed — Outlook ignores it and it causes rendering bugs
    border: "1px solid #dde8de",
  },
  header: {
    // linear-gradient removed — not supported in Outlook
    // backgroundColor is the Outlook fallback; the gradient is gone entirely
    // If you want gradient, it must be done via a background image (VML hack)
    backgroundColor: "#14532d",
    padding: "28px 28px 24px",
  },
  headerBadge: {
    // display: inline-block removed — unreliable in Outlook
    // React Email's <Text> renders as a block; use it as a pill with fixed width or let it be block-level
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.05em",
    marginBottom: 12,
    // margin auto won't center in Outlook — wrap in a Section with align if centering is needed
  },
  headerName: {
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    margin: 0,
  },
  amtLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    margin: "16px 0 4px",
  },
  amtBig: {
    fontSize: 36,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "monospace",
    letterSpacing: "-0.04em",
    margin: 0,
  },
  amtSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "monospace",
    margin: "4px 0 0",
  },
  body_pad: {
    // Padding split into longhands — Outlook respects these more reliably
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 28,
    paddingRight: 28,
  },
  row: {
    // flex/justifyContent removed — layout now handled by Row/Column
    paddingTop: 7,
    paddingBottom: 7,
    borderBottom: "1px solid #dde8de",
  },
  label: {
    fontSize: 12,
    color: "#8aab90",
    fontWeight: 500,
    margin: 0,
  },
  value: {
    fontSize: 12,
    color: "#111d13",
    fontWeight: 600,
    textAlign: "right" as const,
    margin: 0,
  },
  itemsBox: {
    backgroundColor: "#f0f4f1",
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  itemRow: {
    // flex/justifyContent removed — layout now handled by Row/Column
    fontSize: 12,
    paddingTop: 4,
    paddingBottom: 4,
    color: "#4a6350",
    // borderBottom removed — now handled by <Hr> between rows in the template
  },
  totalRow: {
    // flex/justifyContent removed — layout now handled by Row/Column
    fontSize: 13,
    fontWeight: 700,
    color: "#111d13",
    paddingTop: 8,
    marginTop: 6,
    borderTop: "1.5px solid #dde8de",
  },
  cta: {
    backgroundColor: "#16a34a",
    color: "#fff",
    borderRadius: 9,
    // padding as shorthand is fine for Button — react.email handles the table wrapper
    padding: "13px 28px",
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    // display: inline-block removed — Button handles its own rendering
    marginTop: 20,
  },
  footer: {
    textAlign: "center" as const,
    marginTop: 24,
    fontSize: 11,
    color: "#8aab90",
  },
  stamp: {
    // display: flex / alignItems / gap removed — now a Row/Column in the template
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#f0f4f1",
    borderTop: "1.5px solid #bbf7d0",
  },

  notesBox: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#f0f4f1",
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: "#4a6350",
    lineHeight: "1.6",
    margin: 0,
  },
  // Fixed-width label column — prevents right-side values from misaligning
  labelCol: {
    width: 80,
  },
};
