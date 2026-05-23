import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import {
  ArrowLeft,
  Package,
  Shield,
  Zap,
  Star,
  CreditCard,
  Clock,
  Hash,
  CalendarRange,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Grid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── helpers ───────────────────────────────────────────────────────────────

function formatAmount(p: any) {
  const method = p.paymentMethod;
  if (method === "naira" || method === "paystack")
    return `₦${Number(p.amountPaid).toLocaleString()}`;
  if (method === "credit" || method === "credits")
    return `${p.amountPaid} Credits`;
  if (method === "token") return `${p.amountPaid} Tokens`;
  return `${p.amountPaid}`;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "success")
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "failed") return <XCircle className="h-5 w-5 text-red-500" />;
  return <AlertCircle className="h-5 w-5 text-amber-500" />;
}

function typeConfig(type: string) {
  switch (type) {
    case "pack":
      return {
        icon: <Package className="h-6 w-6 text-emerald-600" />,
        bg: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        label: "Listing Pack Purchase",
      };
    case "registration":
      return {
        icon: <Shield className="h-6 w-6 text-red-600" />,
        bg: "from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20",
        border: "border-red-200 dark:border-red-800",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        label: "Registry Quota Purchase",
      };
    case "boost":
      return {
        icon: <Zap className="h-6 w-6 text-amber-600" />,
        bg: "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        label: "Listing Boost Purchase",
      };
    case "featured":
      return {
        icon: <Star className="h-6 w-6 text-purple-600" />,
        bg: "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
        label: "Featured Listing Purchase",
      };
    default:
      return {
        icon: <CreditCard className="h-6 w-6 text-blue-600" />,
        bg: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        label: "Purchase",
      };
  }
}

// ─── data fetch ────────────────────────────────────────────────────────────

async function getPurchase(id: string, userId: string | null | undefined) {
  await dbConnect();
  const purchase = await Purchase.findOne({ _id: id, user: userId })
    .populate("tier")
    .populate("item", "brand model images listing _id")
    .lean();
  return purchase ? JSON.parse(JSON.stringify(purchase)) : null;
}

// ─── page ──────────────────────────────────────────────────────────────────

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/dashboard");

  const { id } = await params;
  const purchase = await getPurchase(id, session.user.id);
  if (!purchase) notFound();

  const config = typeConfig(purchase.type);
  const tier = purchase.tier;
  const meta = purchase.metadata || {};
  const item = purchase.item;

  // Resolve display values — prefer metadata snapshot, fall back to populated tier
  const packName = meta.packName || tier?.name;
  const slotCount = meta.slotCount ?? tier?.slotCount;
  const registryQty = meta.quantity;
  const durationInDays = meta.durationInDays ?? tier?.durationInDays;
  const tierName = meta.tierName || tier?.name;
  const itemLabel = item
    ? `${item.brand || ""} ${item.model || ""}`.trim()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-8 px-4 max-w-2xl">

        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard?tab=history">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to History
          </Link>
        </Button>

        {/* Hero card */}
        <Card className={`bg-gradient-to-br ${config.bg} border ${config.border} mb-4 overflow-hidden`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                  {config.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {config.label}
                  </p>
                  <h1 className="text-xl font-bold leading-tight">
                    {purchase.type === "pack" && packName
                      ? packName
                      : purchase.type === "registration"
                        ? "Registry Quota"
                        : purchase.type === "boost" && tierName
                          ? `${tierName} Boost`
                          : purchase.type === "featured" && tierName
                            ? `${tierName} Featured`
                            : config.label}
                  </h1>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusIcon status={purchase.status} />
                <Badge
                  variant={
                    purchase.status === "success"
                      ? "default"
                      : purchase.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                  className="capitalize text-xs"
                >
                  {purchase.status}
                </Badge>
              </div>
            </div>

            {/* Amount */}
            <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10">
              <p className="text-3xl font-black">{formatAmount(purchase)}</p>
              <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                Paid via {purchase.paymentMethod}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific details */}
        <Card className="mb-4">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              What You Received
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">

            {/* PACK */}
            {purchase.type === "pack" && (
              <>
                {packName && (
                  <DetailRow icon={<Package className="h-4 w-4 text-emerald-600" />} label="Pack Name" value={packName} />
                )}
                {slotCount != null && (
                  <DetailRow
                    icon={<Grid className="h-4 w-4 text-emerald-600" />}
                    label="Listing Slots Granted"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-emerald-600">+{slotCount}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                          listing {slotCount === 1 ? "slot" : "slots"}
                        </span>
                      </span>
                    }
                  />
                )}
              </>
            )}

            {/* REGISTRATION */}
            {purchase.type === "registration" && (
              <>
                {registryQty != null && (
                  <DetailRow
                    icon={<Shield className="h-4 w-4 text-red-600" />}
                    label="Registry Slots Granted"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-red-600">+{registryQty}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
                          registry {registryQty === 1 ? "slot" : "slots"}
                        </span>
                      </span>
                    }
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Registry slots allow you to register and protect additional items in the FindMaster Property Registry.
                </p>
              </>
            )}

            {/* BOOST / FEATURED */}
            {(purchase.type === "boost" || purchase.type === "featured") && (
              <>
                {tierName && (
                  <DetailRow
                    icon={purchase.type === "boost"
                      ? <Zap className="h-4 w-4 text-amber-600" />
                      : <Star className="h-4 w-4 text-purple-600" />
                    }
                    label="Tier"
                    value={tierName}
                  />
                )}
                {durationInDays != null && (
                  <DetailRow
                    icon={<Clock className="h-4 w-4 text-amber-600" />}
                    label="Duration"
                    value={
                      <span className={`inline-flex items-center gap-1.5 font-bold ${purchase.type === "boost" ? "text-amber-600" : "text-purple-600"}`}>
                        {durationInDays} day{durationInDays !== 1 ? "s" : ""}
                      </span>
                    }
                  />
                )}
                {itemLabel && (
                  <DetailRow
                    icon={<ExternalLink className="h-4 w-4 text-muted-foreground" />}
                    label="Applied To"
                    value={
                      item?._id ? (
                        <Link
                          href={`/listings/${item._id}`}
                          className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                          {itemLabel}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : itemLabel
                    }
                  />
                )}
                {purchase.startDate && purchase.endDate && (
                  <DetailRow
                    icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
                    label="Active Period"
                    value={`${new Date(purchase.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} → ${new Date(purchase.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment details */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <DetailRow
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              label="Payment Method"
              value={<span className="capitalize">{purchase.paymentMethod}</span>}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              label="Date"
              value={new Date(purchase.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            />
            {purchase.reference && (
              <DetailRow
                icon={<Hash className="h-4 w-4 text-muted-foreground" />}
                label="Reference"
                value={
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {purchase.reference}
                  </span>
                }
              />
            )}
            <DetailRow
              icon={<Hash className="h-4 w-4 text-muted-foreground" />}
              label="Purchase ID"
              value={
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {purchase._id}
                </span>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── sub-component ─────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
