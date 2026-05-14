import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success: "border-emerald-700 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-emerald-950",
        warning: "border-amber-600 bg-amber-500 text-amber-950 dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950",
        danger: "border-red-700 bg-red-600 text-white dark:border-red-500 dark:bg-red-500 dark:text-white",
        info: "border-sky-700 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-sky-950",
        neutral: "border-slate-300 bg-slate-200 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { badgeVariants };
