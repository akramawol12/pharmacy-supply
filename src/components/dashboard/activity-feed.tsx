"use client";

import { formatDate } from "@/lib/utils";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

type ActivityItem = {
  id: string;
  action: string;
  entity: string;
  details: string | null;
  userName: string | null;
  createdAt: string;
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-accent" />
        <div>
          <CardTitle>Live activity</CardTitle>
          <CardDescription>Recent system events</CardDescription>
        </div>
      </div>
      <ul className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3 text-sm border-l-2 border-accent/30 pl-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                <span className="text-accent">{a.action}</span> · {a.entity}
              </p>
              {a.details && <p className="text-xs text-muted truncate">{a.details}</p>}
              <p className="text-[10px] text-muted mt-0.5">
                {a.userName ?? "System"} · {formatDate(a.createdAt)}
              </p>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">No activity yet</p>}
      </ul>
    </Card>
  );
}
