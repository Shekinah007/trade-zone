"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Settings, Zap, RefreshCw, Plus, Trash2, Tag, ArrowUpCircle } from "lucide-react";

export default function AdminMonetizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [registrationCreditCost, setRegistrationCreditCost] = useState(10);
  const [unlimitedRegistrationPriceNGN, setUnlimitedRegistrationPriceNGN] = useState(10000);
  const [freeListingQuota, setFreeListingQuota] = useState(3);
  const [globalListingExpiryDays, setGlobalListingExpiryDays] = useState(60);

  const [listingPacks, setListingPacks] = useState<any[]>([]);
  const [boostTiers, setBoostTiers] = useState<any[]>([]);

  // New Pack State
  const [newPack, setNewPack] = useState({ name: "", slotCount: 0, priceNGN: 0, creditCost: 0 });
  const [newTier, setNewTier] = useState({ name: "", durationInDays: 0, priceNGN: 0, creditCost: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, packsRes, tiersRes] = await Promise.all([
        fetch(`/api/admin/settings`),
        fetch(`/api/admin/listing-packs`),
        fetch(`/api/admin/boost-tiers`)
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          setRegistrationCreditCost(data.settings.registrationCreditCost || 10);
          setUnlimitedRegistrationPriceNGN(data.settings.unlimitedRegistrationPriceNGN || 10000);
          setFreeListingQuota(data.settings.freeListingQuota || 3);
          setGlobalListingExpiryDays(data.settings.globalListingExpiryDays || 60);
        }
      }
      if (packsRes.ok) setListingPacks(await packsRes.json());
      if (tiersRes.ok) setBoostTiers(await tiersRes.json());
    } catch (err) {
      console.error(err);
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
          unlimitedRegistrationPriceNGN,
          freeListingQuota,
          globalListingExpiryDays,
        }),
      });
      const data = await res.json();
      if (data.success) alert("Settings saved successfully.");
      else alert(data.error);
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPack = async () => {
    try {
      const res = await fetch("/api/admin/listing-packs", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPack)
      });
      if (res.ok) {
        fetchData();
        setNewPack({ name: "", slotCount: 0, priceNGN: 0, creditCost: 0 });
      }
    } catch (e) {}
  };

  const handleDeletePack = async (id: string) => {
    if (!confirm("Delete this pack?")) return;
    try {
      await fetch(`/api/admin/listing-packs?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {}
  };

  const handleAddTier = async () => {
    try {
      const res = await fetch("/api/admin/boost-tiers", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTier)
      });
      if (res.ok) {
        fetchData();
        setNewTier({ name: "", durationInDays: 0, priceNGN: 0, creditCost: 0 });
      }
    } catch (e) {}
  };

  const handleDeleteTier = async (id: string) => {
    if (!confirm("Delete this tier?")) return;
    try {
      await fetch(`/api/admin/boost-tiers?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Monetization Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Configure credit costs, listing quotas, and boosts</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Global Settings */}
            <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold">Global Limits & Settings</h3>
                </div>
              </div>
              <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Registration Credit Cost</label>
                    <input type="number" value={registrationCreditCost} onChange={(e) => setRegistrationCreditCost(Number(e.target.value))} className="w-full text-sm p-2 bg-gray-50 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unlimited Reg Price (NGN)</label>
                    <input type="number" value={unlimitedRegistrationPriceNGN} onChange={(e) => setUnlimitedRegistrationPriceNGN(Number(e.target.value))} className="w-full text-sm p-2 bg-gray-50 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Free Listing Quota</label>
                    <input type="number" value={freeListingQuota} onChange={(e) => setFreeListingQuota(Number(e.target.value))} className="w-full text-sm p-2 bg-gray-50 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Listing Expiry (Days)</label>
                    <input type="number" value={globalListingExpiryDays} onChange={(e) => setGlobalListingExpiryDays(Number(e.target.value))} className="w-full text-sm p-2 bg-gray-50 border rounded-lg" />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <button disabled={saving} type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg flex justify-center items-center gap-2 shadow-lg">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
                  </button>
                </div>
              </form>
            </div>

            {/* Listing Packs */}
            <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Listing Packs</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {listingPacks.map(pack => (
                  <div key={pack._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{pack.name}</p>
                      <p className="text-xs text-muted-foreground">{pack.slotCount} slots • ₦{pack.priceNGN} • {pack.creditCost} Credits</p>
                    </div>
                    <button onClick={() => handleDeletePack(pack._id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                
                <div className="grid grid-cols-2 gap-3 mt-4 border-t pt-4">
                  <input placeholder="Name" className="p-2 border rounded text-sm" value={newPack.name} onChange={e => setNewPack({...newPack, name: e.target.value})} />
                  <input placeholder="Slots" type="number" className="p-2 border rounded text-sm" value={newPack.slotCount || ''} onChange={e => setNewPack({...newPack, slotCount: Number(e.target.value)})} />
                  <input placeholder="Price (NGN)" type="number" className="p-2 border rounded text-sm" value={newPack.priceNGN || ''} onChange={e => setNewPack({...newPack, priceNGN: Number(e.target.value)})} />
                  <input placeholder="Credit Cost" type="number" className="p-2 border rounded text-sm" value={newPack.creditCost || ''} onChange={e => setNewPack({...newPack, creditCost: Number(e.target.value)})} />
                  <button onClick={handleAddPack} className="col-span-2 py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4"/> Add Pack</button>
                </div>
              </div>
            </div>

            {/* Boost Tiers */}
            <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden lg:col-span-2">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-amber-50/50 to-transparent">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold">Boost Tiers</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boostTiers.map(tier => (
                  <div key={tier._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">{tier.durationInDays} days • ₦{tier.priceNGN} • {tier.creditCost} Credits</p>
                    </div>
                    <button onClick={() => handleDeleteTier(tier._id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 border-t pt-4 max-w-3xl">
                  <input placeholder="Name" className="p-2 border rounded text-sm" value={newTier.name} onChange={e => setNewTier({...newTier, name: e.target.value})} />
                  <input placeholder="Duration (Days)" type="number" className="p-2 border rounded text-sm" value={newTier.durationInDays || ''} onChange={e => setNewTier({...newTier, durationInDays: Number(e.target.value)})} />
                  <input placeholder="Price (NGN)" type="number" className="p-2 border rounded text-sm" value={newTier.priceNGN || ''} onChange={e => setNewTier({...newTier, priceNGN: Number(e.target.value)})} />
                  <input placeholder="Credit Cost" type="number" className="p-2 border rounded text-sm" value={newTier.creditCost || ''} onChange={e => setNewTier({...newTier, creditCost: Number(e.target.value)})} />
                  <button onClick={handleAddTier} className="col-span-2 md:col-span-4 py-2 bg-amber-600 text-white rounded flex items-center justify-center gap-2 text-sm"><Plus className="w-4 h-4"/> Add Boost Tier</button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
