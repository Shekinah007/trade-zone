"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {  Heart, Share2, Flag, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { ReviewModal } from "@/components/ReviewModal";
import { formatDistanceToNow } from "date-fns";
import { History, ShoppingCart } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Phone, MessageCircle, PhoneCall } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveButton } from "./SavedButton";
import { ShareButton } from "./ShareButton";

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  sellerPhone: string;
  listingTitle: string;
  price: number;
  history?: any[];
}

export function ListingActions({ listingId, sellerId, listingTitle, price, history = [], status: listingStatus, sellerPhone }: ListingActionsProps & { status?: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showSoldDialog, setShowSoldDialog] = useState(false);

  const isSeller = session?.user?.id === sellerId;
  const isSold = listingStatus === 'sold';

  const handleContactSeller = async () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, sellerId }),
      });

      if (res.ok) {
        const conversation = await res.json();
        router.push(`/messages/${conversation._id}`);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to start conversation");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (confirm(`Confirm purchase for $${price}?`)) {
      try {
        // Here we would integrate Stripe/Payment Gateway
        // For this task, we record the transaction directly
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, price })
        });

        if (res.ok) {
          toast.success("Purchase recorded!");
          router.refresh();
        } else {
          const err = await res.json();
          toast.error(err.message || "Purchase failed");
        }
      } catch (error) {
        toast.error("Failed to process purchase");
      }
    }
  };

  const handleMarkAsSold = async () => {
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append("status", "sold");

    const res = await fetch(`/api/listings/${listingId}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update status");
    }

    toast.success("Listing marked as sold!");
    router.refresh();
  } catch (error: any) {
    toast.error(error.message || "Something went wrong");
  } finally {
    setIsLoading(false);
    setShowSoldDialog(false);
  }
};

  // I will return the existing component code for now, but with the isSeller checks, 
  // but I realize I need to fix the API route first.
  // So I will abort this specific tool call or render a placeholder that doesn't break, 
  // then fix API, then come back.

  // Actually, I can just implement the UI here and leave the function empty or with a TODO, 
  // then fix API, then fix function.
  // But simpler to Fix API immediately. 

  // Let's output the logic assuming API will be fixed to support partial updates.

  return (
    <>
      <div className="space-y-3">
        {isSold && (
          <div className="bg-destructive/10 text-destructive text-center p-3 rounded-md font-bold border border-destructive/20">
            SOLD
          </div>
        )}

        {isSeller ? (
          <>
            <Button className="w-full" size="lg" variant="outline" onClick={() => router.push(`/listings/${listingId}/edit`)} disabled={isSold}>
              Edit Listing
            </Button>
            {!isSold && (
              <Button className="w-full" size="lg" variant="secondary" 
             onClick={() => setShowSoldDialog(true)} disabled={isLoading} 
              >
                Mark as Sold
              </Button>
            )}
          </>
        ) : (
          !isSold && (
            <>
            
              <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="w-full" size="lg" variant="secondary" disabled={isLoading}>
      <MessageCircle className="mr-2 h-4 w-4" />
      Contact Seller
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-64" align="center">
    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
      How would you like to reach out?
    </DropdownMenuLabel>
    <DropdownMenuSeparator />

    {/* In-app chat */}
    <DropdownMenuItem
      className="flex items-center gap-3 p-3 cursor-pointer"
      onClick={handleContactSeller}
      disabled={isLoading}
    >
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <MessageCircle className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">In-App Chat</p>
        <p className="text-xs text-muted-foreground">Message via Trade Zone</p>
      </div>
    </DropdownMenuItem>

    {sellerPhone ? (
      <>
        {/* WhatsApp */}
        <DropdownMenuItem
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => {
            const cleaned = sellerPhone.replace(/\D/g, "");
            const msg = encodeURIComponent(`Hi, I'm interested in your listing: ${listingTitle}`);
            window.open(`https://wa.me/${cleaned}?text=${msg}`, "_blank");
          }}
        >
          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            {/* WhatsApp SVG icon */}
            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.847L0 24l6.335-1.502A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.031-1.388l-.361-.214-3.762.892.952-3.67-.235-.376A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Chat on WhatsApp</p>
          </div>
        </DropdownMenuItem>

        {/* Phone call */}
        <DropdownMenuItem
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => window.open(`tel:${sellerPhone}`, "_self")}
        >
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <PhoneCall className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Call Seller</p>
            <p className="text-xs text-muted-foreground">{sellerPhone}</p>
          </div>
        </DropdownMenuItem>
      </>
    ) : (
      <DropdownMenuItem disabled className="flex items-center gap-3 p-3">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Phone className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm text-muted-foreground">Phone / WhatsApp</p>
          <p className="text-xs text-muted-foreground">Seller hasn't added a phone</p>
        </div>
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
            </>
          )
        )}



        {
          !isSeller && (
            <>
          <div className="flex gap-3">
                      
  <SaveButton listingId={listingId} />
  <ShareButton title={listingTitle} price={price.toLocaleString()} />
  
</div>
{status === "authenticated" && <ReportButton listingId={listingId} />}
{status === "authenticated" && 
              <ReviewModal listingId={listingId} sellerId={sellerId} />

}
            </>
          )
        }
      </div>

      {/* ... History ... */}
      {history.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold flex items-center mb-4">
            <History className="h-4 w-4 mr-2" />
            Item History
          </h3>
          <div className="space-y-4">
            {history.map((tx: any) => (
              <div key={tx._id} className="flex items-center text-sm border p-3 rounded-lg bg-muted/20">
                <div className="flex-1">
                  <p className="font-medium">Purchased by {tx.buyer?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="font-bold text-green-600">
                  ${tx.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... Dialogs ... */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        {/* ... */}
      </Dialog>
      <AlertDialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Mark as Sold?</AlertDialogTitle>
      <AlertDialogDescription>
        This will mark your listing as sold and hide it from active listings. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleMarkAsSold}
        disabled={isLoading}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Yes, Mark as Sold
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </>
  );
}

// Separate component for the Report Trigger to place it correctly in layout if needed,
// but for simplicity, let's export a ReportButton too
export function ReportButton({ listingId }: { listingId: string }) {
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [report, setReport] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleSubmit = async () => {
    if (!report) {
      toast.error("Field must not be empty")
      return
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "listing",
          description: report,
          status: "pending",
          reportedItem: listingId,
        })
      })
      if (res.ok) {
        toast.success("Report submitted")
        setOpen(false)
        setReport("")
      } else {
        toast.error("Failed to report")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to report listing")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full text-muted-foreground h-auto p-0 hover:text-destructive justify-start">
          <Flag className="h-4 w-4 mr-2" />
          Report this listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Listing</DialogTitle>
          <DialogDescription>
            Please describe why you are reporting this listing. Our team will review it shortly.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Reason for reporting..." className="min-h-[100px]" />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          {/* <Button variant="destructive" onClick={() => {
                        toast.success("Report submitted");
                        setOpen(false);
                    }}> */}
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
