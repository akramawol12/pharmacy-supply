"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Supplier = {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  _count: { medicines: number };
  user: { email: string; emailVerifiedAt: Date | null } | null;
};

export function SuppliersPage({
  isAdmin,
  initialSuppliers,
}: {
  isAdmin: boolean;
  initialSuppliers: Supplier[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (res.ok) {
      toast.success("Supplier created — verification email sent if portal login was set");
      setShowForm(false);
      e.currentTarget.reset();
      router.refresh();
    } else {
      toast.error("Failed to create supplier");
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add supplier"}
          </Button>
        </div>
      )}

      {showForm && isAdmin && (
        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company name</Label><Input name="name" required /></div>
            <div><Label>Contact person</Label><Input name="contact" /></div>
            <div><Label>Phone</Label><Input name="phone" /></div>
            <div><Label>Company email</Label><Input name="email" type="email" /></div>
            <div className="sm:col-span-2"><Label>Address</Label><Input name="address" /></div>
            <div className="sm:col-span-2 border-t border-border pt-4">
              <p className="text-sm font-semibold text-accent mb-2">Supplier portal login</p>
            </div>
            <div><Label>Login email</Label><Input name="loginEmail" type="email" /></div>
            <div><Label>Login password</Label><Input name="loginPassword" type="password" minLength={8} /></div>
            <div className="sm:col-span-2"><Button type="submit">Create supplier</Button></div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {initialSuppliers.map((s) => (
          <Card key={s.id}>
            <p className="font-bold">{s.name}</p>
            <p className="text-sm text-muted">{s.contact} · {s.phone}</p>
            <p className="text-sm text-muted">{s.email}</p>
            <p className="mt-2 text-xs text-accent">{s._count.medicines} medicines linked</p>
            {s.user && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-muted">Portal: {s.user.email}</p>
                <Badge status={s.user.emailVerifiedAt ? "ok" : "pending"}>
                  {s.user.emailVerifiedAt ? "verified" : "pending"}
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
