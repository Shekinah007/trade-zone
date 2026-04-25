"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Shield,
  Loader2,
  ArrowRight,
  Info,
  Upload,
  X,
  ChevronRight,
  Camera,
  Smartphone,
  Car,
  Laptop,
  Tablet,
  Cpu,
  Zap,
  Package,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const TokenPurchaseModal = dynamic(
  () =>
    import("@/components/TokenPurchaseModal").then(
      (mod) => mod.TokenPurchaseModal,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

const ITEM_TYPES = [
  { value: "phone", label: "Phone / Smartphone", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "laptop", label: "Laptop / PC", icon: Laptop },
  { value: "vehicle", label: "Car / Vehicle", icon: Car },
  { value: "motorcycle", label: "Motorcycle", icon: Zap },
  { value: "generator", label: "Generator", icon: Zap },
  { value: "electronics", label: "Electronics", icon: Cpu },
  { value: "other", label: "Other", icon: Package },
];

export default function RegisterPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [unregisteredListings, setUnregisteredListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");

  useEffect(() => {
    if (session) {
      fetch("/api/user/unregistered-listings")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setUnregisteredListings(data);
        })
        .catch(console.error);
    }
  }, [session]);

  const handleListingSelect = (listingId: string) => {
    setSelectedListingId(listingId);
    if (!listingId || listingId === "none") return;
    const listing = unregisteredListings.find((l) => l._id === listingId);
    if (listing) {
      setForm((prev) => ({
        ...prev,
        brand: listing.brand || prev.brand,
        model: listing.model || listing.title || prev.model,
        description: listing.description || prev.description,
        imei: listing.uniqueIdentifier || prev.imei,
      }));
    }
  };

  const [form, setForm] = useState({
    itemType: "",
    brand: "",
    model: "",
    color: "",
    yearOfPurchase: "",
    serialNumber: "",
    imei: "",
    chassisNumber: "",
    description: "",
  });

  const [imageItems, setImageItems] = useState<{ url: string; file?: File }[]>(
    [],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageItems.length + files.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      const newItems = files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));
      setImageItems((prev) => [...prev, ...newItems]);
    }
  };

  const removeImageItem = (index: number) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-rose-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto" />
          <p className="mt-4 text-gray-900/60">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-rose-950 flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Shield className="h-10 w-10 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Sign In Required
          </h1>
          <p className="text-gray-900/60 max-w-sm">
            You need to be signed in to register a property on FindMaster.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-black shadow-lg shadow-red-500/20 border-0 px-8 py-6 text-lg"
        >
          <Link href="/auth/signin?callbackUrl=/registry/register">
            Sign In to Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.itemType || !form.brand || !form.model) {
      toast.error("Please fill in item type, brand, and model.");
      return;
    }
    if (!form.serialNumber && !form.imei && !form.chassisNumber) {
      toast.error(
        "Please provide at least one identifier: Serial Number, IMEI, or Chassis Number.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      imageItems.forEach((item) => {
        if (item.file) {
          formData.append("images", item.file);
        }
      });
      if (selectedListingId && selectedListingId !== "none") {
        formData.append("listingId", selectedListingId);
      }

      const res = await fetch("/api/registry", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === "LIMIT_EXCEEDED") {
          toast.error(data.error);
          setShowTokenModal(true);
        } else {
          toast.error(data.error || "Failed to register property.");
        }
        return;
      }
      toast.success("Property registered successfully!");
      router.push(`/registry/${data.property._id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-white">
      {/* Hero Section */}
      <section className="relative border-b border-red-500/20 py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
        <div className="container mx-auto px-4 max-w-2xl text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm font-medium text-gray-900 mb-6 backdrop-blur-sm">
            <Shield className="h-4 w-4" /> Property Registry
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-red-200 via-black to-red-200 bg-clip-text text-transparent">
            Register a Property
          </h1>
          <p className="text-gray-900/60 text-lg max-w-xl mx-auto">
            Add your item to the FindMaster registry. This creates a permanent
            record of ownership under your account.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Alert Box */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-gray-900 backdrop-blur-sm mb-8">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-gray-900" />
          <div className="flex-1">
            <p className="text-sm">
              At least one identifier (Serial Number, IMEI, or Chassis Number)
              is required. This is used for registry searches.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-gray-900 text-sm font-medium border border-red-500/20 transition-colors"
          >
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {unregisteredListings.length > 0 && (
            <Card className="bg-black/[0.03] backdrop-blur-sm border-red-500/20 shadow-xl shadow-red-500/5">
              <CardHeader className="border-b border-red-500/10 pb-4">
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-900" />
                  Select from Existing Listings
                  <span className="text-gray-800 font-normal text-sm ml-2">
                    (Optional)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <Select
                  value={selectedListingId}
                  onValueChange={handleListingSelect}
                >
                  <SelectTrigger className="bg-black/[0.05] border-red-500/20 text-black hover:bg-black/[0.08] transition-colors rounded-xl h-11">
                    <SelectValue placeholder="Link an existing listing to autofill details..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-red-500/20 text-black max-h-60">
                    <SelectItem
                      value="none"
                      className="focus:bg-red-500/20 focus:text-black italic"
                    >
                      -- Do not link to a listing --
                    </SelectItem>
                    {unregisteredListings.map((l) => (
                      <SelectItem
                        key={l._id}
                        value={l._id}
                        className="focus:bg-red-500/20 focus:text-black"
                      >
                        {l.title} {l.price ? `(₦${l.price})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Item Details Card */}
          <Card className="bg-black/[0.03] backdrop-blur-sm border-red-500/20 shadow-xl shadow-red-500/5">
            <CardHeader className="border-b border-red-500/10 pb-4">
              <CardTitle className="text-lg text-black flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-900" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="itemType" className="text-gray-900/80 text-sm">
                  Item Type <span className="text-gray-900">*</span>
                </Label>
                <Select
                  value={form.itemType}
                  onValueChange={(v) => set("itemType", v)}
                >
                  <SelectTrigger
                    id="itemType"
                    className="bg-black/[0.05] border-red-500/20 text-black hover:bg-black/[0.08] transition-colors rounded-xl h-11"
                  >
                    <SelectValue placeholder="Select item type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-red-500/20 text-black">
                    {ITEM_TYPES.map((t) => {
                      const IconComponent = t.icon;
                      return (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="focus:bg-red-500/20 focus:text-black"
                        >
                          <span className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-gray-900" />
                            {t.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-gray-900/80 text-sm">
                    Brand / Make <span className="text-gray-900">*</span>
                  </Label>
                  <Input
                    id="brand"
                    placeholder="e.g. Samsung, Toyota, HP"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    className="bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-900/80 text-sm">
                    Model <span className="text-gray-900">*</span>
                  </Label>
                  <Input
                    id="model"
                    placeholder="e.g. Galaxy S24, Camry 2020"
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                    className="bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-gray-900/80 text-sm">
                    Color
                  </Label>
                  <Input
                    id="color"
                    placeholder="e.g. Black, Silver"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-gray-900/80 text-sm">
                    Year of Purchase
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g. 2023"
                    min={1990}
                    max={new Date().getFullYear()}
                    value={form.yearOfPurchase}
                    onChange={(e) => set("yearOfPurchase", e.target.value)}
                    className="bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-900/80 text-sm"
                >
                  Description{" "}
                  <span className="text-gray-900/60">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Any additional details about the item..."
                  className="resize-none min-h-[100px] bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Identifiers Card */}
          <Card className="bg-black/[0.03] backdrop-blur-sm border-red-500/20 shadow-xl shadow-red-500/5">
            <CardHeader className="border-b border-red-500/10 pb-4">
              <CardTitle className="text-lg text-black flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-900" />
                Unique Identifiers
                <span className="text-gray-800 font-normal text-sm ml-2">
                  (at least one required)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="imei" className="text-gray-900/80 text-sm">
                  IMEI Number
                  <span className="text-gray-900/60 text-xs ml-1">
                    (for phones/tablets)
                  </span>
                </Label>
                <Input
                  id="imei"
                  placeholder="15-digit IMEI e.g. 359876054321234"
                  value={form.imei}
                  onChange={(e) => set("imei", e.target.value)}
                  className="font-mono bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                />
                <p className="text-xs text-gray-900/40">
                  Dial *#06# on your phone to find the IMEI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial" className="text-gray-900/80 text-sm">
                  Serial Number
                </Label>
                <Input
                  id="serial"
                  placeholder="e.g. C02X12ABCDEF"
                  value={form.serialNumber}
                  onChange={(e) => set("serialNumber", e.target.value)}
                  className="font-mono bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassis" className="text-gray-900/80 text-sm">
                  Chassis Number
                  <span className="text-gray-900/60 text-xs ml-1">
                    (for vehicles)
                  </span>
                </Label>
                <Input
                  id="chassis"
                  placeholder="17-character VIN e.g. 1HGBH41JXMN109186"
                  value={form.chassisNumber}
                  onChange={(e) => set("chassisNumber", e.target.value)}
                  className="font-mono bg-black/[0.05] border-red-500/20 text-black placeholder:text-gray-900/30 focus:border-red-400/50 rounded-xl h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos Card */}
          <Card className="bg-black/[0.03] backdrop-blur-sm border-red-500/20 shadow-xl shadow-red-500/5">
            <CardHeader className="border-b border-red-500/10 pb-4">
              <CardTitle className="text-lg text-black flex items-center gap-2">
                <Camera className="h-5 w-5 text-gray-900" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {selectedListingId && selectedListingId !== "none" ? (
                (() => {
                  const selectedListing = unregisteredListings.find((l) => l._id === selectedListingId);
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-900 text-sm">
                        <Info className="h-4 w-4 inline mr-2" />
                        We will securely import photos directly from your listing! You do not need to upload new photos.
                      </div>
                      {selectedListing?.images && selectedListing.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {selectedListing.images.map((url: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative aspect-square rounded-xl overflow-hidden border border-red-500/20 bg-red-500/5"
                            >
                              <img
                                src={url}
                                alt="Listing Photo"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-gray-900/80 text-sm">
                      Property Images
                    </Label>
                    <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-gray-900">
                      {imageItems.length}/5
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {imageItems.map((item, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-red-500/20 bg-red-500/5 group hover:border-red-400/40 transition-all"
                      >
                        <img
                          src={item.url}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageItem(index)}
                          className="absolute top-2 right-2 rounded-full bg-red-500/90 text-black p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {imageItems.length < 5 && (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-500/30 bg-red-500/[0.02] hover:bg-red-500/[0.08] hover:border-red-400/50 transition-all group">
                        <Upload className="h-6 w-6 text-gray-900/60 group-hover:text-gray-900 transition-colors" />
                        <span className="mt-2 text-xs text-gray-900/60 group-hover:text-gray-900 transition-colors">
                          Add Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-black shadow-xl shadow-red-500/20 border-0 py-7 text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Register Property
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </div>

      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
    </div>
  );
}
