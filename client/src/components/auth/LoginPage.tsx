import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import Icon from "../shared/Icon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const anyLoading = loading || googleLoading;

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch {
      setError("Failed to start Google sign-in");
      setGoogleLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: "/onboarding",
      });
      if (err) {
        setError(err.message ?? "Failed to send magic link");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.mark}>I</div>
          <h1 style={styles.title}>Check your email</h1>
          <p style={styles.subtitle}>
            We sent a sign-in link to <strong>{email}</strong>. Click the link
            in the email to sign in.
          </p>
          <button
            style={styles.linkBtn}
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.mark}>I</div>
        <h1 style={styles.title}>Sign in to InvoiceApp</h1>
        <p style={styles.subtitle}>
          Manage invoices, track payments, and grow your freelance business.
        </p>

        <button
          style={{
            ...styles.googleBtn,
            ...(anyLoading ? styles.disabled : {}),
          }}
          onClick={handleGoogle}
          disabled={anyLoading}
        >
          {googleLoading ? (
            <Icon n="spin" s={18} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <form onSubmit={handleMagicLink}>
          <label style={styles.label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(anyLoading ? styles.disabled : {}),
            }}
            disabled={anyLoading}
          >
            {loading && <Icon n="spin" s={16} c="#fff" />}
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>

        <p style={styles.footer}>
          By signing in, you agree to our terms and privacy policy.
        </p>
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
    maxWidth: 400,
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
  googleBtn: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "var(--r)",
    border: "1px solid var(--bd)",
    background: "var(--sf)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--tx)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily: "var(--fn)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--bd)",
  },
  dividerText: {
    fontSize: 12,
    color: "var(--tx3)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  label: {
    display: "block",
    textAlign: "left" as const,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--tx2)",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "var(--r)",
    border: "1px solid var(--bd)",
    fontSize: 14,
    fontFamily: "var(--fn)",
    outline: "none",
    marginBottom: 12,
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    pointerEvents: "none" as const,
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "var(--g)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 16,
    fontFamily: "var(--fn)",
  },
  footer: {
    fontSize: 11,
    color: "var(--tx3)",
    marginTop: 20,
  },
};
