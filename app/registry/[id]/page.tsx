"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
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

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  registered: { label: "Registered", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  missing: { label: "MISSING / STOLEN", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
  found: { label: "Found", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
  transferred: { label: "Transferred", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: ArrowLeftRight },
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      if (!res.ok) { toast.error(data.error); return; }
      setProperty(data.property);
      toast.success(`Property marked as ${newStatus}.`);
    } catch {
      toast.error("Update failed.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferEmail) { toast.error("Recipient email is required."); return; }
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
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(data.message);
      setTransferOpen(false);
      router.push("/dashboard");
    } catch {
      toast.error("Transfer failed. Please try again.");
    } finally {
      setTransferring(false);
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
            <Link href={`/auth/signin?callbackUrl=/registry/${id}`}>Sign In</Link>
          </Button>
        )}
        <Button variant="ghost" asChild>
          <Link href="/registry"><ArrowLeft className="mr-2 h-4 w-4" />Back to Registry</Link>
        </Button>
      </div>
    );
  }

  const cfg = STATUS_BADGE[property.status] || STATUS_BADGE.registered;
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href="/registry"><ArrowLeft className="mr-2 h-4 w-4" />Registry</Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight capitalize">
              {property.brand} {property.model}
            </h1>
            <p className="text-muted-foreground capitalize">{property.itemType}</p>
          </div>
          <Badge variant="outline" className={`text-sm px-3 py-1.5 ${cfg.color} border`}>
            <StatusIcon className="h-4 w-4 mr-1.5" />
            {cfg.label}
          </Badge>
        </div>

        {/* Missing warning */}
        {property.status === "missing" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 mb-6">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="font-semibold text-sm">
              This item has been reported missing or stolen. Do not purchase this item. Report any suspicious activity to the police.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Item Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: "Type", value: property.itemType },
                  { label: "Brand", value: property.brand },
                  { label: "Model", value: property.model },
                  { label: "Color", value: property.color },
                  { label: "Year", value: property.yearOfPurchase },
                  { label: "Serial Number", value: property.serialNumber, mono: true },
                  { label: "IMEI", value: property.imei, mono: true },
                  { label: "Chassis Number", value: property.chassisNumber, mono: true },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex justify-between py-1 border-b border-muted last:border-0">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-medium capitalize ${row.mono ? "font-mono" : ""}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
                {property.description && (
                  <div className="pt-2">
                    <p className="text-muted-foreground mb-1">Description</p>
                    <p className="leading-relaxed">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transfer History */}
            {property.previousOwners?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Ownership History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.previousOwners.map((record: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">
                          Transfer #{i + 1}{" "}
                          <span className="font-normal text-muted-foreground">
                            — {new Date(record.transferredAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </p>
                        {record.dateSold && (
                          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Sold: {new Date(record.dateSold).toLocaleDateString()}</p>
                        )}
                        {record.salePrice && (
                          <p className="text-muted-foreground">Price: ₦{record.salePrice.toLocaleString()}</p>
                        )}
                        {record.location && (
                          <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{record.location}</p>
                        )}
                        {record.notes && (
                          <p className="text-muted-foreground italic">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Owner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Current Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-semibold">{property.owner?.name}</p>
                <p className="text-muted-foreground">{property.owner?.email}</p>
                {property.owner?.phone && (
                  <p className="text-muted-foreground">{property.owner.phone}</p>
                )}
              </CardContent>
            </Card>

            {/* Registration Date */}
            <Card>
              <CardContent className="pt-5 text-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Registered on</span>
                </div>
                <p className="font-semibold">
                  {new Date(property.registeredAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Owner Actions */}
            {isOwner && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Owner Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {property.status !== "missing" && (
                    <Button
                      variant="destructive"
                      className="w-full rounded-xl"
                      size="sm"
                      disabled={updatingStatus}
                      onClick={() => updateStatus("missing")}
                    >
                      {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                      Report as Missing
                    </Button>
                  )}
                  {property.status === "missing" && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-green-600 border-green-500/30"
                      size="sm"
                      disabled={updatingStatus}
                      onClick={() => updateStatus("found")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Found
                    </Button>
                  )}

                  <Separator />

                  {/* Transfer */}
                  <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-xl" size="sm">
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
                          <Label>Recipient&apos;s FindMasters Email *</Label>
                          <Input placeholder="buyer@email.com" value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Date Sold</Label>
                            <Input type="date" value={dateSold} onChange={(e) => setDateSold(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Sale Price (₦)</Label>
                            <Input type="number" placeholder="e.g. 50000" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Location of Sale</Label>
                          <Input placeholder="e.g. Lagos Island" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Notes (optional)</Label>
                          <Textarea placeholder="Any additional notes..." className="resize-none min-h-[70px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <Button className="w-full rounded-full" onClick={handleTransfer} disabled={transferring}>
                          {transferring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          {transferring ? "Transferring..." : "Confirm Transfer"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
