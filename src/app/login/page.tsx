"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Pill, Building2, Users, Briefcase, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DEMO_ACCOUNTS, ROLE_HOME } from "@/config/app";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

type LoginTab = "internal" | "client" | "retailer" | "supplier";

const TABS: { id: LoginTab; label: string; icon: typeof Briefcase; hint: string }[] = [
  { id: "internal", label: "Internal", icon: Briefcase, hint: "Admin & staff" },
  { id: "client", label: "Wholesale", icon: Users, hint: "Hospitals & clinics" },
  { id: "retailer", label: "Retailer", icon: Store, hint: "Pharmacy shops & stores" },
  { id: "supplier", label: "Supplier", icon: Building2, hint: "Vendors & distributors" },
];

const TAB_DEFAULTS: Record<LoginTab, { email: string; password: string }> = {
  internal: DEMO_ACCOUNTS.internal,
  client: DEMO_ACCOUNTS.client,
  retailer: DEMO_ACCOUNTS.retailer,
  supplier: DEMO_ACCOUNTS.supplier,
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<LoginTab>("internal");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWith(email: string, password: string) {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setError(data.message);
          setInfo("Use the link sent to your email, or resend below.");
        } else {
          setError(data.message ?? "Invalid email or password");
        }
        return;
      }

      const dest =
        searchParams.get("callbackUrl") ??
        data.redirectTo ??
        (data.role ? ROLE_HOME[data.role as Role] : "/dashboard");

      window.location.href = dest;
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string).trim().toLowerCase();
    const password = form.get("password") as string;
    await signInWith(email, password);
  }

  async function demoSignIn() {
    const { email, password } = TAB_DEFAULTS[tab];
    await signInWith(email, password);
  }

  async function resendVerification() {
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) {
      setError("Enter your email first");
      return;
    }
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.ok) {
      setInfo(data.message + (data.verifyUrl ? ` Dev link: ${data.verifyUrl}` : ""));
      setError("");
    } else {
      setError(data.message);
    }
  }

  const demo = TAB_DEFAULTS[tab];

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-lg glow-accent">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Pill className="h-7 w-7" />
          </div>
          <div>
            <CardTitle>PharmaSupply</CardTitle>
            <CardDescription>Sign in · ETB · Email verified accounts only</CardDescription>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-lg bg-background p-1 border border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setError("");
                setInfo("");
              }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-2 py-2.5 text-xs font-medium transition-all",
                tab === t.id
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted mb-4">{TABS.find((t) => t.id === tab)?.hint}</p>

        <form onSubmit={onSubmit} className="space-y-4" key={tab}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={demo.email}
              placeholder={demo.email}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {info && <p className="text-sm text-accent">{info}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={loading}
            onClick={demoSignIn}
          >
            {loading ? "Signing in…" : "One-click demo sign in"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-xs text-muted">
          <button type="button" onClick={resendVerification} className="text-primary hover:underline">
            Resend verification email
          </button>
          <p>
            Demo password: <code className="text-accent">{demo.password}</code>
          </p>
        </div>
      </Card>
    </div>
  );
}
