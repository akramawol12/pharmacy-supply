import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "default" | "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default:
    "bg-accent text-slate-900 hover:bg-accent-hover glow-accent transition-all duration-200",
  primary:
    "bg-primary text-white hover:bg-primary-hover glow-primary transition-all duration-200",
  ghost:
    "bg-transparent border border-border text-foreground hover:bg-surface-hover transition-all duration-200",
  danger: "bg-danger text-white hover:bg-red-600 transition-all duration-200",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
