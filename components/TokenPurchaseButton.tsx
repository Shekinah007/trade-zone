"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { TokenPurchaseModal } from "./TokenPurchaseModal";

export function TokenPurchaseButton({ 
  className, 
  variant = "outline",
  label = "Upgrade Limit",
  size = "default",
  creditBalance = 0
}: { 
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  creditBalance?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={className} 
        onClick={() => setIsOpen(true)}
      >
        <Zap className="mr-2 h-4 w-4 text-amber-500" />
        {label}
      </Button>

      <TokenPurchaseModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        initialCreditBalance={creditBalance}
      />
    </>
  );
}
