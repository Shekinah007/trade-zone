"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Shield,
  Loader2,
  ArrowRight,
  Info,
  Smartphone,
  Car,
  Laptop,
  Cpu,
  ImagePlus,
  Upload,
  X,
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

const ITEM_TYPES = [
  { value: "phone", label: "Phone / Smartphone", icon: "📱" },
  { value: "tablet", label: "Tablet", icon: "📟" },
  { value: "laptop", label: "Laptop / PC", icon: "💻" },
  { value: "vehicle", label: "Car / Vehicle", icon: "🚗" },
  { value: "motorcycle", label: "Motorcycle", icon: "🏍️" },
  { value: "generator", label: "Generator", icon: "⚡" },
  { value: "electronics", label: "Electronics", icon: "🖥️" },
  { value: "other", label: "Other", icon: "📦" },
];

export default function RegisterPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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

  const [imageItems, setImageItems] = useState<{ url: string; file?: File }[]>([]);

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Sign In Required</h1>
        <p className="text-muted-foreground max-w-sm">
          You need to be signed in to register a property on FindMasters.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/auth/signin?callbackUrl=/registry/register">
            Sign In to Continue <ArrowRight className="ml-2 h-4 w-4" />
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
        "Please provide at least one identifier: Serial Number, IMEI, or Chassis Number."
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

      const res = await fetch("/api/registry", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to register property.");
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
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium text-primary mb-4">
            <Shield className="h-3.5 w-3.5" /> Property Registry
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Register a Property
          </h1>
          <p className="text-muted-foreground">
            Add your item to the FindMasters registry. This creates a permanent
            record of ownership under your account.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm mb-8">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            At least one identifier (Serial Number, IMEI, or Chassis Number) is
            required. This is used for registry searches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemType">Item Type *</Label>
                <Select
                  value={form.itemType}
                  onValueChange={(v) => set("itemType", v)}
                >
                  <SelectTrigger id="itemType">
                    <SelectValue placeholder="Select item type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand / Make *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g. Samsung, Toyota, HP"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g. Galaxy S24, Camry 2020"
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g. Black, Silver"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Purchase</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g. 2023"
                    min={1990}
                    max={new Date().getFullYear()}
                    value={form.yearOfPurchase}
                    onChange={(e) => set("yearOfPurchase", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any additional details about the item..."
                  className="resize-none min-h-[80px]"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Identifiers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Unique Identifiers{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  (at least one required)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI Number (for phones/tablets)</Label>
                <Input
                  id="imei"
                  placeholder="15-digit IMEI e.g. 359876054321234"
                  value={form.imei}
                  onChange={(e) => set("imei", e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Dial *#06# on your phone to find the IMEI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  placeholder="e.g. C02X12ABCDEF"
                  value={form.serialNumber}
                  onChange={(e) => set("serialNumber", e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassis">Chassis Number (for vehicles)</Label>
                <Input
                  id="chassis"
                  placeholder="17-character VIN e.g. 1HGBH41JXMN109186"
                  value={form.chassisNumber}
                  onChange={(e) => set("chassisNumber", e.target.value)}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImagePlus className="h-4 w-4" /> Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Label>Property Images</Label>
                <span className="text-xs text-muted-foreground">{imageItems.length}/5</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {imageItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
                  >
                    <img
                      src={item.url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageItem(index)}
                      className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {imageItems.length < 5 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="mt-1.5 text-xs text-muted-foreground group-hover:text-primary">
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
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 border-0 shadow-lg"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            {submitting ? "Registering..." : "Register Property"}
          </Button>
        </form>
      </div>
    </div>
  );
}
