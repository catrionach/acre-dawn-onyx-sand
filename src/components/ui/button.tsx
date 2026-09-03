import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-fg hover:opacity-90 rounded-[var(--radius-sm)]",
        outline:
          "border border-border bg-surface text-ink hover:bg-surface-2 rounded-[var(--radius-sm)]",
        ghost: "text-ink hover:bg-surface-2 rounded-[var(--radius-sm)]",
        danger:
          "bg-danger-bg text-danger hover:opacity-90 rounded-[var(--radius-sm)]",
      },
      size: {
        default: "h-10 px-3.5 text-sm",
        sm: "h-9 px-2.5 text-xs",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
