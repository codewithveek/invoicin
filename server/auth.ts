import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // In production, use Resend to send the magic link email.
        // For development, log the link to the console.
        if (process.env.RESEND_API_KEY) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "Invoicin <auth@invoicin.pro>",
            to: email,
            subject: "Sign in to Invoicin",
            html: `
              <div style="font-family:sans-serif;max-width:460px;margin:0 auto;padding:32px">
                <h2 style="color:#14532d;margin-bottom:8px">Sign in to Invoicin</h2>
                <p style="color:#555;line-height:1.6">Click the button below to sign in. This link expires in 10 minutes.</p>
                <a href="${url}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                  Sign In
                </a>
                <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          });
        } else {
          console.log(`[Magic Link] ${email}: ${url}`);
        }
      },
    }),
  ],
  user: {
    additionalFields: {
      businessName: { type: "string", required: false },
      address: { type: "string", required: false },
      phone: { type: "string", required: false },
      logoUrl: { type: "string", required: false },
      defaultCurrency: { type: "string", required: false, defaultValue: "USD" },
      homeCurrency: { type: "string", required: false },
      defaultTerms: { type: "string", required: false, defaultValue: "Net 14" },
      defaultNotes: { type: "string", required: false },
      plan: { type: "string", required: false, defaultValue: "free" },
      onboarded: { type: "boolean", required: false, defaultValue: false },
    },
  },
  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:5173"],
});
