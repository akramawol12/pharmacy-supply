import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Event = {
  status: string;
  note: string | null;
  userName: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export function OrderTimeline({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  return (
    <ol className="mt-4 space-y-0 border-l border-border pl-4">
      {events.map((e, i) => (
        <li key={i} className="relative pb-4 last:pb-0">
          <span
            className={cn(
              "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
              e.status === "FULFILLED" && "bg-accent",
              e.status === "CANCELLED" && "bg-danger",
              e.status === "CONFIRMED" && "bg-primary",
              e.status === "PENDING" && "bg-warning"
            )}
          />
          <p className="text-sm font-medium">{STATUS_LABEL[e.status] ?? e.status}</p>
          {e.note && <p className="text-xs text-muted">{e.note}</p>}
          <p className="text-[10px] text-muted mt-0.5">
            {e.userName ?? "System"} · {formatDate(e.createdAt)}
          </p>
        </li>
      ))}
    </ol>
  );
}
