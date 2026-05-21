"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import type { Role } from "@prisma/client";

const CommandPalette = dynamic(
  () => import("@/components/command-palette").then((m) => m.CommandPalette),
  { ssr: false }
);

export function AppProviders({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  return (
    <>
      {children}
      <CommandPalette role={role} />
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#f1f5f9",
          },
        }}
      />
    </>
  );
}
