import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  confirmed: "bg-primary/20 text-blue-300 border-primary/30",
  fulfilled: "bg-accent/20 text-emerald-300 border-accent/30",
  cancelled: "bg-danger/20 text-red-300 border-danger/30",
  low: "bg-danger/20 text-red-300 border-danger/30",
  warning: "bg-warning/20 text-amber-200 border-warning/30",
  ok: "bg-accent/20 text-emerald-300 border-accent/30",
};

export function Badge({
  status,
  children,
  className,
}: {
  status: keyof typeof styles;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status] ?? styles.pending,
        className
      )}
    >
      {children}
    </span>
  );
}
