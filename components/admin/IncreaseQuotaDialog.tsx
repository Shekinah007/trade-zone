"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface IncreaseQuotaDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function IncreaseQuotaDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: IncreaseQuotaDialogProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (reason.trim().length < 5) {
      toast.error("Please provide a reason (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}/increase-quota`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to increase quota");

      toast.success(
        `Quota increased by ${parsedAmount} for ${user.name}. New quota: ${data.newQuota}`
      );
      setAmount("");
      setReason("");
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to increase quota.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const currentQuota = user.listingQuota ?? 0;
  const newQuota = currentQuota + (parseInt(amount) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Increase Listing Quota
          </DialogTitle>
          <DialogDescription>
            Increase the listing quota for{" "}
            <span className="font-semibold text-foreground">{user.name}</span>{" "}
            ({user.email}). A notification will be sent to the user with the
            reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current quota display */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Current Quota</span>
            <span className="text-lg font-bold">{currentQuota}</span>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="quota-amount">Increase By</Label>
            <Input
              id="quota-amount"
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
            />
            {amount && parseInt(amount) > 0 && (
              <p className="text-xs text-muted-foreground">
                New quota will be{" "}
                <span className="font-semibold text-green-600">{newQuota}</span>
              </p>
            )}
          </div>

          {/* Reason input */}
          <div className="space-y-2">
            <Label htmlFor="quota-reason">Reason</Label>
            <Textarea
              id="quota-reason"
              placeholder="Explain why the quota is being increased (e.g. exceptional performance, special promotion, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Increasing...
              </>
            ) : (
              "Increase Quota"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}