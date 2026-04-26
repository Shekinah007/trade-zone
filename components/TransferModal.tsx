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

interface TransferModalProps {
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

export function TransferModal({
  propertyId,
  propertyTitle,
  onSuccess,
}: TransferModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [notes, setNotes] = useState("");

  const handleTransfer = async () => {
    if (!receiverEmail) {
      toast.error("Receiver Email is required");
      return;
    }

    setLoading(true);
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
      setOpen(false);
      setReceiverEmail("");
      setSalePrice("");
      setNotes("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-blue-600 border-blue-600 hover:bg-blue-50 w-full sm:w-auto"
        >
          Transfer Ownership
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer {propertyTitle}</DialogTitle>
          <DialogDescription>
            Enter the details to transfer this property to a new owner. If they
            don't have an account, they'll receive a secure link to claim it.
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
              className="col-span-3"
            />
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={loading}>
            {loading ? "Initiating..." : "Initiate Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
