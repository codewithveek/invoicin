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
        callbackURL: "/",
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
        callbackURL: "/",
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
      <div className="min-h-screen flex items-center justify-center bg-bg font-sans p-5">
        <div className="bg-sf rounded-[14px] border border-bd shadow-md px-9 py-10 max-w-[400px] w-full text-center">
          <div className="w-10 h-10 rounded-[11px] bg-brand inline-flex items-center justify-center text-[16px] font-[800] text-white mb-4">
            I
          </div>
          <h1 className="text-[22px] font-[800] text-tx tracking-[-0.03em] mb-1.5">
            Check your email
          </h1>
          <p className="text-[13px] text-tx2 mb-6 leading-relaxed">
            We sent a sign-in link to <strong>{email}</strong>. Click the link
            in the email to sign in.
          </p>
          <button
            className="bg-transparent border-0 text-brand text-[13px] font-semibold cursor-pointer mt-4 font-sans"
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
    <div className="min-h-screen flex items-center justify-center bg-bg font-sans p-5">
      <div className="bg-sf rounded-[14px] border border-bd shadow-md px-9 py-10 max-w-[400px] w-full text-center">
        <div className="w-10 h-10 rounded-[11px] bg-brand inline-flex items-center justify-center text-[16px] font-[800] text-white mb-4">
          I
        </div>
        <h1 className="text-[22px] font-[800] text-tx tracking-[-0.03em] mb-1.5">
          Sign in to Invoicin
        </h1>
        <p className="text-[13px] text-tx2 mb-6 leading-relaxed">
          Manage invoices, track payments, and grow your freelance business.
        </p>

        <button
          className={`w-full px-4 py-[10px] rounded-[10px] border border-bd bg-sf cursor-pointer text-[14px] font-semibold text-tx flex items-center justify-center gap-[10px] font-sans transition-opacity ${
            anyLoading
              ? "opacity-60 cursor-not-allowed pointer-events-none"
              : ""
          }`}
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
          {googleLoading ? "Redirectingâ€¦" : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-bd" />
          <span className="text-[12px] text-tx3 uppercase tracking-[0.05em]">
            or
          </span>
          <span className="flex-1 h-px bg-bd" />
        </div>

        <form onSubmit={handleMagicLink}>
          <label className="block text-left text-[12px] font-semibold text-tx2 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-3"
            required
          />
          {error && (
            <p className="text-[12px] text-red mb-2 text-left">{error}</p>
          )}
          <button
            type="submit"
            className={`btn bp btn-full btn-lg ${
              anyLoading
                ? "opacity-60 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            disabled={anyLoading}
          >
            {loading && <Icon n="spin" s={16} c="#fff" />}
            {loading ? "Sendingâ€¦" : "Send magic link"}
          </button>
        </form>

        <p className="text-[11px] text-tx3 mt-5">
          By signing in, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
