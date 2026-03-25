"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { userApi } from "../../api/user.api";
import { CURRENCIES, CURRENCY_NAMES } from "../../constants";
import Icon from "../shared/Icon";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [homeCurrency, setHomeCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace("/login");
        return;
      }
      const user = data.user as Record<string, unknown>;
      if (user.onboarded) {
        router.replace("/app");
        return;
      }
      if (data.user.name) setName(data.user.name);
      setLoading(false);
    });
  }, [router]);

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
      router.replace("/app");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg font-sans p-5">
        <div className="bg-sf rounded-[14px] border border-bd shadow-md px-9 py-10 max-w-[420px] w-full text-center">
          <Icon n="spin" s={24} c="var(--color-brand)" />
          <p className="text-tx2 mt-3">Loadingâ€¦</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg font-sans p-5">
      <div className="bg-sf rounded-[14px] border border-bd shadow-md px-9 py-10 max-w-[420px] w-full text-center">
        <div className="w-10 h-10 rounded-[11px] bg-brand inline-flex items-center justify-center text-[16px] font-[800] text-white mb-4">
          I
        </div>
        <h1 className="text-[22px] font-[800] text-tx tracking-[-0.03em] mb-1.5">
          Welcome to Invoicin
        </h1>
        <p className="text-[13px] text-tx2 mb-6 leading-relaxed">
          Let's get your account set up. This only takes a moment.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block text-left text-[12px] font-semibold text-tx2 mb-1.5">
            Full name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="mb-4"
            required
          />

          <label className="block text-left text-[12px] font-semibold text-tx2 mb-1.5">
            Home currency
          </label>
          <p className="text-[11px] text-tx3 text-left mb-2 leading-[1.5]">
            Your local currency for tracking earnings. Invoice currencies can
            differ â€” we'll convert totals so you see everything in one
            currency.
          </p>
          <select
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value)}
            className="mb-4"
          >
            <option value="">None (skip for now)</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c} â€” {CURRENCY_NAMES[c] ?? c}
              </option>
            ))}
          </select>

          {error && (
            <p className="text-[12px] text-red mb-2 text-left">{error}</p>
          )}

          <button
            type="submit"
            className={`btn bp btn-full btn-lg ${
              submitting
                ? "opacity-60 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            disabled={submitting}
          >
            {submitting && <Icon n="spin" s={16} c="#fff" />}
            {submitting ? "Setting upâ€¦" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
