"use client";

import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type Activity = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  userName: string | null;
  createdAt: string;
};

export function ActivityPageView({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Actions like orders, stock changes, and payments will appear here."
        actionLabel="Go to dashboard"
        actionHref="/dashboard"
      />
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {items.map((a) => (
        <Card key={a.id} className="py-3 px-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">
                <span className="text-accent capitalize">{a.action.replace(/_/g, " ")}</span>
                <span className="text-muted"> · {a.entity}</span>
              </p>
              {a.details && <p className="text-sm text-muted mt-1">{a.details}</p>}
            </div>
            <p className="text-xs text-muted shrink-0">
              {a.userName ?? "System"}
              <br />
              {formatDate(a.createdAt)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
