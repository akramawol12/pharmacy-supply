import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaSupply Pro — Pharmacy Management",
  description: "Professional wholesale and retail pharmacy supply management",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "PharmaSupply" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
