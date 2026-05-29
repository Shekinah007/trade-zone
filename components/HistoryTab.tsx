import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Clock,
  CreditCard,
  ShoppingCart,
  Shield,
  ArrowLeftRight,
  Package,
  Zap,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// ─── helpers ───────────────────────────────────────────────────────────────

function formatAmount(p: any) {
  const method = p.paymentMethod;
  if (method === "naira" || method === "paystack") return `₦${p.amountPaid.toLocaleString()}`;
  if (method === "credit" || method === "credits") return `${p.amountPaid} Credits`;
  if (method === "token") return `${p.amountPaid} Tokens`;
  return `${p.amountPaid}`;
}

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  if (status === "success") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

/** Returns the icon, label, and type-specific chips for a purchase row */
function getPurchaseMeta(p: any): {
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  chips: { text: string; color: string }[];
} {
  const tier = p.tier;
  const meta = p.metadata || {};

  switch (p.type as string) {
    case "pack": {
      const packName = meta.packName || tier?.name || "Listing Pack";
      const slotCount = meta.slotCount ?? tier?.slotCount;
      return {
        icon: <Package className="h-4 w-4 text-emerald-600" />,
        label: `Listing Pack — ${packName}`,
        subLabel: "Marketplace listing slots",
        chips: slotCount != null
          ? [{ text: `+${slotCount} listing slot${slotCount !== 1 ? "s" : ""}`, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" }]
          : [],
      };
    }
    case "registration": {
      const qty = meta.quantity ?? 1;
      return {
        icon: <Shield className="h-4 w-4 text-red-600" />,
        label: "Registry Quota",
        subLabel: "Property registration slots",
        chips: [{ text: `+${qty} registry slot${qty !== 1 ? "s" : ""}`, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" }],
      };
    }
    case "boost": {
      const tierName = meta.tierName || tier?.name || "Boost";
      const days = meta.durationInDays ?? tier?.durationInDays;
      const itemLabel = p.item ? `${p.item.brand || ""} ${p.item.model || ""}`.trim() : null;
      return {
        icon: <Zap className="h-4 w-4 text-amber-600" />,
        label: `Listing Boost — ${tierName}`,
        subLabel: itemLabel || "Boost applied to listing",
        chips: days != null
          ? [{ text: `${days} day${days !== 1 ? "s" : ""}`, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" }]
          : [],
      };
    }
    case "featured": {
      const tierName = meta.tierName || tier?.name || "Featured";
      const days = meta.durationInDays ?? tier?.durationInDays;
      const itemLabel = p.item ? `${p.item.brand || ""} ${p.item.model || ""}`.trim() : null;
      return {
        icon: <Star className="h-4 w-4 text-purple-600" />,
        label: `Featured Listing — ${tierName}`,
        subLabel: itemLabel || "Featured placement",
        chips: days != null
          ? [{ text: `${days} day${days !== 1 ? "s" : ""}`, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" }]
          : [],
      };
    }
    default:
      return {
        icon: <CreditCard className="h-4 w-4 text-blue-600" />,
        label: `${String(p.type).charAt(0).toUpperCase() + String(p.type).slice(1)} Purchase`,
        chips: [],
      };
  }
}

// ─── component ─────────────────────────────────────────────────────────────

export function HistoryTab({
  purchases,
  transfers,
  userId,
}: {
  purchases: any[];
  transfers: any[];
  userId?: string;
}) {
  if (!userId) return null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="bg-muted/50 p-0.5 h-8 mb-4">
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs h-7 px-3"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger
            value="transfers"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs h-7 px-3"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
            Transfer History
          </TabsTrigger>
        </TabsList>

        {/* ── Purchases Tab ── */}
        <TabsContent value="purchases">
          <Card>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Purchase History ({purchases.length})
              </CardTitle>
            </div>
            <CardContent className="p-4">
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <ShoppingCart className="h-8 w-8 mb-2 opacity-20 mx-auto" />
                  <p>No purchase history found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map((p) => {
                    const { icon, label, subLabel, chips } = getPurchaseMeta(p);
                    return (
                      <div
                        key={p._id}
                        className="flex flex-col sm:flex-row sm:items-start justify-between p-3 border rounded-xl bg-card gap-3 hover:bg-muted/30 transition-colors"
                      >
                        {/* Left: icon + info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 p-2 rounded-lg bg-muted/60 shrink-0">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm leading-snug truncate">{label}</p>
                            {subLabel && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subLabel}</p>
                            )}

                            {/* Type-specific chips */}
                            {chips.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {chips.map((chip) => (
                                  <span
                                    key={chip.text}
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${chip.color}`}
                                  >
                                    {chip.text}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Date range for boost/featured */}
                            {(p.type === "boost" || p.type === "featured") && p.startDate && p.endDate && (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
                              </p>
                            )}

                            {/* Payment method + date */}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-muted-foreground capitalize">
                                via {p.paymentMethod}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(p.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: amount + status + detail link */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          <span className="font-bold text-sm">{formatAmount(p)}</span>
                          <Badge
                            variant={statusVariant(p.status)}
                            className="text-[10px] capitalize"
                          >
                            {p.status}
                          </Badge>
                          <Link
                            href={`/dashboard/purchases/${p._id}`}
                            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium mt-0.5"
                          >
                            Details <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Transfer History Tab ── */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Asset Transfer History ({transfers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {transfers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Shield className="h-8 w-8 mb-2 opacity-20 mx-auto" />
                  <p>No transfer history found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transfers.map((t) => {
                    const isIncoming =
                      t.toUser?._id === userId || t.toUser === userId;
                    const item = t.itemId || t.propertyId;
                    const itemIdentifier = item?.uniqueIdentifier || item?.registry?.imei || item?.registry?.serialNumber || item?.registry?.chassisNumber || item?.uniqueId || item?.imei || item?.serialNumber || item?.chasisNumber;

                    return (
                      <div
                        key={t._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl bg-card gap-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden shrink-0">
                            {item?.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt="Property"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Shield className="h-full w-full p-2 opacity-20" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {item?.brand} {item?.model}
                            </p>

                            {itemIdentifier && (
                              <p className="text-[11px] text-muted-foreground/80 font-mono mt-0.5 mb-1">
                                ID: {itemIdentifier}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                              {isIncoming ? (
                                <>From: {t.fromUser?.name || t.fromUser?.email}</>
                              ) : (
                                <>To: {t.toUser ? t.toUser.name || t.toUser.email : t.receiverEmail}</>
                              )}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(t.updatedAt || t.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={isIncoming ? "outline" : "secondary"}
                            className="text-[10px]"
                          >
                            {isIncoming ? "Incoming" : "Outgoing"}
                          </Badge>
                          <Badge
                            className="text-[10px]"
                            variant={
                              t.status === "accepted"
                                ? "default"
                                : t.status === "declined" || t.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
