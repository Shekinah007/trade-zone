"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Shield,
  Loader2,
  ArrowLeft,
  Smartphone,
  Car,
  Laptop,
  Tablet,
  Cpu,
  Zap,
  Package,
  Computer,
  Armchair,
  Shirt,
  AlertCircle,
  Save,
  Check,
  X,
  Upload,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

const ITEM_TYPES = [
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "computer", label: "Computer", icon: Computer },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "laptop", label: "Laptop / PC", icon: Laptop },
  { value: "furniture", label: "Furniture", icon: Armchair },
  { value: "fashion", label: "Fashion", icon: Shirt },
  { value: "vehicle", label: "Vehicle", icon: Car },
  { value: "motorcycle", label: "Motorcycle", icon: Zap },
  { value: "generator", label: "Generator", icon: Zap },
  { value: "electronics", label: "Electronics", icon: Cpu },
  { value: "other", label: "Other", icon: Package },
];

function BrightField({
  label,
  id,
  required,
  hint,
  children,
}: {
  label: string;
  id?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5 ml-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {hint && (
        <p className="text-[11px] text-gray-400 mb-1.5 ml-1 leading-snug">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function BrightInput({
  className,
  mono,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        className={cn(
          "w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 text-sm transition-all text-gray-800 placeholder:text-gray-400 border focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none",
          mono && "font-mono tracking-wider",
          suffix && "pr-16",
          className,
        )}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
    </div>
  );
}

export default function EditRegistryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [property, setProperty] = useState<any>(null);

  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [imageItems, setImageItems] = useState<{ url: string; file?: File }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (keptImages.length + imageItems.length + files.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      setIsCompressing(true);
      setCompressionProgress(0);
      const progressMap = new Map<number, number>();

      const compressedItems = await Promise.all(
        files.map(async (file, index) => {
          try {
            const compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              onProgress: (p) => {
                progressMap.set(index, p);
                let total = 0;
                progressMap.forEach((val) => {
                  total += val;
                });
                setCompressionProgress(Math.round(total / files.length));
              },
            });
            return {
              url: URL.createObjectURL(compressedFile),
              file: compressedFile,
            };
          } catch (error) {
            console.error("Image compression error:", error);
            progressMap.set(index, 100);
            return {
              url: URL.createObjectURL(file),
              file,
            };
          }
        }),
      );

      setIsCompressing(false);
      setCompressionProgress(0);
      setImageItems((p) => [...p, ...compressedItems]);
    }
  };

  const [form, setForm] = useState({
    itemType: "",
    brand: "",
    model: "",
    description: "",
    serialNumber: "",
    imei: "",
    chassisNumber: "",
    color: "",
    yearOfPurchase: "",
  });

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/registry/${id}`);
        if (res.status === 401) {
          setError("Please sign in to edit this property.");
          return;
        }
        if (!res.ok) {
          setError("Property not found.");
          return;
        }
        const data = await res.json();
        
        // Ensure user has permission
        // TODO: Check if user is owner or admin based on session data
        
        setProperty(data.property);
        setForm({
          itemType: data.property.itemType || "",
          brand: data.property.brand || "",
          model: data.property.model || "",
          description: data.property.description || "",
          serialNumber: data.property.serialNumber || "",
          imei: data.property.imei || "",
          chassisNumber: data.property.chassisNumber || "",
          color: data.property.color || "",
          yearOfPurchase: data.property.yearOfPurchase || "",
        });
        if (data.property.images) {
          setKeptImages(data.property.images);
        }
      } catch {
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    };
    if (session) {
      fetch_();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to edit this property.");
    }
  }, [id, session, status]);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemType || !form.brand || !form.model) {
      toast.error("Please fill in item type, brand, and model.");
      return;
    }
    if (!form.serialNumber && !form.imei && !form.chassisNumber) {
      toast.error("Please provide at least one identifier.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) formData.append(k, v.toString());
      });
      
      formData.append("keptImages", JSON.stringify(keptImages));
      imageItems.forEach((item) => {
        if (item.file) formData.append("images", item.file);
      });

      const res = await fetch(`/api/registry/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Property updated successfully!");
        router.push(`/registry/${id}`);
      } else {
        toast.error(data.error || "Failed to update property.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Shield className="h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-800">{error}</h2>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const hasIdentifier = !!(form.serialNumber || form.imei || form.chassisNumber);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-sm shadow-red-200">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">
                Property Registry
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-500 font-medium">
                Edit Property
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/registry/${id}`)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Edit <span className="text-red-500">Property Details</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Update the registry information for your {property?.brand} {property?.model}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Item Details */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-mono">01</span>
              Item Details
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div>
                <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5 ml-1 mb-2.5">
                  Item Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {ITEM_TYPES.map(({ value, label, icon: Icon }) => {
                    const selected = form.itemType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("itemType", value)}
                        className={cn(
                          "flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 text-center transition-all text-xs font-semibold",
                          selected
                            ? "bg-red-50 border-red-400 text-red-600 shadow-sm shadow-red-100"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 hover:text-gray-700",
                        )}
                      >
                        <Icon
                          className={cn("h-5 w-5", selected ? "text-red-500" : "text-gray-400")}
                        />
                        {label.split(" / ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <BrightField label="Brand / Make" required id="brand">
                  <BrightInput
                    id="brand"
                    placeholder="e.g. Samsung, Toyota, HP"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                  />
                </BrightField>
                <BrightField label="Model" required id="model">
                  <BrightInput
                    id="model"
                    placeholder="e.g. Galaxy S24, Camry"
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                  />
                </BrightField>
                <BrightField label="Color" id="color">
                  <BrightInput
                    id="color"
                    placeholder="e.g. Midnight Black"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                  />
                </BrightField>
                <BrightField label="Year of Purchase" id="year">
                  <BrightInput
                    id="year"
                    type="number"
                    placeholder={String(new Date().getFullYear() - 1)}
                    min={1990}
                    max={new Date().getFullYear()}
                    value={form.yearOfPurchase}
                    onChange={(e) => set("yearOfPurchase", e.target.value)}
                  />
                </BrightField>
              </div>

              <BrightField
                label="Description"
                id="desc"
                hint="Distinguishing features, accessories, etc."
              >
                <Tiptap
                  value={form.description}
                  onChange={(val) => set("description", val)}
                />
              </BrightField>
            </div>
          </section>

          {/* Identifiers */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-mono">02</span>
              Identifiers
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Provide at least one unique identifier. This ensures your property can be found in the registry.
                </p>
              </div>

              <BrightField
                label="Serial Number"
                id="serial"
                hint="Check device settings, box, or bottom sticker"
              >
                <BrightInput
                  id="serial"
                  mono
                  placeholder="C02X12ABCDEF"
                  value={form.serialNumber}
                  onChange={(e) => set("serialNumber", e.target.value)}
                />
              </BrightField>

              <BrightField
                label="IMEI Number"
                id="imei"
                hint="Phones & tablets · Dial *#06# to find it"
              >
                <BrightInput
                  id="imei"
                  mono
                  placeholder="359876054321234"
                  value={form.imei}
                  onChange={(e) => set("imei", e.target.value)}
                  maxLength={17}
                  suffix={
                    form.imei.length > 0 && (
                      <span className={cn("text-[10px] font-mono font-bold", form.imei.length >= 15 ? "text-green-500" : "text-gray-400")}>
                        {form.imei.length}/15
                      </span>
                    )
                  }
                />
              </BrightField>

              <BrightField
                label="Chassis / VIN Number"
                id="chassis"
                hint="For vehicles — 17-character VIN"
              >
                <BrightInput
                  id="chassis"
                  mono
                  placeholder="1HGBH41JXMN109186"
                  value={form.chassisNumber}
                  onChange={(e) => set("chassisNumber", e.target.value)}
                  maxLength={17}
                  suffix={
                    form.chassisNumber.length > 0 && (
                      <span className={cn("text-[10px] font-mono font-bold", form.chassisNumber.length === 17 ? "text-green-500" : "text-gray-400")}>
                        {form.chassisNumber.length}/17
                      </span>
                    )
                  }
                />
              </BrightField>

              <div className={cn(
                "flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-semibold border transition-all mt-4",
                hasIdentifier
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              )}>
                {hasIdentifier ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    Valid identifier(s) provided
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                    Waiting for at least one identifier
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Photos */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-mono">03</span>
              Photos
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Manage photos for identification purposes
                </p>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                    keptImages.length + imageItems.length >= 5
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {keptImages.length + imageItems.length}/5
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {keptImages.map((url, index) => (
                  <div
                    key={`kept-${index}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                  >
                    <img
                      src={url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button
                      type="button"
                      onClick={() =>
                        setKeptImages((p) => p.filter((_, i) => i !== index))
                      }
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imageItems.map((item, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                  >
                    <img
                      src={item.url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button
                      type="button"
                      onClick={() =>
                        setImageItems((p) => p.filter((_, i) => i !== index))
                      }
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {keptImages.length + imageItems.length < 5 && !isCompressing && (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex flex-col shadow-sm">
                    {/* Gallery */}
                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-all group border-b border-dashed border-gray-300">
                      <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-red-100 border border-gray-200 group-hover:border-red-200 flex items-center justify-center transition-all shadow-sm">
                        <Upload className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-red-500 transition-colors font-semibold mt-1.5">
                        Gallery
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {/* Camera */}
                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-gray-50 hover:bg-red-50 transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-red-100 border border-gray-200 group-hover:border-red-200 flex items-center justify-center transition-all shadow-sm">
                        <Camera className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-red-500 transition-colors font-semibold mt-1.5">
                        Camera
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
                {isCompressing && (
                  <div className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <Loader2 className="h-5 w-5 text-red-500 animate-spin mb-2" />
                    <span className="text-xs font-medium text-red-500">
                      {compressionProgress}%
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
                      Compressing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 h-12 px-6"
              onClick={() => router.push(`/registry/${id}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0 shadow-md shadow-red-200 h-12 px-8"
              disabled={submitting || !hasIdentifier || isCompressing}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
