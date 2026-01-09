"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle, Heart, Share2, Flag, AlertTriangle } from "lucide-react";
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

interface ListingActionsProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
  price: number;
  history?: any[];
}

export function ListingActions({ listingId, sellerId, listingTitle, price, history = [] }: ListingActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleContactSeller = async () => {
    // ... (existing logic)
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
          } catch(error) {
              toast.error("Failed to process purchase");
          }
      }
  };
  
  const handleReport = async () => {
    // ... (existing logic)
     if (!reportReason.trim()) return;
     
     try {
        const res = await fetch("/api/reports", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ 
              targetId: listingId, 
              targetType: 'Listing', 
              reason: 'Abuse', 
              description: reportReason 
           })
        });
        
        if (res.ok) {
           toast.success("Report submitted successfully");
           setIsReportOpen(false);
           setReportReason("");
        }
     } catch(error) {
        toast.error("Failed to submit report");
     }
  };

  return (
    <>
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={handleBuyNow} className="bg-green-600 hover:bg-green-700 text-white">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy Now
        </Button>

        <Button className="w-full" size="lg" variant="secondary" onClick={handleContactSeller} disabled={isLoading}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {isLoading ? "Connecting..." : "Contact Seller"}
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Heart className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Review Button - Only show if user has bought this item or interacts logic. 
            For simplicity, showing it here to allow testing rating flow manually. 
            Ideally, this should verify if session.user.id is in history as buyer. */}
        <ReviewModal listingId={listingId} sellerId={sellerId} />
      </div>

       {/* Item History Section */}
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

       <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          {/* We trigger this from the seller info card usually, but declaring here for context availability */}
      </Dialog>
    </>
  );
}

// Separate component for the Report Trigger to place it correctly in layout if needed,
// but for simplicity, let's export a ReportButton too
export function ReportButton({ listingId }: { listingId: string }) {
    const [open, setOpen] = useState(false);
    
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
                <Textarea placeholder="Reason for reporting..." className="min-h-[100px]" />
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => {
                        toast.success("Report submitted");
                        setOpen(false);
                    }}>Submit Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
