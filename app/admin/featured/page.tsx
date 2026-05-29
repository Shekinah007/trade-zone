"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminFeaturedPage() {
  const [loading, setLoading] = useState(true);
  const [activeFeatured, setActiveFeatured] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);

  const [unfeatureModalOpen, setUnfeatureModalOpen] = useState(false);
  const [unfeatureReason, setUnfeatureReason] = useState("");
  const [selectedItemForUnfeature, setSelectedItemForUnfeature] = useState<string | null>(null);
  const [unfeaturing, setUnfeaturing] = useState(false);

  const handleUnfeature = async () => {
    if (!selectedItemForUnfeature || !unfeatureReason.trim()) return;
    setUnfeaturing(true);
    try {
      const res = await fetch("/api/admin/featured-status/unfeature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItemForUnfeature, reason: unfeatureReason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to unfeature");
      toast.success("Item unfeatured successfully");
      setUnfeatureModalOpen(false);
      setUnfeatureReason("");
      setSelectedItemForUnfeature(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUnfeaturing(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/featured-status");
      if (res.ok) {
        const data = await res.json();
        setActiveFeatured(data.activeFeatured || []);
        setWaitlist(data.waitlist || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Featured Listings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage active featured slots and waitlist queue</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Featured */}
        <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Active Featured Slots</h3>
              </div>
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {activeFeatured.length} Active
              </span>
            </div>
          </div>
          <div className="p-0">
            {activeFeatured.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>No active featured listings.</p>
              </div>
            ) : (
              <div className="divide-y border-gray-200 dark:border-gray-800">
                {activeFeatured.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Seller: {item.seller?.name || item.seller?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Expires: {new Date(item.featuredExpiry).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started: {new Date(item.featuredAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2 text-xs h-7"
                        onClick={() => {
                          setSelectedItemForUnfeature(item.id);
                          setUnfeatureModalOpen(true);
                        }}
                      >
                        Unfeature
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Waitlist Queue */}
        <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-amber-50/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold">Waitlist Queue</h3>
              </div>
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {waitlist.length} Waiting
              </span>
            </div>
          </div>
          <div className="p-0">
            {waitlist.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>Waitlist is currently empty.</p>
              </div>
            ) : (
              <div className="divide-y border-gray-200 dark:border-gray-800">
                {waitlist.map((entry) => (
                  <div key={entry._id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div>
                      <p className="font-medium">{entry.item?.listing?.title}</p>
                      <p className="text-sm text-muted-foreground">User: {entry.user?.name || entry.user?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tier: {entry.tier?.name} ({entry.tier?.durationInDays} days)</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        entry.status === 'notified' ? 'bg-blue-100 text-blue-700' :
                        entry.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                        entry.status === 'expired' ? 'bg-red-100 text-red-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {entry.status.toUpperCase()}
                      </span>
                      {entry.notifiedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Notified: {new Date(entry.notifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {unfeatureModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Unfeature Item</h3>
            <p className="text-sm text-muted-foreground">Please provide a reason for unfeaturing this item. This will be sent to the user.</p>
            <textarea
              className="w-full p-3 border rounded-lg bg-transparent text-sm min-h-[100px]"
              placeholder="Reason for removal..."
              value={unfeatureReason}
              onChange={(e) => setUnfeatureReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setUnfeatureModalOpen(false)} disabled={unfeaturing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleUnfeature} disabled={unfeaturing || !unfeatureReason.trim()}>
                {unfeaturing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unfeature"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
