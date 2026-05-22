import Link from "next/link";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-block mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
