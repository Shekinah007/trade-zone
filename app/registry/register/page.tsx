"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Check,
  Lock,
  Fingerprint,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

import imageCompression from "browser-image-compression";

const TokenPurchaseModal = dynamic(
  () =>
    import("@/components/TokenPurchaseModal").then(
      (mod) => mod.TokenPurchaseModal,
    ),
  { ssr: false, loading: () => null },
);

const ITEM_TYPES = [
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "laptop", label: "Laptop / PC", icon: Laptop },
  { value: "vehicle", label: "Vehicle", icon: Car },
  { value: "motorcycle", label: "Motorcycle", icon: Zap },
  { value: "generator", label: "Generator", icon: Zap },
  { value: "electronics", label: "Electronics", icon: Cpu },
  { value: "other", label: "Other", icon: Package },
];

const SECTIONS = [
  { num: "01", label: "Link Listing", hint: "Optional" },
  { num: "02", label: "Item Details", hint: "Required" },
  { num: "03", label: "Identifiers", hint: "Min. 1" },
  { num: "04", label: "Photos", hint: "Optional" },
];

function RegisterPropertyForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultListingId = searchParams?.get("listingId");
  const [submitting, setSubmitting] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const [unregisteredListings, setUnregisteredListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState(
    defaultListingId || "",
  );

  useEffect(() => {
    if (session) {
      fetch("/api/user/unregistered-listings")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setUnregisteredListings(data);
            if (defaultListingId) {
              const listing = data.find((l) => l._id === defaultListingId);
              if (listing) {
                setForm((p) => ({
                  ...p,
                  brand: listing.brand || p.brand,
                  model: listing.model || listing.listing?.title || p.model,
                  description: listing.description || p.description,
                  imei: listing.uniqueIdentifier || p.imei,
                }));
              }
            }
          }
        })
        .catch(console.error);
    }
  }, [session, defaultListingId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.findIndex(
              (r) => r.current === entry.target,
            );
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    sectionRefs.forEach((r) => r.current && observer.observe(r.current));
    return () => observer.disconnect();
  }, []);

  const handleListingSelect = (listingId: string) => {
    setSelectedListingId(listingId);
    if (!listingId || listingId === "none") return;
    const listing = unregisteredListings.find((l) => l._id === listingId);
    if (listing) {
      setForm((p) => ({
        ...p,
        brand: listing.brand || p.brand,
        model: listing.model || listing.listing?.title || p.model,
        description: listing.description || p.description,
        imei: listing.uniqueIdentifier || p.imei,
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageItems.length + files.length > 5) {
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

  const set = (key: string, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

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
        if (v) formData.append(k, v);
      });
      imageItems.forEach((item) => {
        if (item.file) formData.append("images", item.file);
      });
      if (selectedListingId && selectedListingId !== "none")
        formData.append("itemId", selectedListingId);

      const res = await fetch("/api/registry", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "LIMIT_EXCEEDED") {
          toast.error(data.error);
          setShowTokenModal(true);
        } else toast.error(data.error || "Failed to register property.");
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

  const hasIdentifier = !!(
    form.serialNumber ||
    form.imei ||
    form.chassisNumber
  );
  const sectionComplete = [
    true,
    !!(form.itemType && form.brand && form.model),
    hasIdentifier,
    true,
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-200">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
          <p className="text-gray-400 text-sm tracking-wide">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-8 text-center px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-3xl bg-white border-2 border-red-100 flex items-center justify-center shadow-xl">
            <Lock className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Sign In Required
          </h1>
          <p className="text-gray-500 max-w-sm leading-relaxed">
            You need to be signed in to register a property on FindMaster.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-red-200 border-0"
        >
          <Link href="/auth/signin?callbackUrl=/registry/register">
            Sign In to Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-sm shadow-red-200">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">
                Property Registry
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-md">
                NEW ENTRY
              </span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-14">
          {/* ── LEFT sticky spine ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              {/* Hero */}
              <div className="mb-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-widest mb-4">
                  <span className="w-4 h-0.5 bg-red-400 rounded-full inline-block" />
                  Secure Registry
                </span>
                <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tight">
                  Register
                  <br />
                  <span className="text-red-500">Property</span>
                </h1>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-[200px]">
                  Create a permanent ownership record. Searchable and protected.
                </p>
              </div>

              {/* Steps */}
              <nav className="space-y-1.5 border-l-2 border-gray-100 pl-5 ml-1">
                {SECTIONS.map((s, i) => {
                  const done = sectionComplete[i] && activeSection > i;
                  const active = activeSection === i;
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        sectionRefs[i].current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                      className={`w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl transition-all text-left group -ml-5 pl-[calc(1.25rem+0.875rem)] border ${
                        active
                          ? "bg-red-50 border-red-100 -ml-[2px] border-l-[3px] border-l-red-500 rounded-l-none"
                          : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black font-mono transition-all ${
                          done
                            ? "bg-green-500 text-white shadow-sm shadow-green-200"
                            : active
                              ? "bg-red-500 text-white shadow-md shadow-red-200"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : s.num}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${active ? "text-red-600" : done ? "text-green-600" : "text-gray-500 group-hover:text-gray-700"}`}
                        >
                          {s.label}
                        </p>
                        <p
                          className={`text-[11px] ${active ? "text-red-400" : done ? "text-green-400" : "text-gray-400"}`}
                        >
                          {s.hint}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Trust badge */}
              <div className="mt-8 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <Fingerprint className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Protected
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Registry entries are permanent and tied to your verified
                  account.
                </p>
              </div>
            </div>
          </aside>

          {/* ── RIGHT form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mobile header */}
            <div className="lg:hidden mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-widest mb-3">
                <span className="w-4 h-0.5 bg-red-400 rounded-full inline-block" />{" "}
                Secure Registry
              </span>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Register <span className="text-red-500">Property</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Create a permanent ownership record for your item.
              </p>
            </div>

            {/* SECTION 01 — Link Listing */}
            {unregisteredListings.length > 0 && (
              <section ref={sectionRefs[0]} className="scroll-mt-24">
                <SectionHeader
                  num="01"
                  title="Link Listing"
                  subtitle="Optional — autofill details from an existing ad"
                />
                <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <Select
                    value={selectedListingId}
                    onValueChange={handleListingSelect}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-700 focus:ring-1 focus:ring-red-400 focus:border-red-400 hover:bg-gray-100 transition-colors">
                      <SelectValue placeholder="Select a listing to link…" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-gray-700 shadow-xl rounded-xl">
                      <SelectItem
                        value="none"
                        className="focus:bg-gray-50 text-gray-400 italic"
                      >
                        — Don't link to a listing —
                      </SelectItem>
                      {unregisteredListings.map((l) => (
                        <SelectItem
                          key={l._id}
                          value={l._id}
                          className="focus:bg-red-50 focus:text-red-700"
                        >
                          {l.listing?.title || l.model}
                          {l.listing?.price
                            ? ` · ₦${l.listing.price.toLocaleString()}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>
            )}

            {/* SECTION 02 — Item Details */}
            <section
              ref={sectionRefs[unregisteredListings.length > 0 ? 1 : 0]}
              className="scroll-mt-24"
            >
              <SectionHeader
                num="02"
                title="Item Details"
                subtitle="Describe the property you're registering"
              />
              <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
                {/* Item type grid */}
                <div>
                  <BrightLabel>
                    Item Type <Req />
                  </BrightLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
                    {ITEM_TYPES.map(({ value, label, icon: Icon }) => {
                      const selected = form.itemType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => set("itemType", value)}
                          className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 text-center transition-all text-xs font-semibold ${
                            selected
                              ? "bg-red-50 border-red-400 text-red-600 shadow-md shadow-red-100"
                              : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 hover:text-gray-700 hover:shadow-sm"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${selected ? "text-red-500" : "text-gray-400"}`}
                          />
                          {label.split(" / ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  hint="Optional — distinguishing features, accessories, etc."
                >
                  <textarea
                    id="desc"
                    placeholder="Describe the item in detail…"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    className="w-full resize-none bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all hover:border-gray-300"
                  />
                </BrightField>
              </div>
            </section>

            {/* SECTION 03 — Identifiers */}
            <section
              ref={sectionRefs[unregisteredListings.length > 0 ? 2 : 1]}
              className="scroll-mt-24"
            >
              <SectionHeader
                num="03"
                title="Unique Identifiers"
                subtitle="At least one is required for registry search"
              />

              {/* Alert */}
              <div className="mt-3 flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Phones/tablets → IMEI &nbsp;·&nbsp; Laptops/electronics →
                  Serial Number &nbsp;·&nbsp; Vehicles → Chassis Number
                </p>
              </div>

              <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
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
                        <span
                          className={`text-[10px] font-mono font-bold ${form.imei.length === 15 ? "text-green-500" : "text-gray-400"}`}
                        >
                          {form.imei.length}/15
                        </span>
                      )
                    }
                  />
                </BrightField>

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
                        <span
                          className={`text-[10px] font-mono font-bold ${form.chassisNumber.length === 17 ? "text-green-500" : "text-gray-400"}`}
                        >
                          {form.chassisNumber.length}/17
                        </span>
                      )
                    }
                  />
                </BrightField>

                {/* Identifier status */}
                <div
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold border transition-all ${
                    hasIdentifier
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {hasIdentifier ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>{" "}
                      Identifier captured — item is searchable in the registry
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />{" "}
                      Fill in at least one identifier above
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 04 — Photos */}
            <section
              ref={sectionRefs[unregisteredListings.length > 0 ? 3 : 2]}
              className="scroll-mt-24"
            >
              <SectionHeader
                num="04"
                title="Photos"
                subtitle="Up to 5 images · Optional but recommended"
              />
              <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                {selectedListingId && selectedListingId !== "none" ? (
                  (() => {
                    const sel = unregisteredListings.find(
                      (l) => l._id === selectedListingId,
                    );
                    return (
                      <div className="space-y-4">
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                          <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                          Photos will be imported automatically from your linked
                          listing.
                        </div>
                        {sel?.images?.length > 0 && (
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {sel.images.map((url: string, idx: number) => (
                              <div
                                key={idx}
                                className="aspect-square rounded-xl overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={url}
                                  alt=""
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
                      <p className="text-sm text-gray-500">
                        Add photos for identification purposes
                      </p>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                          imageItems.length >= 5
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {imageItems.length}/5
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {imageItems.map((item, index) => (
                        <div
                          key={index}
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
                              setImageItems((p) =>
                                p.filter((_, i) => i !== index),
                              )
                            }
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center  group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {/* {imageItems.length < 5 && !isCompressing && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group shadow-sm">
                          <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-red-100 border border-gray-200 group-hover:border-red-200 flex items-center justify-center transition-all shadow-sm">
                            <Upload className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </div>
                          <span className="text-[10px] text-gray-400 group-hover:text-red-500 transition-colors font-semibold">
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
                      )} */}

                      {imageItems.length < 5 && !isCompressing && (
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
                  </>
                )}
              </div>
            </section>

            {/* ── Submit ── */}
            <div className="pt-2 pb-12">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                {/* Checklist */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Checklist
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Item type selected", ok: !!form.itemType },
                      {
                        label: "Brand & model filled",
                        ok: !!(form.brand && form.model),
                      },
                      { label: "Identifier provided", ok: hasIdentifier },
                      {
                        label: "Photos added",
                        ok:
                          imageItems.length > 0 ||
                          (!!selectedListingId && selectedListingId !== "none"),
                      },
                    ].map((v, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border font-medium transition-all ${
                          v.ok
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        {v.ok ? (
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                        )}
                        {v.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-red-200 active:scale-[0.99] group"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Registering
                      Property…
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Register Property
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <TokenPurchaseModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────── */

function SectionHeader({
  num,
  title,
  subtitle,
}: {
  num: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow-md shadow-red-200 mt-0.5">
        <span className="text-white text-xs font-black font-mono">{num}</span>
      </div>
      <div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function BrightLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
      {children}
    </p>
  );
}

function Req() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function BrightField({
  label,
  id,
  required,
  hint,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function BrightInput({
  mono,
  suffix,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean;
  suffix?: React.ReactNode;
}) {
  const base = `w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all hover:border-gray-300 ${mono ? "font-mono tracking-wider" : ""}`;

  if (suffix) {
    return (
      <div className="relative">
        <input {...props} className={`${base} pr-14 ${className}`} />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      </div>
    );
  }
  return <input {...props} className={`${base} ${className}`} />;
}

export default function RegisterPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-200">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
            <p className="text-gray-400 text-sm">Loading form…</p>
          </div>
        </div>
      }
    >
      <RegisterPropertyForm />
    </Suspense>
  );
}
