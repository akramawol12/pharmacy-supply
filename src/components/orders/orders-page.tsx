"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceModal, type InvoiceOrder } from "@/components/invoice/invoice-modal";
import { OrderTimeline } from "./order-timeline";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  orderType: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  walkInName: string | null;
  createdAt: string;
  client: { name: string } | null;
  retailer: { name: string } | null;
  statusEvents: {
    status: string;
    note: string | null;
    userName: string | null;
    createdAt: string;
  }[];
  items: {
    quantity: number;
    unitPrice: number;
    subtotal: number;
    medicine: { name: string };
  }[];
};

type Medicine = { id: string; name: string; retailPrice: number; wholesalePrice: number; stockQuantity: number };

export function OrdersPage({
  initialOrders,
  initialMedicines,
}: {
  initialOrders: Order[];
  initialMedicines: Medicine[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrder | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lines, setLines] = useState<{ medicineId: string; quantity: number }[]>([
    { medicineId: "", quantity: 1 },
  ]);

  async function patchOrder(id: string, body: Record<string, string>) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.refresh();
      return true;
    }
    toast.error("Update failed");
    return false;
  }

  async function updateStatus(id: string, status: string) {
    if (await patchOrder(id, { status })) {
      toast.success(`Order marked as ${status.toLowerCase()}`);
    }
  }

  async function markPaid(id: string) {
    if (await patchOrder(id, { paymentStatus: "PAID" })) {
      toast.success("Marked as paid");
    }
  }

  async function createOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const items = lines.filter((l) => l.medicineId && l.quantity > 0);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderType: fd.get("orderType"),
        walkInName: fd.get("walkInName") || undefined,
        items,
      }),
    });
    if (res.ok) {
      const order = await res.json();
      toast.success("Order created", { description: order.orderNumber });
      setShowForm(false);
      setLines([{ medicineId: "", quantity: 1 }]);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to create order");
    }
  }

  const statusMap: Record<string, "pending" | "confirmed" | "fulfilled" | "cancelled"> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    FULFILLED: "fulfilled",
    CANCELLED: "cancelled",
  };

  const paymentMap: Record<string, "pending" | "confirmed" | "fulfilled" | "cancelled"> = {
    UNPAID: "pending",
    PARTIAL: "confirmed",
    PAID: "fulfilled",
  };

  return (
    <div>
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New sale order"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={createOrder} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Order type</Label>
                <Select name="orderType" required>
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                </Select>
              </div>
              <div>
                <Label>Walk-in / customer name</Label>
                <Input name="walkInName" placeholder="Optional for retail" />
              </div>
            </div>
            {lines.map((line, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <Select
                  value={line.medicineId}
                  onChange={(e) => {
                    const next = [...lines];
                    next[i].medicineId = e.target.value;
                    setLines(next);
                  }}
                >
                  <option value="">Select medicine</option>
                  {initialMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (stock: {m.stockQuantity})
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => {
                    const next = [...lines];
                    next[i].quantity = parseInt(e.target.value, 10);
                    setLines(next);
                  }}
                />
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={() => setLines([...lines, { medicineId: "", quantity: 1 }])}>
              + Add line
            </Button>
            <Button type="submit">Create order & invoice</Button>
          </form>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {initialOrders.length === 0 && (
          <EmptyState
            title="No orders yet"
            description="Create a manual sale or wait for client portal orders."
            actionLabel="New sale order"
            actionHref="#"
          />
        )}
        {initialOrders.map((o) => {
          const expanded = expandedId === o.id;
          return (
            <Card key={o.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{o.orderNumber}</p>
                  <p className="text-sm text-muted">
                    {o.client?.name ?? o.retailer?.name ?? o.walkInName ?? "Walk-in"} · {o.orderType} ·{" "}
                    {formatDate(o.createdAt)}
                  </p>
                  <ul className="mt-2 text-sm text-muted">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        {it.medicine.name} × {it.quantity} @ {formatCurrency(it.unitPrice)}
                      </li>
                    ))}
                  </ul>
                  {expanded && <OrderTimeline events={o.statusEvents} />}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent">{formatCurrency(o.totalAmount)}</p>
                  <div className="flex flex-wrap gap-1 justify-end mt-1">
                    <Badge status={statusMap[o.status] ?? "pending"}>{o.status.toLowerCase()}</Badge>
                    <Badge status={paymentMap[o.paymentStatus] ?? "pending"}>
                      {o.paymentStatus.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="ghost"
                      className="text-xs px-2 py-1"
                      onClick={() => setExpandedId(expanded ? null : o.id)}
                    >
                      {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      Timeline
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs px-2 py-1"
                      onClick={() =>
                        setInvoiceOrder({
                          ...o,
                          paymentStatus: o.paymentStatus,
                        })
                      }
                    >
                      <FileText className="h-3 w-3" />
                      Invoice
                    </Button>
                    {o.paymentStatus !== "PAID" && o.status === "FULFILLED" && (
                      <Button className="text-xs px-2 py-1" onClick={() => markPaid(o.id)}>
                        Mark paid
                      </Button>
                    )}
                    {o.status === "PENDING" && (
                      <Button variant="primary" className="text-xs px-2 py-1" onClick={() => updateStatus(o.id, "CONFIRMED")}>
                        Confirm
                      </Button>
                    )}
                    {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                      <Button className="text-xs px-2 py-1" onClick={() => updateStatus(o.id, "FULFILLED")}>
                        Fulfill
                      </Button>
                    )}
                    {o.status !== "CANCELLED" && o.status !== "FULFILLED" && (
                      <Button variant="danger" className="text-xs px-2 py-1" onClick={() => updateStatus(o.id, "CANCELLED")}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
