"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import OwnerSearchLogs from "@/components/OwnerSearchLogs";
import { toast } from "sonner";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowLeftRight,
  Loader2,
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Tag,
  History,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Package,
  Palette,
  Hash,
  FileText,
  Clock,
  Users,
  Award,
  Building2,
  Crown,
  TreeDeciduous,
  Leaf,
  Sprout,
  GitBranch,
  GitCommit,
  GitMerge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_BADGE: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  registered: {
    label: "Registered",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle2,
  },
  missing: {
    label: "MISSING / STOLEN",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertTriangle,
  },
  found: {
    label: "Found",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: CheckCircle2,
  },
  transferred: {
    label: "Transferred",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: ArrowLeftRight,
  },
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Transfer dialog state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [dateSold, setDateSold] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/registry/${id}`);
        if (res.status === 401) {
          setError("Please sign in to view full property details.");
          return;
        }
        if (!res.ok) {
          setError("Property not found.");
          return;
        }
        const data = await res.json();
        setProperty(data.property);
      } catch {
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  const isOwner = session?.user?.id === property?.owner?._id;

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/registry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      setProperty(data.property);
      toast.success(`Property marked as ${newStatus}.`);
    } catch {
      toast.error("Update failed.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferEmail) {
      toast.error("Recipient email is required.");
      return;
    }
    setTransferring(true);
    try {
      const res = await fetch("/api/registry/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          toEmail: transferEmail,
          dateSold: dateSold || undefined,
          salePrice: salePrice ? Number(salePrice) : undefined,
          location: location || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(data.message);
      setTransferOpen(false);
      router.push("/dashboard");
    } catch {
      toast.error("Transfer failed. Please try again.");
    } finally {
      setTransferring(false);
    }
  };

  const nextImage = () => {
    if (property?.images?.length) {
      setSelectedImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images?.length) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">{error}</h2>
        {!session && (
          <Button asChild className="rounded-full">
            <Link href={`/auth/signin?callbackUrl=/registry/${id}`}>
              Sign In
            </Link>
          </Button>
        )}
        <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Button>
      </div>
    );
  }

  const cfg = STATUS_BADGE[property.status] || STATUS_BADGE.registered;
  const StatusIcon = cfg.icon;
  const hasImages = property?.images?.length > 0;

  // Prepare ownership tree data
  const ownershipTree = property?.previousOwners || [];
  const currentOwner = {
    name: property?.owner?.name,
    email: property?.owner?.email,
    isCurrent: true,
    transferredAt: property?.registeredAt,
  };

  // Combine previous owners with current owner for the full timeline
  const fullTimeline = [...ownershipTree, currentOwner];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border shadow-lg">
                {hasImages ? (
                  <>
                    <Image
                      src={property.images[selectedImageIndex]}
                      alt={`${property.brand} ${property.model}`}
                      fill
                      className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setLightboxOpen(true)}
                    />
                    {property.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                          {selectedImageIndex + 1} / {property.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {hasImages && property.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {property.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                        selectedImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/20"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Missing Alert */}
              {property.status === "missing" && (
                <div className="flex items-start gap-3 p-5 rounded-xl bg-red-500/10 border-2 border-red-500/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-red-600 text-base">
                      ⚠️ STOLEN PROPERTY ALERT
                    </p>
                    <p className="text-sm text-red-600/90 leading-relaxed">
                      This item has been reported as missing or stolen. Do not
                      purchase or accept this item. If you have information about
                      this property, please contact the owner or report to the
                      authorities immediately.
                    </p>
                    {property.reportedMissingAt && (
                      <p className="text-xs text-red-600/70 pt-1">
                        Reported missing on{" "}
                        {new Date(property.reportedMissingAt).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight capitalize mb-2">
                      {property.brand} {property.model}
                    </h1>
                    <p className="text-lg text-muted-foreground capitalize flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {property.itemType.replace("_", " ")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-sm px-4 py-2 ${cfg.color} border shrink-0`}
                  >
                    <StatusIcon className="h-4 w-4 mr-1.5" />
                    {cfg.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Registered on{" "}
                  {new Date(property.registeredAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <Separator />

              {/* Item Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {[
                    {
                      icon: Palette,
                      label: "Color",
                      value: property.color,
                    },
                    {
                      icon: Clock,
                      label: "Year of Purchase",
                      value: property.yearOfPurchase,
                    },
                    {
                      icon: Hash,
                      label: "Serial Number",
                      value: property.serialNumber,
                      mono: true,
                    },
                    {
                      icon: Hash,
                      label: "IMEI",
                      value: property.imei,
                      mono: true,
                    },
                    {
                      icon: Hash,
                      label: "Chassis Number",
                      value: property.chassisNumber,
                      mono: true,
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="p-2 rounded-md bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {item.label}
                            </p>
                            <p
                              className={cn(
                                "font-medium capitalize truncate",
                                item.mono && "font-mono text-sm"
                              )}
                            >
                              {item.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  {property.description && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1.5">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <p className="text-xs font-medium">Description</p>
                      </div>
                      <p className="text-sm leading-relaxed pl-6">
                        {property.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Owner Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Current Owner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {property.owner?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{property.owner?.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {property.owner?.email}
                      </p>
                    </div>
                  </div>
                  {property.owner?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pl-15">
                      <Phone className="h-3.5 w-3.5" />
                      {property.owner.phone}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Owner Actions */}
              {isOwner && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Manage Property</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.status !== "missing" && (
                      <Button
                        variant="destructive"
                        className="w-full rounded-xl"
                        disabled={updatingStatus}
                        onClick={() => updateStatus("missing")}
                      >
                        {updatingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 mr-2" />
                        )}
                        Report as Missing/Stolen
                      </Button>
                    )}
                    {property.status === "missing" && (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl text-green-600 border-green-500/30 hover:bg-green-500/10"
                        disabled={updatingStatus}
                        onClick={() => updateStatus("found")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as
                        Found/Recovered
                      </Button>
                    )}

                    <Separator />

                    {/* Transfer Dialog */}
                    <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full rounded-xl"
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Transfer Ownership
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Transfer Ownership</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                          <div className="space-y-1.5">
                            <Label>
                              Recipient&apos;s FindMaster Email *
                            </Label>
                            <Input
                              placeholder="buyer@email.com"
                              value={transferEmail}
                              onChange={(e) => setTransferEmail(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label>Date Sold</Label>
                              <Input
                                type="date"
                                value={dateSold}
                                onChange={(e) => setDateSold(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Sale Price (₦)</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 50000"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Location of Sale</Label>
                            <Input
                              placeholder="e.g. Lagos Island"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Notes (optional)</Label>
                            <Textarea
                              placeholder="Any additional notes..."
                              className="resize-none min-h-[70px]"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>
                          <Button
                            className="w-full rounded-full"
                            onClick={handleTransfer}
                            disabled={transferring}
                          >
                            {transferring ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            {transferring
                              ? "Transferring..."
                              : "Confirm Transfer"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Ownership History - Tree View */}
          {fullTimeline.length > 0 && (
            <Card className="mt-8 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-xl flex items-center gap-3">
                  <TreeDeciduous className="h-6 w-6 text-primary" />
                  Ownership Tree
                  <Badge variant="secondary" className="ml-2">
                    {fullTimeline.length} {fullTimeline.length === 1 ? "Owner" : "Owners"}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete lineage of this property from first registration to current owner
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/5 hidden md:block" />
                  
                  <div className="space-y-0">
                    {fullTimeline.map((record: any, index: number) => {
                      const isCurrent = record.isCurrent;
                      const isFirst = index === 0;
                      const isLast = index === fullTimeline.length - 1;
                      const transferRecord = ownershipTree[index];
                      
                      return (
                        <div key={index} className="relative flex flex-col md:flex-row gap-4 pb-8">
                          {/* Tree branch connector */}
                          <div className="relative flex flex-col items-center md:items-start">
                            {/* Node circle */}
                            <div className={cn(
                              "relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                              isCurrent 
                                ? "bg-gradient-to-br from-primary to-primary/80 ring-4 ring-primary/20" 
                                : "bg-gradient-to-br from-gray-500 to-gray-600 ring-4 ring-gray-500/20",
                              "hover:scale-110 transition-transform cursor-pointer"
                            )}>
                              {isCurrent ? (
                                <Crown className="h-6 w-6 text-white" />
                              ) : isFirst ? (
                                <Sprout className="h-6 w-6 text-white" />
                              ) : (
                                <Leaf className="h-6 w-6 text-white" />
                              )}
                            </div>
                            
                            {/* Horizontal connector line for desktop */}
                            {!isLast && (
                              <div className="hidden md:block absolute left-6 top-12 w-12 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                            )}
                            
                            {/* Vertical connector for mobile */}
                            {!isLast && (
                              <div className="md:hidden absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-transparent h-full" />
                            )}
                          </div>
                          
                          {/* Content card */}
                          <div className={cn(
                            "flex-1 ml-0 md:ml-8 p-5 rounded-xl border transition-all duration-300 hover:shadow-lg",
                            isCurrent 
                              ? "bg-gradient-to-br from-primary/5 to-transparent border-primary/30 shadow-md" 
                              : "bg-card hover:border-primary/20",
                            "relative"
                          )}>
                            {/* Tree branch line to card */}
                            <div className="hidden md:block absolute left-0 top-6 -translate-x-8 w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                  {isCurrent ? (
                                    <>
                                      <Badge className="bg-primary text-white">
                                        Current Owner
                                      </Badge>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Award className="h-4 w-4 text-primary" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Current registered owner
                                        </TooltipContent>
                                      </Tooltip>
                                    </>
                                  ) : isFirst ? (
                                    <>
                                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                        First Owner
                                      </Badge>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Sprout className="h-4 w-4 text-emerald-600" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Original registrant
                                        </TooltipContent>
                                      </Tooltip>
                                    </>
                                  ) : (
                                    <Badge variant="outline">
                                      Previous Owner
                                    </Badge>
                                  )}
                                  
                                  {transferRecord?.salePrice && (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                      ₦{transferRecord.salePrice.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                                    isCurrent 
                                      ? "bg-primary/20 text-primary" 
                                      : "bg-muted text-foreground"
                                  )}>
                                    {record.name?.charAt(0).toUpperCase() || "U"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-base">
                                      {record.name || "Unknown User"}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Mail className="h-3.5 w-3.5" />
                                      {record.email || "No email"}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-3">
                                  {transferRecord?.dateSold && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        Sold: {new Date(transferRecord.dateSold).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {transferRecord?.location && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="h-4 w-4" />
                                      {transferRecord.location}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {isCurrent 
                                        ? "Current owner since"
                                        : "Owned until"}{" "}
                                      {new Date(
                                        isCurrent ? record.transferredAt : (transferRecord?.transferredAt || record.transferredAt)
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                {transferRecord?.notes && (
                                  <div className="mt-3 p-3 rounded-lg bg-muted/30 italic text-sm text-muted-foreground">
                                    &ldquo;{transferRecord.notes}&rdquo;
                                  </div>
                                )}
                              </div>
                              
                              {/* Transfer arrow indicator */}
                              {!isLast && (
                                <div className="hidden md:flex flex-col items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Transfer
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Mobile transfer indicator */}
                            {!isLast && (
                              <div className="md:hidden flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Transferred to next owner
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Tree Legend */}
                <div className="mt-6 pt-6 border-t flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/20" />
                    <span className="text-sm">Current Owner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-500 to-gray-600" />
                    <span className="text-sm">Previous Owner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">First/Owner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-sm">Current Owner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Transfer Point</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Audit Logs */}
          {isOwner && (
            <OwnerSearchLogs propertyId={id} />
          )}
        </div>

        {/* Image Lightbox */}
        {hasImages && (
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 bg-black/95">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={property.images[selectedImageIndex]}
                  alt={`${property.brand} ${property.model}`}
                  fill
                  className="object-contain"
                />
                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 text-black px-4 py-2 rounded-full font-medium">
                      {selectedImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}