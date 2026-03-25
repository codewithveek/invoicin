import type { ReactNode } from "react";
import "../index.css";
import { AppProvider } from "~/context/AppContext";
import ErrorBoundary from "~/components/shared/ErrorBoundary";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

// All routes are auth-aware and personalised — disable static generation.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoicin",
  description: "Professional invoicing for freelancers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.className} ${dmSans.style.fontFamily}`}
    >
      <body>
        <ErrorBoundary>
          <AppProvider>{children}</AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
