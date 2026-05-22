"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";

export type InvoiceOrder = {
  orderNumber: string;
  orderType: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  walkInName: string | null;
  client: { name: string } | null;
  retailer?: { name: string } | null;
  items: {
    quantity: number;
    unitPrice: number;
    subtotal: number;
    medicine: { name: string };
  }[];
};

export function InvoiceModal({
  order,
  onClose,
}: {
  order: InvoiceOrder;
  onClose: () => void;
}) {
  function print() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 no-print" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-2xl print:shadow-none print:border-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6 no-print">
          <h2 className="text-xl font-bold">Invoice</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="invoice-print">
          <div className="border-b border-border pb-4 mb-6">
            <p className="text-2xl font-bold text-accent">PharmaSupply</p>
            <p className="text-sm text-muted">Pharmacy Supply Management</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-muted">Invoice #</p>
              <p className="font-bold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted">Date</p>
              <p className="font-bold">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted">Customer</p>
              <p className="font-bold">
                {order.client?.name ?? order.retailer?.name ?? order.walkInName ?? "Walk-in"}
              </p>
            </div>
            <div>
              <p className="text-muted">Type</p>
              <p className="font-bold capitalize">{order.orderType.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-muted">Payment</p>
              <p className="font-bold capitalize">
                {(order.paymentStatus ?? "UNPAID").toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-muted">Order status</p>
              <p className="font-bold capitalize">{order.status.toLowerCase()}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2">{it.medicine.name}</td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(it.unitPrice)}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(it.subtotal ?? it.unitPrice * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="text-muted capitalize">Status: {order.status.toLowerCase()}</span>
            <span className="text-2xl font-bold text-accent">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3 no-print">
          <Button onClick={print} className="flex-1">
            <Printer className="h-4 w-4" />
            Print invoice
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
