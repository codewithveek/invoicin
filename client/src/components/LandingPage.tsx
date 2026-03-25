"use client";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Tiny reusable SVG icons (subset of app icon set)                   */
/* ------------------------------------------------------------------ */
function Ico({
  d,
  s = 20,
  c = "currentColor",
}: {
  d: string;
  s?: number;
  c?: string;
}) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const icons = {
  check: "M20 6 9 17l-5-5",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  send: "M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8",
  globe:
    "M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  menu: "M3 12h18 M3 6h18 M3 18h18",
};

/* ------------------------------------------------------------------ */
/*  Section: Navbar                                                     */
/* ------------------------------------------------------------------ */
function Navbar({
  onLogin,
  onGetStarted,
}: {
  onLogin: () => void;
  onGetStarted: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-sf border-b border-bd backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-auto">
          <div className="w-8 h-8 rounded-sm bg-brand flex items-center justify-center text-white font-extrabold text-sm select-none">
            I
          </div>
          <span className="text-[15px] font-extrabold text-tx tracking-[-0.03em]">
            Invoicin
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {["Features", "How it works", "Pricing"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3 py-1.5 text-[13px] font-medium text-tx2 rounded-sm hover:bg-sf2 hover:text-tx transition-all duration-120"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogin}
            className="hidden sm:flex items-center px-4 py-1.75 text-[13px] font-semibold text-tx2 bg-transparent border border-bd rounded-sm hover:border-bd2 hover:text-tx transition-all duration-120 cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-1.5 px-4 py-1.75 text-[13px] font-semibold text-white bg-brand rounded-sm shadow-(--shadow-sm) hover:bg-[#15803d] transition-all duration-120 cursor-pointer"
          >
            Get started
            <Ico d={icons.arrow} s={14} c="white" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Hero                                                       */
/* ------------------------------------------------------------------ */
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="bg-bg pt-20 pb-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — copy */}
          <div className="flex-1 max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-brand-light border border-brand-mid text-brand-dark text-[11px] font-semibold tracking-[0.04em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
              Free to get started
            </div>

            <h1 className="text-[42px] sm:text-[52px] font-extrabold text-tx leading-[1.1] tracking-[-0.03em] mb-5">
              Invoice smarter,{" "}
              <span className="text-brand">get paid faster</span>
            </h1>

            <p className="text-[16px] text-tx2 leading-[1.7] mb-8 max-w-lg">
              Invoicin is the all-in-one invoicing platform for freelancers and
              small businesses. Create beautiful invoices, track payments,
              manage clients, and grow your business — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-5 py-3 text-[14px] font-semibold text-white bg-brand rounded-md shadow-(--shadow-md) hover:bg-[#15803d] transition-all duration-120 cursor-pointer"
              >
                Start for free
                <Ico d={icons.arrow} s={16} c="white" />
              </button>
              <a
                href="#features"
                className="flex items-center gap-2 px-5 py-3 text-[14px] font-semibold text-tx2 bg-sf border border-bd rounded-md shadow-(--shadow-sm) hover:border-bd2 transition-all duration-120"
              >
                See features
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5 mt-8 text-[12px] text-tx3 font-medium">
              {[
                "No credit card required",
                "Free forever plan",
                "Cancel anytime",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Ico d={icons.check} s={13} c="var(--color-brand)" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — invoice card mock */}
          <div className="shrink-0 w-full max-w-90 animate-float">
            <InvoiceMockCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Invoice mock-up card (matches actual app's .inv-card design)       */
/* ------------------------------------------------------------------ */
function InvoiceMockCard() {
  return (
    <div className="rounded-2xl border border-bd shadow-(--shadow-lg) overflow-hidden bg-sf">
      {/* Green gradient header — mirrors .inv-hd */}
      <div className="px-6 py-5 relative overflow-hidden bg-[linear-gradient(135deg,#14532d_0%,#16a34a_100%)]">
        {/* Decorative circle overlay */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none bg-white/[0.06]" />
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <p className="text-[11px] text-white/60 font-medium uppercase tracking-[0.07em] mb-0.5">
              Invoice
            </p>
            <p className="text-[13px] font-semibold text-white/90 font-mono">
              #INV-2024-0047
            </p>
          </div>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
            Sent
          </span>
        </div>
        <div className="relative z-10">
          <p className="text-[11px] text-white/55 uppercase tracking-[0.07em] mb-1">
            Amount due
          </p>
          <p className="text-[34px] font-extrabold text-white leading-none tracking-[-0.04em] font-mono">
            $4,200<span className="text-[20px] text-white/60">.00</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <MockRow label="From" value="Alex Johnson" sub="alex@studio.co" />
        <MockRow label="To" value="Acme Corp" sub="billing@acme.com" />
        <div className="border-t border-bd pt-3 space-y-2">
          <MockLineItem desc="Brand Identity Design" amt="$2,400.00" />
          <MockLineItem desc="Website Redesign (50%)" amt="$1,800.00" />
          <div className="flex justify-between text-[12px] font-semibold text-tx pt-1 border-t border-bd">
            <span>Total</span>
            <span className="font-mono text-brand-dark">$4,200.00</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="w-2 h-2 rounded-full bg-brand" />
          <span className="text-[11px] text-tx3">
            Due <b className="text-tx2">Mar 31, 2026</b>
          </span>
        </div>
      </div>
    </div>
  );
}

function MockRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-tx3 uppercase tracking-[0.07em] font-bold w-8">
        {label}
      </span>
      <div className="text-right">
        <p className="text-[12px] font-semibold text-tx">{value}</p>
        <p className="text-[11px] text-tx3">{sub}</p>
      </div>
    </div>
  );
}

function MockLineItem({ desc, amt }: { desc: string; amt: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-tx2">{desc}</span>
      <span className="font-mono font-medium text-tx">{amt}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Stats strip                                                */
/* ------------------------------------------------------------------ */
function StatsStrip() {
  const stats = [
    { val: "10k+", label: "Invoices created" },
    { val: "$2M+", label: "Payments tracked" },
    { val: "1,200+", label: "Freelancers" },
    { val: "99.9%", label: "Uptime" },
  ];
  return (
    <section className="bg-sf border-y border-bd">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.val} className="text-center">
            <p className="text-[28px] font-extrabold text-tx tracking-[-0.04em] font-mono">
              {s.val}
            </p>
            <p className="text-[12px] text-tx3 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Features                                                   */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: icons.file,
    title: "Professional invoices",
    desc: "Generate PDF invoices in seconds. Standard, proforma, deposit and credit note types — all beautifully formatted.",
    color: "var(--color-brand)",
    bg: "var(--color-brand-light)",
  },
  {
    icon: icons.send,
    title: "Send via email",
    desc: "Deliver invoices and payment reminders directly to your clients' inbox. Track when they open and view them.",
    color: "var(--color-blue)",
    bg: "var(--color-blue-light)",
  },
  {
    icon: icons.users,
    title: "Client management",
    desc: "Keep all your clients organised in one place with contact details, billing addresses and invoice history.",
    color: "var(--color-purple)",
    bg: "var(--color-purple-light)",
  },
  {
    icon: icons.dollar,
    title: "Multi-currency",
    desc: "Bill clients in their local currency. Support for VAT, WHT and custom tax rates with automatic calculations.",
    color: "var(--color-teal)",
    bg: "var(--color-teal-light)",
  },
  {
    icon: icons.globe,
    title: "Public invoice links",
    desc: "Share a unique, branded link so clients can view and download invoices without signing in.",
    color: "var(--color-amber)",
    bg: "var(--color-amber-light)",
  },
  {
    icon: icons.clock,
    title: "Status tracking",
    desc: "Follow every invoice from draft → sent → viewed → paid. Get alerted the moment a payment goes overdue.",
    color: "var(--color-red)",
    bg: "var(--color-red-light)",
  },
];

function Features() {
  return (
    <section id="features" className="bg-bg py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Features"
          heading="Everything you need to run your freelance business"
          sub="Invoicin packs professional invoicing, client management, and payment tracking into a clean, fast workspace."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-sf border border-bd rounded-lg p-5 shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-all duration-180"
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center mb-4"
                style={{ background: f.bg }}
              >
                <Ico d={f.icon} s={18} c={f.color} />
              </div>
              <h3 className="text-[14px] font-bold text-tx mb-2 tracking-[-0.02em]">
                {f.title}
              </h3>
              <p className="text-[13px] text-tx2 leading-[1.65]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: How it works                                               */
/* ------------------------------------------------------------------ */
const steps = [
  {
    n: "01",
    title: "Create your account",
    desc: "Sign in with Google or a magic link — no password required. You're ready in seconds.",
  },
  {
    n: "02",
    title: "Add your clients",
    desc: "Import or manually add client details. Store everything in one searchable directory.",
  },
  {
    n: "03",
    title: "Send your first invoice",
    desc: "Fill in line items, choose currency and tax, hit send. Your client gets a professional PDF instantly.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-sf py-20 px-6 border-y border-bd">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="How it works"
          heading="Up and running in minutes"
          sub="Three simple steps to go from zero to sending professional invoices."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-7 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-bd" />

          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative flex flex-col items-start"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Step dot */}
              <div className="w-14 h-14 rounded-full border-2 border-bd bg-sf flex items-center justify-center mb-5 relative z-10 shadow-(--shadow-sm)">
                <span className="text-[13px] font-extrabold text-brand font-mono">
                  {s.n}
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-tx mb-2 tracking-[-0.02em]">
                {s.title}
              </h3>
              <p className="text-[13px] text-tx2 leading-[1.65]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Pricing                                                    */
/* ------------------------------------------------------------------ */
const planFeatures = {
  free: [
    "Unlimited invoices",
    "Up to 5 clients",
    "PDF export",
    "Public invoice links",
    "Status tracking",
    "Multi-currency support",
  ],
  pro: [
    "Everything in Free",
    "Unlimited clients",
    "Email delivery & reminders",
    "Invoice templates",
    "VAT / WHT tax rates",
    "Priority support",
  ],
};

function Pricing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="pricing" className="bg-bg py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Pricing"
          heading="Simple, transparent pricing"
          sub="Start free and upgrade only when you need to. No surprises."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free plan */}
          <PricingCard
            name="Free"
            price="$0"
            period="forever"
            desc="Perfect for freelancers getting started."
            features={planFeatures.free}
            cta="Get started free"
            highlight={false}
            onCta={onGetStarted}
          />
          {/* Pro plan */}
          <PricingCard
            name="Pro"
            price="$9"
            period="per month"
            desc="Serious freelancers and small agencies."
            features={planFeatures.pro}
            cta="Start Pro trial"
            highlight={true}
            onCta={onGetStarted}
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  period,
  desc,
  features,
  cta,
  highlight,
  onCta,
}: {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
  onCta: () => void;
}) {
  return (
    <div
      className={`rounded-lg border p-6 flex flex-col shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-all duration-180 ${
        highlight
          ? "bg-brand-dark border-brand text-white"
          : "bg-sf border-bd text-tx"
      }`}
    >
      {highlight && (
        <span className="self-start mb-3 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
          Most popular
        </span>
      )}
      <p
        className={`text-[13px] font-semibold mb-1 ${
          highlight ? "text-white/70" : "text-tx2"
        }`}
      >
        {name}
      </p>
      <p className="text-[34px] font-extrabold tracking-[-0.04em] font-mono leading-none">
        {price}
        <span
          className={`text-[14px] font-medium ml-1 ${
            highlight ? "text-white/60" : "text-tx3"
          }`}
        >
          /{period}
        </span>
      </p>
      <p
        className={`text-[13px] mt-2 mb-5 ${
          highlight ? "text-white/70" : "text-tx2"
        }`}
      >
        {desc}
      </p>
      <ul className="flex-1 space-y-2.5 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px]">
            <Ico
              d={icons.check}
              s={14}
              c={highlight ? "#86efac" : "var(--color-brand)"}
            />
            <span className={highlight ? "text-white/90" : "text-tx2"}>
              {f}
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        className={`w-full py-2.5 rounded-sm text-[13px] font-semibold transition-all duration-120 cursor-pointer ${
          highlight
            ? "bg-brand text-white hover:bg-[#15803d]"
            : "bg-brand-light text-brand-dark hover:bg-[#bbf7d0]"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Testimonials                                               */
/* ------------------------------------------------------------------ */
const testimonials = [
  {
    quote:
      "Invoicin cut my billing time in half. I send invoices in seconds and clients actually pay faster because the payment link is right there.",
    name: "Sarah K.",
    role: "UX Designer",
    initial: "S",
  },
  {
    quote:
      "Finally an invoicing tool that doesn't feel like accounting software. Clean, fast, and the multi-currency support is a lifesaver for international clients.",
    name: "Mark O.",
    role: "Freelance Developer",
    initial: "M",
  },
  {
    quote:
      "I love that I can track when a client has viewed the invoice. No more awkward 'did you receive it?' emails.",
    name: "Priya R.",
    role: "Brand Consultant",
    initial: "P",
  },
];

function Testimonials() {
  return (
    <section className="bg-sf py-20 px-6 border-t border-bd">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Testimonials"
          heading="Freelancers love Invoicin"
          sub="We're on a mission to make billing the least painful part of running your business."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-sf2 border border-bd rounded-lg p-5"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ico key={i} d={icons.star} s={13} c="var(--color-amber)" />
                ))}
              </div>
              <p className="text-[13px] text-tx2 leading-[1.7] mb-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-[12px] font-bold">
                  {t.initial}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-tx">{t.name}</p>
                  <p className="text-[11px] text-tx3">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Final CTA                                                  */
/* ------------------------------------------------------------------ */
function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="bg-bg py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-[20px] border border-bd overflow-hidden relative bg-[linear-gradient(135deg,#14532d_0%,#16a34a_100%)]">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none bg-white/[0.04]" />

          <div className="relative z-10 px-8 py-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-mid mb-3">
              Get started today
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-extrabold text-white tracking-[-0.03em] leading-[1.1] mb-4">
              Ready to get paid on time?
            </h2>
            <p className="text-[14px] text-white/70 mb-8 max-w-md mx-auto leading-[1.7]">
              Join over 1,200 freelancers using Invoicin to send professional
              invoices and grow their business. Free forever.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-brand-dark bg-white rounded-md shadow-(--shadow-md) hover:bg-brand-light transition-all duration-120 cursor-pointer"
            >
              Create your free account
              <Ico d={icons.arrow} s={16} c="var(--color-brand-dark)" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="bg-sf border-t border-bd px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-brand flex items-center justify-center text-white font-extrabold text-[12px]">
            I
          </div>
          <span className="text-[13px] font-extrabold text-tx tracking-[-0.02em]">
            Invoicin
          </span>
          <span className="text-[12px] text-tx3 ml-2">
            v1.0 · Free plan available
          </span>
        </div>
        <p className="text-[12px] text-tx3">
          © {new Date().getFullYear()} Invoicin. Built for freelancers.
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared: Section header                                              */
/* ------------------------------------------------------------------ */
function SectionHeader({
  eyebrow,
  heading,
  sub,
}: {
  eyebrow: string;
  heading: string;
  sub: string;
}) {
  return (
    <div className="text-center mb-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand mb-3">
        {eyebrow}
      </p>
      <h2 className="text-[28px] sm:text-[34px] font-extrabold text-tx tracking-[-0.03em] leading-[1.1] mb-4 max-w-xl mx-auto">
        {heading}
      </h2>
      <p className="text-[15px] text-tx2 max-w-lg mx-auto leading-[1.7]">
        {sub}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page entry                                                          */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const router = useRouter();
  const goLogin = () => router.push("/login");

  return (
    <div className="font-sans bg-bg min-h-screen overflow-y-auto">
      <Navbar onLogin={goLogin} onGetStarted={goLogin} />
      <Hero onGetStarted={goLogin} />
      <StatsStrip />
      <Features />
      <HowItWorks />
      <Pricing onGetStarted={goLogin} />
      <Testimonials />
      <CTASection onGetStarted={goLogin} />
      <Footer />
    </div>
  );
}
