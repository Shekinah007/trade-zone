"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, UserCheck, ArrowRight, Loader2 } from "lucide-react";

interface TransferModalProps {
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

type Step = "confirm-receiver" | "transfer-details";

interface ReceiverInfo {
  name?: string;
  email: string;
  message?: string;
}

export function TransferModal({
  propertyId,
  propertyTitle,
  onSuccess,
}: TransferModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("confirm-receiver");
  const [confirming, setConfirming] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const [receiverEmail, setReceiverEmail] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [receiver, setReceiver] = useState<ReceiverInfo | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetState();
  };

  const resetState = () => {
    setStep("confirm-receiver");
    setReceiverEmail("");
    setSalePrice("");
    setNotes("");
    setReceiver(null);
    setConfirming(false);
    setTransferring(false);
  };

  const confirmReceiver = async () => {
    if (!receiverEmail) {
      toast.error("Receiver email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setConfirming(true);
    try {
      const res = await fetch("/api/transfers/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm receiver");
      }

      setReceiver({
        email: data?.receiver?.email ?? receiverEmail,
        name: data?.receiver?.name,
        message: data?.message,
      });
      setStep("transfer-details");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleTransfer = async () => {
    setTransferring(true);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          receiverEmail,
          salePrice: salePrice ? Number(salePrice) : undefined,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate transfer");
      }

      toast.success("Transfer initiated successfully");
      handleOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-blue-600 border-blue-600 hover:bg-blue-50 w-full sm:w-auto"
        >
          Transfer Ownership
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px]">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-1">
          <StepDot
            active={step === "confirm-receiver"}
            done={step === "transfer-details"}
            label="1"
          />
          <div className="flex-1 h-px bg-border" />
          <StepDot
            active={step === "transfer-details"}
            done={false}
            label="2"
          />
        </div>

        {step === "confirm-receiver" ? (
          <>
            <DialogHeader>
              <DialogTitle>Transfer {propertyTitle}</DialogTitle>
              <DialogDescription>
                Enter the recipient's email to look up their account before
                proceeding.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="receiver@example.com"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmReceiver()}
                  className="col-span-3"
                  disabled={confirming}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={confirming}
              >
                Cancel
              </Button>
              <Button onClick={confirmReceiver} disabled={confirming}>
                {confirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Confirm Receiver
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Complete Transfer</DialogTitle>
              <DialogDescription>
                Review the recipient and fill in the transfer details.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Receiver confirmation banner */}
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div className="min-w-0">
                  {receiver?.name ? (
                    <p className="text-sm font-medium text-green-900">
                      {receiver.name}
                    </p>
                  ) : null}
                  <p className="text-sm text-green-700 truncate">
                    {receiver?.email}
                  </p>
                  {receiver?.message && (
                    <p className="mt-0.5 text-xs text-green-600">
                      {receiver.message}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Sale Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Optional"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="col-span-3"
                  disabled={transferring}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Optional transaction notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3"
                  disabled={transferring}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep("confirm-receiver")}
                disabled={transferring}
              >
                Back
              </Button>
              <Button onClick={handleTransfer} disabled={transferring}>
                {transferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Confirm Transfer"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors
        ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}
    >
      {done ? <CheckCircle2 className="h-4 w-4" /> : label}
    </div>
  );
}
