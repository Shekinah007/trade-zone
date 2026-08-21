"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import IncreaseQuotaDialog from "./IncreaseQuotaDialog";

export default function QuotaIncreaseButton({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="shrink-0 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
        onClick={() => setOpen(true)}
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Increase Quota
      </Button>
      <IncreaseQuotaDialog
        user={user}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}