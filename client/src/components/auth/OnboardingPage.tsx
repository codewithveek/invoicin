import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { userApi } from "../../api/user.api";
import { CURRENCIES, CURRENCY_NAMES } from "../../constants";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [homeCurrency, setHomeCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        navigate("/login", { replace: true });
        return;
      }
      // If already onboarded, go to dashboard
      const user = data.user as Record<string, unknown>;
      if (user.onboarded) {
        navigate("/", { replace: true });
        return;
      }
      // Prepopulate from Google auth
      if (data.user.name) setName(data.user.name);
      setLoading(false);
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await userApi.onboard({
        name: name.trim(),
        homeCurrency: homeCurrency || undefined,
      });
      navigate("/", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ color: "var(--tx2)" }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.mark}>I</div>
        <h1 style={styles.title}>Welcome to InvoiceApp</h1>
        <p style={styles.subtitle}>
          Let's get your account set up. This only takes a moment.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            style={styles.input}
            required
          />

          <label style={styles.label}>Home currency</label>
          <p style={styles.hint}>
            Your local currency for tracking earnings. Invoice currencies can
            differ — we'll convert totals so you see everything in one currency.
          </p>
          <select
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value)}
            style={styles.input}
          >
            <option value="">None (skip for now)</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c} — {CURRENCY_NAMES[c] ?? c}
              </option>
            ))}
          </select>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitBtn} disabled={submitting}>
            {submitting ? "Setting up…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    fontFamily: "var(--fn)",
    padding: 20,
  },
  card: {
    background: "var(--sf)",
    borderRadius: "var(--rl)",
    border: "1px solid var(--bd)",
    boxShadow: "var(--shm)",
    padding: "40px 36px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center" as const,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: "var(--g)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "var(--tx)",
    letterSpacing: "-0.03em",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "var(--tx2)",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    textAlign: "left" as const,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--tx2)",
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: "var(--tx3)",
    textAlign: "left" as const,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "var(--r)",
    border: "1px solid var(--bd)",
    fontSize: 14,
    fontFamily: "var(--fn)",
    outline: "none",
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    color: "var(--rd)",
    marginBottom: 8,
    textAlign: "left" as const,
  },
  submitBtn: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "var(--r)",
    border: "none",
    background: "var(--g)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--fn)",
    marginTop: 4,
  },
};
