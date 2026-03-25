import type { ReactNode } from "react";
import "../index.css";
import { AppProvider } from "~/context/AppContext";
import ErrorBoundary from "~/components/shared/ErrorBoundary";

// All routes are auth-aware and personalised — disable static generation.
export const dynamic = "force-dynamic";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata = {
  title: "Invoicin",
  description: "Professional invoicing for freelancers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppProvider>{children}</AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
