"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

export function TokenPurchaseButton({
  className,
  variant = "outline",
  label = "Upgrade Registration Limit",
  size = "default",
}: {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  creditBalance?: number; // Kept for backwards compatibility if needed, but unused
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      asChild
    >
      <Link href="/upgrade">
        <Zap className="mr-2 h-4 w-4 text-amber-500" />
        {label}
      </Link>
    </Button>
  );
}
