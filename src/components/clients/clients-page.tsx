"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  user: { email: string; emailVerifiedAt: Date | null } | null;
};

export function ClientsPage({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (res.ok) {
      toast.success("Client created — verification email sent if login was provided");
      setShowForm(false);
      e.currentTarget.reset();
      router.refresh();
    } else {
      toast.error("Failed to create client");
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add wholesale client"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div><Label>Organization name</Label><Input name="name" required /></div>
            <div><Label>Phone</Label><Input name="phone" /></div>
            <div><Label>Email</Label><Input name="email" type="email" /></div>
            <div><Label>Address</Label><Input name="address" /></div>
            <div className="sm:col-span-2 border-t border-border pt-4">
              <p className="text-sm font-semibold text-accent mb-2">Portal login (email verification required)</p>
            </div>
            <div><Label>Login email</Label><Input name="loginEmail" type="email" /></div>
            <div><Label>Login password</Label><Input name="loginPassword" type="password" minLength={8} /></div>
            <div className="sm:col-span-2"><Button type="submit">Create client</Button></div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {initialClients.map((c) => (
          <Card key={c.id}>
            <p className="font-bold">{c.name}</p>
            <p className="text-sm text-muted mt-1">Wholesale · {c.phone ?? "—"}</p>
            <p className="text-sm text-muted">{c.email ?? "—"}</p>
            {c.user && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-muted">Portal: {c.user.email}</p>
                <Badge status={c.user.emailVerifiedAt ? "ok" : "pending"}>
                  {c.user.emailVerifiedAt ? "verified" : "pending"}
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
