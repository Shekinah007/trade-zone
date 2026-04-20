"use client";

import { useEffect, useState } from "react";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Loader2, 
  Search, 
  History, 
  User, 
  Clock, 
  ShieldAlert,
  Database,
  Ticket,
  PlusCircle,
  AlertCircle,
  FileDown,
  CheckCircle2,
  XCircle,
  Trash2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [tokenType, setTokenType] = useState('basic');
  const [batchId, setBatchId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // List states
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
        limit: '20',
        status: filterStatus,
        search: searchTerm
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
  }, [page, filterStatus]);

  useEffect(() => {
    const delayDebounceRequest = setTimeout(() => {
      if (page === 1) fetchTokens();
      else setPage(1); // will trigger above effect
    }, 500);
    return () => clearTimeout(delayDebounceRequest);
  }, [searchTerm]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      if (bulkMode) {
        const res = await fetch('/api/admin/tokens/bulk-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenType, quantity, batchName: batchId })
        });
        const data = await res.json();
        if (data.success) {
          // trigger download
          const blob = new Blob([data.csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.setAttribute('hidden', '');
          a.setAttribute('href', url);
          a.setAttribute('download', `tokens_${batchId || 'bulk'}_${new Date().getTime()}.csv`);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          alert(`Generated ${data.count} tokens and downloaded CSV.`);
        } else {
          alert(data.error);
        }
      } else {
        const res = await fetch('/api/admin/tokens/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenType, quantity, batchId })
        });
        const data = await res.json();
        if (data.success) {
          alert(`Successfully generated ${data.count} tokens.`);
        } else {
          alert(data.error);
        }
      }
      fetchStats();
      fetchTokens();
    } catch (err) {
      alert("Error generating tokens");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this token?")) return;
    try {
      const res = await fetch('/api/admin/tokens/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, reason: 'Admin revoked' })
      });
      if (res.ok) {
        fetchStats();
        fetchTokens();
      }
    } catch (err) {
      alert("Error revoking token");
    }
  };

  const statusBadgeColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'used': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'expired': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'revoked': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-red-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/15 rounded-2xl shadow-lg shadow-red-500/10">
              <Ticket className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Recharge Tokens</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Generate and manage property registration tokens
              </p>
            </div>
          </div>
        </div>

        {/* Action & Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 rounded-xl border border-red-500/10 bg-white dark:bg-gray-900 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Total Generated</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
             </div>
             <div className="p-4 rounded-xl border border-green-500/10 bg-white dark:bg-gray-900 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
             </div>
             <div className="p-4 rounded-xl border border-blue-500/10 bg-white dark:bg-gray-900 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Redeemed</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.used || 0}</p>
             </div>
             <div className="p-4 rounded-xl border border-yellow-500/10 bg-white dark:bg-gray-900 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Expired/Revoked</p>
                <p className="text-2xl font-bold text-yellow-600">{(stats?.expired || 0) + (stats?.revoked || 0)}</p>
             </div>
          </div>

          {/* Generator Form */}
          <div className="p-5 rounded-xl border border-red-500/20 bg-white dark:bg-gray-900 shadow-md">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-600" /> Generate Tokens
             </h3>
             <form onSubmit={handleGenerate} className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={!bulkMode} onChange={() => setBulkMode(false)} className="text-red-600 focus:ring-red-500" />
                    Standard
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={bulkMode} onChange={() => setBulkMode(true)} className="text-red-600 focus:ring-red-500" />
                    Bulk Export
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Type</label>
                    <select value={tokenType} onChange={e => setTokenType(e.target.value)} className="w-full text-sm p-2 bg-muted/50 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20">
                      <option value="basic">Basic (+10 Props)</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Quantity</label>
                    <input type="number" min="1" max={bulkMode ? 5000 : 100} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full text-sm p-2 bg-muted/50 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Batch ID (Optional)</label>
                  <input type="text" placeholder="e.g. PROMO2026" value={batchId} onChange={e => setBatchId(e.target.value)} className="w-full text-sm p-2 bg-muted/50 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20" />
                </div>

                <button disabled={generating} type="submit" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : bulkMode ? <FileDown className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {generating ? "Generating..." : bulkMode ? "Generate & Download CSV" : "Generate Now"}
                </button>
             </form>
          </div>
        </div>

        {/* Tokens List Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
             <div className="flex gap-2">
                <select value={filterStatus} onChange={e => {setFilterStatus(e.target.value); setPage(1);}} className="text-sm p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="used">Redeemed</option>
                  <option value="revoked">Revoked</option>
                </select>
             </div>
             <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search code or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-red-500" />
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/30 text-xs uppercase text-muted-foreground font-medium border-b border-gray-200 dark:border-gray-800">
                 <tr>
                   <th className="px-5 py-4">Code</th>
                   <th className="px-5 py-4">Type</th>
                   <th className="px-5 py-4">Status</th>
                   <th className="px-5 py-4">Generated / Used By</th>
                   <th className="px-5 py-4">Date / Expiry</th>
                   <th className="px-5 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                 {loading ? (
                   <tr>
                     <td colSpan={6} className="text-center py-10">
                       <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
                     </td>
                   </tr>
                 ) : tokens.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="text-center text-muted-foreground py-10">
                       No tokens found.
                     </td>
                   </tr>
                 ) : (
                   tokens.map(token => (
                     <tr key={token._id} className="hover:bg-muted/10 transition-colors">
                       <td className="px-5 py-3 font-mono font-medium">{token.code}</td>
                       <td className="px-5 py-3 capitalize">
                           <Badge variant="outline" className={token.tokenType === 'unlimited' ? 'border-purple-500/30 text-purple-600 bg-purple-500/10' : 'border-gray-500/30 text-gray-600 bg-gray-500/10'}>
                             {token.tokenType}
                           </Badge>
                       </td>
                       <td className="px-5 py-3">
                         <Badge variant="outline" className={statusBadgeColor(token.status)}>
                           {token.status}
                         </Badge>
                       </td>
                       <td className="px-5 py-3 text-xs">
                         <div className="flex flex-col gap-1">
                           <span className="text-muted-foreground">Gen: {token.generatedBy?.name || 'Admin'}</span>
                           {token.usedBy && <span className="text-blue-600 dark:text-blue-400">Used: {token.usedBy.email}</span>}
                         </div>
                       </td>
                       <td className="px-5 py-3 text-xs text-muted-foreground">
                         <div className="flex flex-col gap-1">
                           <span>{format(new Date(token.createdAt), "MMM d, yyyy")}</span>
                           <span className={new Date(token.expiresAt) < new Date() ? 'text-red-500' : ''}>Exp: {format(new Date(token.expiresAt), "MMM d, yy")}</span>
                         </div>
                       </td>
                       <td className="px-5 py-3 text-right">
                         {token.status === 'active' && (
                           <button onClick={() => handleRevoke(token._id)} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Revoke Token">
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

          {!loading && tokens.length > 0 && (
             <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 text-sm border-b-0 space-x-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-950 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-muted-foreground font-medium">Page {page}</span>
                <button 
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-950"
                >
                  Next
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
