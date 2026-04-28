"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReapplyButton() {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleReapply = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          data.message ||
            "Reapplication submitted successfully! Log in again to show status. Expect our email soon.",
        );
        setShowDialog(false);
        router.refresh(); // Refresh to update the UI
      } else {
        toast.error(data.message || "Failed to submit reapplication");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Reapplication error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reapply for Activation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reapply for Account Activation</DialogTitle>
          <DialogDescription>
            Are you sure you want to reapply? Make sure you have addressed the
            issues that led to your rejection.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Please ensure your profile information
            and documents are complete and accurate before reapplying. Multiple
            rejections may result in a permanent ban.
          </p>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReapply}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm Reapplication"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
