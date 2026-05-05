"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Settings,
  Zap,
  CreditCard,
  RefreshCw,
} from "lucide-react";

export default function AdminMonetizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registrationCreditCost, setRegistrationCreditCost] = useState(10);
  const [unlimitedRegistrationPriceNGN, setUnlimitedRegistrationPriceNGN] = useState(10000);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setRegistrationCreditCost(data.settings.registrationCreditCost || 10);
          setUnlimitedRegistrationPriceNGN(data.settings.unlimitedRegistrationPriceNGN || 10000);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCreditCost,
          unlimitedRegistrationPriceNGN,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Settings saved successfully.");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
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
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                  Monetization Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure credit costs and purchase prices
                </p>
              </div>
            </div>
            <button
              onClick={fetchSettings}
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
            <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold">Credit & Quota Settings</h3>
                </div>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Registration Quota Credit Cost
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    How many credits a user must spend to purchase +1 registration quota slot.
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={registrationCreditCost}
                      onChange={(e) => setRegistrationCreditCost(Number(e.target.value))}
                      className="w-full text-sm p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all pl-10"
                    />
                    <Zap className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unlimited Registration Price (NGN)
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Cash price for users to buy unlimited registrations via Paystack.
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      min="1000"
                      value={unlimitedRegistrationPriceNGN}
                      onChange={(e) => setUnlimitedRegistrationPriceNGN(Number(e.target.value))}
                      className="w-full text-sm p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all pl-10"
                    />
                    <span className="absolute left-3 top-3.5 font-semibold text-gray-500 text-sm">₦</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    disabled={saving}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium text-sm transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
