"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  User,
  Clock,
  ShieldAlert,
  Database,
  Ticket,
  PlusCircle,
  FileDown,
  CheckCircle2,
  Trash2,
  Filter,
  Layers,
  Calendar,
  TrendingUp,
  Zap,
  RefreshCw,
  Copy,
  Download,
  Printer,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import TokenPrintPreview from "@/components/admin/TokenPrintPreview";
import { toast } from "sonner";

interface RechargeToken {
  _id: string;
  code: string;
  tokenType: string;
  value: number;
  status: string;
  generatedBy?: { name: string; email: string };
  usedBy?: { name: string; email: string };
  usedAt?: string;
  expiresAt: string;
  batchId?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminTokensPage() {
  const [stats, setStats] = useState<any>(null);
  const [tokens, setTokens] = useState<RechargeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [tokenType, setTokenType] = useState("basic");
  const [batchId, setBatchId] = useState("");
  const [creditValue, setCreditValue] = useState<number | "">(100);
  const [generating, setGenerating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // List states
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage] = useState(15);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/tokens/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.summary);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        status: filterStatus,
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/tokens/list?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tokens");
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTokens();
    setSelectedTokens(new Set());
  }, [page, filterStatus]);

  useEffect(() => {
    const delayDebounceRequest = setTimeout(() => {
      if (page === 1) fetchTokens();
      else setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceRequest);
  }, [searchTerm]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      if (bulkMode) {
        const res = await fetch("/api/admin/tokens/bulk-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenType,
            quantity,
            batchName: batchId,
            creditValue: creditValue || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const blob = new Blob([data.csvData], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.setAttribute("hidden", "");
          a.setAttribute("href", url);
          a.setAttribute(
            "download",
            `tokens_${batchId || "bulk"}_${new Date().getTime()}.csv`,
          );
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          alert(`Generated ${data.count} tokens and downloaded CSV.`);
        } else {
          alert(data.error);
        }
      } else {
        const res = await fetch("/api/admin/tokens/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenType,
            quantity,
            batchId,
            creditValue: creditValue || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Successfully generated ${data.count} tokens.`);
        } else {
          toast.error(data.error);
        }
      }
      fetchStats();
      fetchTokens();
    } catch (err) {
      toast.error("Error generating tokens");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this token?")) return;
    try {
      const res = await fetch("/api/admin/tokens/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, reason: "Admin revoked" }),
      });
      if (res.ok) {
        fetchStats();
        fetchTokens();
      }
    } catch (err) {
      alert("Error revoking token");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Token code copied to clipboard!");
  };

  const statusConfig = {
    active: { color: "emerald", icon: CheckCircle2, label: "Active" },
    used: { color: "blue", icon: User, label: "Used" },
    expired: { color: "amber", icon: Clock, label: "Expired" },
    revoked: { color: "rose", icon: ShieldAlert, label: "Revoked" },
  };

  const getStatusBadge = (status: string) => {
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    return (
      <Badge
        className={`bg-${config.color}-500/10 text-${config.color}-600 border-${config.color}-500/20 font-normal gap-1`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="group relative overflow-hidden rounded-xl bg-white md:bg-gray-50  dark:bg-gray-900/50  dark:border-gray-800 p-3 hover:shadow-lg transition-all duration-200">
      <div
        className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color.split(" ")[1]}/10`}>
          <Icon className={`w-5 h-5 text-${color.split(" ")[1]}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen print:hidden">
      <div className="w-full ">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                  Token Management
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Create, track, and manage recharge tokens
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                fetchStats();
                fetchTokens();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid - 2 rows on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Total Generated"
            value={stats?.total || 0}
            icon={Layers}
            color="from-gray-500 to-gray-600 gray"
          />
          <StatCard
            title="Active Tokens"
            value={stats?.active || 0}
            icon={CheckCircle2}
            color="from-emerald-500 to-emerald-600 emerald"
            trend={`${Math.round(((stats?.active || 0) / (stats?.total || 1)) * 100)}% of total`}
          />
          <StatCard
            title="Redeemed"
            value={stats?.used || 0}
            icon={TrendingUp}
            color="from-blue-500 to-blue-600 blue"
          />
          <StatCard
            title="Inactive"
            value={(stats?.expired || 0) + (stats?.revoked || 0)}
            icon={ShieldAlert}
            color="from-amber-500 to-amber-600 amber"
          />
        </div>

        {/* Two Column Layout - Generator & Filters */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8 ">
          {/* Generator Card */}
          <div className="lg:col-span-1 ">
            <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-20 ">
              <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-red-50/50 to-transparent dark:from-red-950/10">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold">Generate New Tokens</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Create single or bulk tokens
                </p>
              </div>

              <form onSubmit={handleGenerate} className="p-5 space-y-5">
                <div className="flex gap-4 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBulkMode(false)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!bulkMode ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-muted-foreground"}`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode(true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${bulkMode ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-muted-foreground"}`}
                  >
                    Bulk Export
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                      Token Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTokenType("basic")}
                        className={`p-3 text-left rounded-lg border-2 transition-all ${
                          tokenType === "basic"
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-sm">Basic</div>
                        {/* <div className="text-xs text-muted-foreground mt-1">
                          +5 Properties
                        </div> */}
                      </button>
                      {/* <button
                        type="button"
                        onClick={() => setTokenType("unlimited")}
                        className={`p-3 text-left rounded-lg border-2 transition-all ${
                          tokenType === "unlimited"
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-sm">Unlimited</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          No restrictions
                        </div>
                      </button> */}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                      Credit Value
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 10"
                      name="creditValue"
                      value={creditValue}
                      onChange={(e) =>
                        setCreditValue(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full text-sm p-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Number of credits this token adds to the user's balance.
                      (Basic default is 10).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={bulkMode ? 5000 : 100}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full text-sm p-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {bulkMode ? "5,000" : "100"} tokens
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                      Batch ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., PROMO_2026, BULK_001"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full text-sm p-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  disabled={generating}
                  type="submit"
                  className="w-full py-2.5 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium text-sm transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-500/20"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : bulkMode ? (
                    <>
                      <Download className="w-4 h-4" />
                      Generate & Download CSV
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Tokens
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Tokens List Section */}
          <div className="lg:col-span-2 sticky top-0">
            <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Search and Filter Bar */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by token code or user email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setPage(1);
                        }}
                        className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="used">Redeemed</option>
                        <option value="expired">Expired</option>
                        <option value="revoked">Revoked</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {selectedTokens.size > 0 && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/10 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">
                    {selectedTokens.size} token(s) selected
                  </span>
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print Selected
                  </button>
                </div>
              )}

              <div className="block lg:hidden">
                {/* Mobile Card View */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading tokens...
                      </p>
                    </div>
                  ) : tokens.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No tokens found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    tokens.map((token) => (
                      <div
                        key={token._id}
                        className="p-4 space-y-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        {/* Header Row with Token Code and Actions */}
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <input
                              type="checkbox"
                              checked={selectedTokens.has(token._id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedTokens);
                                if (e.target.checked) newSet.add(token._id);
                                else newSet.delete(token._id);
                                setSelectedTokens(newSet);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                                {token.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(token.code)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </div>
                            {token.batchId && (
                              <span className="text-xs text-muted-foreground mt-1 inline-block">
                                Batch: {token.batchId}
                              </span>
                            )}
                          </div>
                          {token.status === "active" && (
                            <button
                              onClick={() => handleRevoke(token._id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                              title="Revoke Token"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Type and Status Row */}
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={
                              token.tokenType === "unlimited"
                                ? "border-purple-500/30 text-purple-600 bg-purple-500/10"
                                : "border-gray-500/30"
                            }
                          >
                            {token.tokenType === "unlimited"
                              ? "♾️ Unlimited"
                              : `+${token.value} Credits`}
                          </Badge>
                          <div>{getStatusBadge(token.status)}</div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-muted-foreground">
                                Generated by:
                              </span>{" "}
                              <span className="font-medium">
                                {token.generatedBy?.name || "System"}
                              </span>
                              {token.generatedBy?.email && (
                                <span className="text-xs text-muted-foreground block sm:inline sm:ml-1">
                                  ({token.generatedBy.email})
                                </span>
                              )}
                            </div>
                          </div>
                          {token.usedBy && (
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-muted-foreground">
                                  Used by:
                                </span>{" "}
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {token.usedBy.name || token.usedBy.email}
                                </span>
                                {token.usedBy.email && token.usedBy.name && (
                                  <span className="text-xs text-muted-foreground block sm:inline sm:ml-1">
                                    ({token.usedBy.email})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Timeline */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>Created</span>
                            </div>
                            <p className="text-sm font-medium">
                              {format(new Date(token.createdAt), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(token.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Expires</span>
                            </div>
                            <p
                              className={`text-sm font-medium ${new Date(token.expiresAt) < new Date() ? "text-red-500" : ""}`}
                            >
                              {format(new Date(token.expiresAt), "MMM d, yyyy")}
                            </p>
                            <p
                              className={`text-xs ${new Date(token.expiresAt) < new Date() ? "text-red-500" : "text-muted-foreground"}`}
                            >
                              {formatDistanceToNow(new Date(token.expiresAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Used At if applicable */}
                        {token.usedAt && (
                          <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Redeemed on</span>
                            </div>
                            <p className="text-sm mt-0.5">
                              {format(
                                new Date(token.usedAt),
                                "MMM d, yyyy 'at' h:mm a",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="hidden lg:block overflow-x-auto max-h-[500px]">
                {/* Desktop Table View */}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 w-10 text-left">
                        <input
                          type="checkbox"
                          checked={
                            tokens.length > 0 &&
                            selectedTokens.size === tokens.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTokens(
                                new Set(tokens.map((t) => t._id)),
                              );
                            } else {
                              setSelectedTokens(new Set());
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Token Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        User Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Timeline
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">
                            Loading tokens...
                          </p>
                        </td>
                      </tr>
                    ) : tokens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            No tokens found
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search or filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      tokens.map((token) => (
                        <tr
                          key={token._id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedTokens.has(token._id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedTokens);
                                if (e.target.checked) newSet.add(token._id);
                                else newSet.delete(token._id);
                                setSelectedTokens(newSet);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all max-w-[200px]">
                                {token.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(token.code)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                              >
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                            {token.batchId && (
                              <span className="text-xs text-muted-foreground mt-1 block">
                                Batch: {token.batchId}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                token.tokenType === "unlimited"
                                  ? "border-purple-500/30 text-purple-600 bg-purple-500/10"
                                  : "border-gray-500/30"
                              }
                            >
                              {token.tokenType === "unlimited"
                                ? "♾️ Unlimited"
                                : `+${token.value} Credits`}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(token.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="text-xs">
                                <span className="text-muted-foreground">
                                  Gen:
                                </span>{" "}
                                <span className="font-medium">
                                  {token.generatedBy?.name || "System"}
                                </span>
                                {token.generatedBy?.email && (
                                  <span className="text-muted-foreground text-xs block sm:inline sm:ml-1">
                                    ({token.generatedBy.email})
                                  </span>
                                )}
                              </div>
                              {token.usedBy && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">
                                    Used:
                                  </span>{" "}
                                  <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {token.usedBy.name || token.usedBy.email}
                                  </span>
                                  {token.usedBy.email && token.usedBy.name && (
                                    <span className="text-muted-foreground text-xs block sm:inline sm:ml-1">
                                      ({token.usedBy.email})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span>
                                  {format(
                                    new Date(token.createdAt),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span
                                  className={
                                    new Date(token.expiresAt) < new Date()
                                      ? "text-red-500"
                                      : ""
                                  }
                                >
                                  Exp:{" "}
                                  {format(
                                    new Date(token.expiresAt),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>
                              {token.usedAt && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs">
                                    Used:{" "}
                                    {format(
                                      new Date(token.usedAt),
                                      "MMM d, yyyy",
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {token.status === "active" && (
                              <button
                                onClick={() => handleRevoke(token._id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                title="Revoke Token"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && tokens.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{tokens.length}</span>{" "}
                    tokens
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium">
                      Page {page}
                    </span>
                    <button
                      disabled={tokens.length < itemsPerPage}
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showPrintModal && (
        <TokenPrintPreview
          tokens={tokens.filter((t) => selectedTokens.has(t._id))}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
