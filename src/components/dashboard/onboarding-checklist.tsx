import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

type Step = { id: string; label: string; done: boolean; href: string };

export function OnboardingChecklist({
  steps,
  completed,
  total,
}: {
  steps: Step[];
  completed: number;
  total: number;
}) {
  if (completed === total) return null;

  return (
    <Card className="border-accent/30 glow-accent">
      <CardTitle>Get started</CardTitle>
      <CardDescription>
        {completed} of {total} setup steps complete
      </CardDescription>
      <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href}
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-surface-hover transition-colors"
            >
              {s.done ? (
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted shrink-0" />
              )}
              <span className={s.done ? "text-muted line-through" : "text-foreground"}>
                {s.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
