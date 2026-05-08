"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Zap,
  Star,
  MessageCircle,
  ShieldCheck,
  BarChart2,
  Eye,
  TrendingUp,
  Calendar,
  Clock,
  Loader2,
  BadgeCheck,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

interface SellerListingPanelProps {
  listing: any;
  conversationCount?: number;
}

export function SellerListingPanel({
  listing,
  conversationCount = 0,
}: SellerListingPanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [salePrice, setSalePrice] = useState(
    (listing.listing?.price || 0).toString(),
  );
  const [isMarkingAsSold, setIsMarkingAsSold] = useState(false);

  const sellerId =
    listing.seller?._id?.toString() || listing.owner?._id?.toString();

  if (status === "loading") return null;
  if (!session || session.user.id !== sellerId) return null;

  const isSold = listing.listing?.status === "sold";
  const isBoosted = listing.listing?.boostStatus === "active";
  const isFeatured = listing.listing?.featuredStatus === "active";
  const isRegistered = listing.isRegistered;

  const boostExpiry = listing.listing?.boostExpiry
    ? new Date(listing.listing.boostExpiry)
    : null;
  const featuredExpiry = listing.listing?.featuredExpiry
    ? new Date(listing.listing.featuredExpiry)
    : null;
  const expiresAt = listing.listing?.expiresAt
    ? new Date(listing.listing.expiresAt)
    : null;

  const boostQueueLen = listing.listing?.boostQueue?.length ?? 0;

  const handleMarkAsSold = async () => {
    setIsMarkingAsSold(true);
    try {
      const res = await fetch(`/api/listings/${listing._id}/sold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerEmail: buyerEmail || undefined,
          salePrice: Number(salePrice),
        }),
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
      setIsMarkingAsSold(false);
      setShowSoldDialog(false);
    }
  };

  return (
    <>
      {/* ── Seller Management Panel ── */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" />
            Your Listing
            {isSold && (
              <Badge variant="destructive" className="ml-auto text-xs">
                SOLD
              </Badge>
            )}
            {!isSold && (
              <Badge
                variant="outline"
                className={`ml-auto text-xs ${
                  listing.listing?.status === "active"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-amber-500 text-amber-600"
                }`}
              >
                {(listing.listing?.status || "active").toUpperCase()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* ── Stats Row ── */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/40 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Eye className="h-3.5 w-3.5" />
              </div>
              <p className="text-lg font-bold leading-none">
                {listing.listing?.views ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Views</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <p className="text-lg font-bold leading-none">
                {conversationCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Chats</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <p className="text-lg font-bold leading-none">
                {listing.history?.length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sales</p>
            </div>
          </div>

          {/* ── Active Promotions ── */}
          {(isBoosted || isFeatured) && (
            <div className="space-y-2">
              {isBoosted && boostExpiry && (
                <div className="flex items-center gap-2 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg px-3 py-2">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">Boosted</span>
                  <span className="text-muted-foreground ml-auto">
                    expires{" "}
                    {formatDistanceToNow(boostExpiry, { addSuffix: true })}
                  </span>
                </div>
              )}
              {isFeatured && featuredExpiry && (
                <div className="flex items-center gap-2 text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg px-3 py-2">
                  <Star className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">Featured</span>
                  <span className="text-muted-foreground ml-auto">
                    expires{" "}
                    {formatDistanceToNow(featuredExpiry, { addSuffix: true })}
                  </span>
                </div>
              )}
              {boostQueueLen > 0 && (
                <div className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {boostQueueLen} boost{boostQueueLen > 1 ? "s" : ""} queued
                </div>
              )}
            </div>
          )}

          {/* ── Listing Expiry ── */}
          {expiresAt && !isSold && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Listing expires{" "}
              {formatDistanceToNow(expiresAt, { addSuffix: true })}
            </div>
          )}

          {/* ── Quick Actions Grid ── */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Edit */}
              <Link href={`/listings/${listing._id}/edit`}>
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Pencil className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none group-hover:text-primary transition-colors">
                      Edit
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      Update details
                    </p>
                  </div>
                </div>
              </Link>

              {/* Boost */}
              <Link href={`/dashboard/boosts?listing=${listing._id}`}>
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-orange-400/40 hover:bg-orange-500/5 transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 relative">
                    <Zap className="h-3.5 w-3.5 text-orange-500" />
                    {isBoosted && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500 ring-1 ring-background" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none group-hover:text-orange-500 transition-colors">
                      Boost
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {isBoosted ? "Manage boost" : "Get more views"}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Feature */}
              <Link href={`/dashboard/featured?listing=${listing._id}`}>
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-purple-400/40 hover:bg-purple-500/5 transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 relative">
                    <Star className="h-3.5 w-3.5 text-purple-500" />
                    {isFeatured && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 ring-1 ring-background" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none group-hover:text-purple-500 transition-colors">
                      Feature
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {isFeatured ? "Active" : "Homepage spotlight"}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Messages */}
              <Link href={`/messages`}>
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-green-400/40 hover:bg-green-500/5 transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 relative">
                    <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                    {conversationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white text-[8px] font-bold flex items-center justify-center ring-1 ring-background">
                        {conversationCount > 9 ? "9+" : conversationCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none group-hover:text-green-500 transition-colors">
                      Chats
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {conversationCount} conversation
                      {conversationCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Register / View Registry */}
              {isRegistered ? (
                <Link href={`/registry/${listing._id}`}>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-none group-hover:text-emerald-500 transition-colors">
                        Registry
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        View record
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link href={`/registry/register?listingId=${listing._id}`}>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-none group-hover:text-emerald-500 transition-colors">
                        Register
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        Protect asset
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Analytics / Dashboard */}
              <Link href="/dashboard">
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BarChart2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none group-hover:text-primary transition-colors">
                      Dashboard
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      All my listings
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* ── Mark as Sold ── */}
          {!isSold && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed border-muted-foreground/30 text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all"
              onClick={() => setShowSoldDialog(true)}
            >
              <Tag className="h-3.5 w-3.5 mr-2" />
              Mark as Sold
            </Button>
          )}

          {isSold && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-destructive bg-destructive/10 rounded-lg">
              <ShoppingBag className="h-4 w-4" />
              This item has been sold
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Mark as Sold Dialog ── */}
      <AlertDialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Sold?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your listing as sold and hide it from active
              listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Buyer&apos;s Email (Optional)
              </label>
              <input
                type="email"
                placeholder="buyer@email.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If they have an account, we&apos;ll notify them to accept the
                property transfer.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Final Sale Price (₦)
              </label>
              <input
                type="number"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsSold}
              disabled={isMarkingAsSold}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isMarkingAsSold && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Yes, Mark as Sold
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
