"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Rocket,
  Star,
  ShieldCheck,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "settings" | "packs" | "boosts" | "featured";

interface Pack {
  _id: string;
  name: string;
  slotCount: number;
  priceNGN: number;
  creditCost: number;
}

interface Tier {
  _id: string;
  name: string;
  durationInDays: number;
  priceNGN: number;
  creditCost: number;
}

const EMPTY_PACK = { name: "", slotCount: 0, priceNGN: 0, creditCost: 0 };
const EMPTY_TIER = { name: "", durationInDays: 0, priceNGN: 0, creditCost: 0 };

export default function AdminMonetizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("settings");

  // Settings
  const [registrationCreditCost, setRegistrationCreditCost] = useState(10);
  const [registrationPriceNGN, setRegistrationPriceNGN] = useState(1000);
  const [unlimitedRegistrationPriceNGN, setUnlimitedRegistrationPriceNGN] =
    useState(10000);
  const [freeListingQuota, setFreeListingQuota] = useState(3);
  const [globalListingExpiryDays, setGlobalListingExpiryDays] = useState(60);
  const [maxFeaturedSlots, setMaxFeaturedSlots] = useState(5);

  // Collections
  const [listingPacks, setListingPacks] = useState<Pack[]>([]);
  const [boostTiers, setBoostTiers] = useState<Tier[]>([]);
  const [featuredTiers, setFeaturedTiers] = useState<Tier[]>([]);

  // New item forms
  const [newPack, setNewPack] = useState(EMPTY_PACK);
  const [newTier, setNewTier] = useState(EMPTY_TIER);
  const [newFeaturedTier, setNewFeaturedTier] = useState(EMPTY_TIER);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, packsRes, tiersRes, featuredTiersRes] =
        await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/listing-packs"),
          fetch("/api/admin/boost-tiers"),
          fetch("/api/admin/featured-tiers"),
        ]);
      if (settingsRes.ok) {
        const { settings } = await settingsRes.json();
        if (settings) {
          setRegistrationCreditCost(settings.registrationCreditCost ?? 10);
          setRegistrationPriceNGN(settings.registrationPriceNGN ?? 1000);
          setUnlimitedRegistrationPriceNGN(
            settings.unlimitedRegistrationPriceNGN ?? 10000,
          );
          setFreeListingQuota(settings.freeListingQuota ?? 3);
          setGlobalListingExpiryDays(settings.globalListingExpiryDays ?? 60);
          setMaxFeaturedSlots(settings.maxFeaturedSlots ?? 5);
        }
      }
      if (packsRes.ok) setListingPacks(await packsRes.json());
      if (tiersRes.ok) setBoostTiers(await tiersRes.json());
      if (featuredTiersRes.ok) setFeaturedTiers(await featuredTiersRes.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCreditCost,
          registrationPriceNGN,
          unlimitedRegistrationPriceNGN,
          freeListingQuota,
          globalListingExpiryDays,
          maxFeaturedSlots,
        }),
      });
      const data = await res.json();
      data.success ? toast.success("Settings saved.") : toast.error(data.error);
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPack = async () => {
    const res = await fetch("/api/admin/listing-packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPack),
    });
    if (res.ok) {
      fetchData();
      setNewPack(EMPTY_PACK);
      toast.success("Pack added.");
    }
  };

  const handleDeletePack = async (id: string) => {
    if (!confirm("Delete this pack?")) return;
    await fetch(`/api/admin/listing-packs?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddTier = async () => {
    const res = await fetch("/api/admin/boost-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTier),
    });
    if (res.ok) {
      fetchData();
      setNewTier(EMPTY_TIER);
      toast.success("Boost tier added.");
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!confirm("Delete this tier?")) return;
    await fetch(`/api/admin/boost-tiers?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddFeaturedTier = async () => {
    const res = await fetch("/api/admin/featured-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFeaturedTier),
    });
    if (res.ok) {
      fetchData();
      setNewFeaturedTier(EMPTY_TIER);
      toast.success("Featured tier added.");
    }
  };

  const handleDeleteFeaturedTier = async (id: string) => {
    if (!confirm("Delete this featured tier?")) return;
    await fetch(`/api/admin/featured-tiers?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "settings",
      label: "Global settings",
      icon: <DollarSign className="w-3.5 h-3.5" />,
    },
    {
      id: "packs",
      label: "Listing packs",
      icon: <Package className="w-3.5 h-3.5" />,
    },
    {
      id: "boosts",
      label: "Boost tiers",
      icon: <Rocket className="w-3.5 h-3.5" />,
    },
    {
      id: "featured",
      label: "Featured tiers",
      icon: <Star className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-4xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Monetization
              </h1>
              <p className="text-sm text-muted-foreground">
                Credits, listing packs, boosts &amp; featured tiers
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-muted-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-6">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                    activeTab === t.id
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── Global Settings ── */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <SectionCard
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  title="Property registration"
                >
                  <FieldGrid>
                    <Field label="Credit cost per registration">
                      <input
                        type="number"
                        value={registrationCreditCost}
                        onChange={(e) =>
                          setRegistrationCreditCost(Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Price per registration (₦)">
                      <input
                        type="number"
                        value={registrationPriceNGN}
                        onChange={(e) =>
                          setRegistrationPriceNGN(Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Unlimited registration price (₦)">
                      <input
                        type="number"
                        value={unlimitedRegistrationPriceNGN}
                        onChange={(e) =>
                          setUnlimitedRegistrationPriceNGN(
                            Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  </FieldGrid>
                </SectionCard>

                <SectionCard
                  icon={<List className="w-4 h-4 text-blue-500" />}
                  title="Listing limits"
                >
                  <FieldGrid>
                    <Field label="Free listing quota per user">
                      <input
                        type="number"
                        value={freeListingQuota}
                        onChange={(e) =>
                          setFreeListingQuota(Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Listing expiry (days)">
                      <input
                        type="number"
                        value={globalListingExpiryDays}
                        onChange={(e) =>
                          setGlobalListingExpiryDays(Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Max featured slots">
                      <input
                        type="number"
                        value={maxFeaturedSlots}
                        onChange={(e) =>
                          setMaxFeaturedSlots(Number(e.target.value))
                        }
                      />
                    </Field>
                  </FieldGrid>
                </SectionCard>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save settings
                </button>
              </form>
            )}

            {/* ── Listing Packs ── */}
            {activeTab === "packs" && (
              <SectionCard
                icon={<Package className="w-4 h-4 text-blue-500" />}
                title="Listing packs"
                badge={`${listingPacks.length} active`}
                badgeColor="blue"
              >
                {listingPacks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No listing packs yet.
                  </p>
                )}
                <div className="space-y-2 mb-6">
                  {listingPacks.map((pack) => (
                    <ItemRow
                      key={pack._id}
                      name={pack.name}
                      meta={`${pack.slotCount} slots · ₦${pack.priceNGN.toLocaleString()} · ${pack.creditCost} credits`}
                      onDelete={() => handleDeletePack(pack._id)}
                    />
                  ))}
                </div>
                <AddDivider label="Add new pack" />
                <AddGrid>
                  <Field label="Pack name">
                    <input
                      type="text"
                      placeholder="e.g. Starter"
                      value={newPack.name}
                      onChange={(e) =>
                        setNewPack({ ...newPack, name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Slots">
                    <input
                      type="number"
                      placeholder="5"
                      value={newPack.slotCount || ""}
                      onChange={(e) =>
                        setNewPack({
                          ...newPack,
                          slotCount: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Price (₦)">
                    <input
                      type="number"
                      placeholder="2500"
                      value={newPack.priceNGN || ""}
                      onChange={(e) =>
                        setNewPack({
                          ...newPack,
                          priceNGN: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Credit cost">
                    <input
                      type="number"
                      placeholder="25"
                      value={newPack.creditCost || ""}
                      onChange={(e) =>
                        setNewPack({
                          ...newPack,
                          creditCost: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </AddGrid>
                <AddButton color="blue" onClick={handleAddPack}>
                  Add pack
                </AddButton>
              </SectionCard>
            )}

            {/* ── Boost Tiers ── */}
            {activeTab === "boosts" && (
              <SectionCard
                icon={<Rocket className="w-4 h-4 text-amber-500" />}
                title="Boost tiers"
                badge={`${boostTiers.length} active`}
                badgeColor="amber"
              >
                {boostTiers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No boost tiers yet.
                  </p>
                )}
                <div className="space-y-2 mb-6">
                  {boostTiers.map((tier) => (
                    <ItemRow
                      key={tier._id}
                      name={tier.name}
                      meta={`${tier.durationInDays} days · ₦${tier.priceNGN.toLocaleString()} · ${tier.creditCost} credits`}
                      onDelete={() => handleDeleteTier(tier._id)}
                    />
                  ))}
                </div>
                <AddDivider label="Add new boost tier" />
                <AddGrid>
                  <Field label="Tier name">
                    <input
                      type="text"
                      placeholder="e.g. 7-day boost"
                      value={newTier.name}
                      onChange={(e) =>
                        setNewTier({ ...newTier, name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Duration (days)">
                    <input
                      type="number"
                      placeholder="7"
                      value={newTier.durationInDays || ""}
                      onChange={(e) =>
                        setNewTier({
                          ...newTier,
                          durationInDays: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Price (₦)">
                    <input
                      type="number"
                      placeholder="1500"
                      value={newTier.priceNGN || ""}
                      onChange={(e) =>
                        setNewTier({
                          ...newTier,
                          priceNGN: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Credit cost">
                    <input
                      type="number"
                      placeholder="15"
                      value={newTier.creditCost || ""}
                      onChange={(e) =>
                        setNewTier({
                          ...newTier,
                          creditCost: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </AddGrid>
                <AddButton color="amber" onClick={handleAddTier}>
                  Add boost tier
                </AddButton>
              </SectionCard>
            )}

            {/* ── Featured Tiers ── */}
            {activeTab === "featured" && (
              <SectionCard
                icon={<Star className="w-4 h-4 text-purple-500" />}
                title="Featured tiers"
                badge={`${featuredTiers.length} active`}
                badgeColor="purple"
              >
                {featuredTiers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No featured tiers yet.
                  </p>
                )}
                <div className="space-y-2 mb-6">
                  {featuredTiers.map((tier) => (
                    <ItemRow
                      key={tier._id}
                      name={tier.name}
                      meta={`${tier.durationInDays} days · ₦${tier.priceNGN.toLocaleString()} · ${tier.creditCost} credits`}
                      onDelete={() => handleDeleteFeaturedTier(tier._id)}
                    />
                  ))}
                </div>
                <AddDivider label="Add new featured tier" />
                <AddGrid>
                  <Field label="Tier name">
                    <input
                      type="text"
                      placeholder="e.g. Weekend feature"
                      value={newFeaturedTier.name}
                      onChange={(e) =>
                        setNewFeaturedTier({
                          ...newFeaturedTier,
                          name: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Duration (days)">
                    <input
                      type="number"
                      placeholder="3"
                      value={newFeaturedTier.durationInDays || ""}
                      onChange={(e) =>
                        setNewFeaturedTier({
                          ...newFeaturedTier,
                          durationInDays: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Price (₦)">
                    <input
                      type="number"
                      placeholder="3000"
                      value={newFeaturedTier.priceNGN || ""}
                      onChange={(e) =>
                        setNewFeaturedTier({
                          ...newFeaturedTier,
                          priceNGN: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Credit cost">
                    <input
                      type="number"
                      placeholder="30"
                      value={newFeaturedTier.creditCost || ""}
                      onChange={(e) =>
                        setNewFeaturedTier({
                          ...newFeaturedTier,
                          creditCost: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </AddGrid>
                <AddButton color="purple" onClick={handleAddFeaturedTier}>
                  Add featured tier
                </AddButton>
              </SectionCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  badge,
  badgeColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: "blue" | "amber" | "purple" | "green";
  children: React.ReactNode;
}) {
  const badgeStyles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  };
  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        {badge && badgeColor && (
          <span
            className={cn(
              "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
              badgeStyles[badgeColor],
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function AddGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="[&_input]:w-full [&_input]:text-sm [&_input]:px-3 [&_input]:py-2 [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-200 [&_input]:dark:border-gray-700 [&_input]:bg-gray-50 [&_input]:dark:bg-gray-800/50 [&_input]:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-emerald-500/20 [&_input]:focus:border-emerald-400">
        {children}
      </div>
    </div>
  );
}

function ItemRow({
  name,
  meta,
  onDelete,
}: {
  name: string;
  meta: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700/50">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{meta}</p>
      </div>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AddDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

function AddButton({
  color,
  onClick,
  children,
}: {
  color: "blue" | "amber" | "purple";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    blue: "border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30",
    amber:
      "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30",
    purple:
      "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/30",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 w-full py-2 rounded-lg border text-sm font-medium transition-colors",
        styles[color],
      )}
    >
      <Plus className="w-3.5 h-3.5" /> {children}
    </button>
  );
}
