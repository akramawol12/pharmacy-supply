"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { isNavActive } from "@/config/nav";

type Props = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  allHrefs: string[];
  compact?: boolean;
  /** Icon-only tab for mobile bottom bar */
  tab?: boolean;
};

export function NavLink({ href, label, icon: Icon, allHrefs, compact, tab }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const active = isNavActive(pathname, href, allHrefs);
  const isPending = pendingHref === href && !active;

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  if (tab) {
    return (
      <Link
        href={href}
        prefetch
        onClick={() => pathname !== href && setPendingHref(href)}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        className={cn(
          "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-medium touch-manipulation select-none",
          active ? "text-accent" : "text-muted",
          isPending && "opacity-60"
        )}
      >
        <Icon className="h-5 w-5 shrink-0 pointer-events-none" />
        <span className="truncate pointer-events-none">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch
      onClick={() => pathname !== href && setPendingHref(href)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-100 touch-manipulation select-none",
        compact ? "min-h-[44px] py-2" : "min-h-[48px] py-3",
        active && "bg-accent/15 text-accent",
        !active && "text-muted hover:bg-surface-hover hover:text-foreground",
        isPending && "opacity-70"
      )}
    >
      <Icon className="h-5 w-5 shrink-0 pointer-events-none" />
      <span className="pointer-events-none">{label}</span>
      {isPending && (
        <span className="ml-auto h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent pointer-events-none" />
      )}
    </Link>
  );
}
