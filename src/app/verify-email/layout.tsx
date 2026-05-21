import { Suspense } from "react";

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>}>
      {children}
    </Suspense>
  );
}
