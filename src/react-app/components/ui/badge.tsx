import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white shadow",
        secondary:
          "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        destructive:
          "border-transparent bg-red-600 text-white shadow",
        outline: "text-gray-950 dark:text-gray-50",
        // Status variants for damage reports
        new: "border-transparent bg-blue-500 text-white",
        "under-review": "border-transparent bg-amber-500 text-white",
        verified: "border-transparent bg-emerald-500 text-white",
        rejected: "border-transparent bg-red-500 text-white",
        linked: "border-transparent bg-violet-500 text-white",
        resolved: "border-transparent bg-gray-500 text-white",
        // Severity variants
        low: "border-transparent bg-green-500 text-white",
        medium: "border-transparent bg-yellow-500 text-black",
        high: "border-transparent bg-orange-500 text-white",
        critical: "border-transparent bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
