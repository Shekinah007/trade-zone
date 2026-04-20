"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Ticket,
  CheckCircle2,
  AlertCircle,
  Infinity,
  Clock,
  Shield,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function UserTokensPage() {
  const { data: session } = useSession();
  const [tokensInfo, setTokensInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Redeem form state
  const [tokenCode, setTokenCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [resultMsg, setResultMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchMyTokens = async () => {
    try {
      const res = await fetch('/api/tokens/my-tokens');
      if (res.ok) {
        const data = await res.json();
        setTokensInfo(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTokens();
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenCode.trim()) return;

    setRedeeming(true);
    setResultMsg(null);
    try {
      const res = await fetch('/api/tokens/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tokenCode })
      });
      const data = await res.json();
      
      if (data.success) {
        setResultMsg({ type: 'success', text: `Success! Recharged with a ${data.tokenType} token.` });
        setTokenCode('');
        fetchMyTokens(); // refresh UI
      } else {
        setResultMsg({ type: 'error', text: data.error || "Failed to redeem token." });
      }
    } catch (err) {
      setResultMsg({ type: 'error', text: "A network error occurred." });
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const { limitInfo, tokens } = tokensInfo || {};

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 rounded-2xl">
          <Ticket className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recharge Registration limit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Redeem tokens to increase your property registration capacity
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Current Limits Status Card */}
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
          <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/5 rotate-12" />
          
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-emerald-600" /> Current Capacity
          </h3>
          
          <div className="flex flex-col gap-4">
            {limitInfo?.unlimitedRegistrations ? (
               <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                 <div className="p-3 bg-emerald-500 text-white rounded-full">
                    <Infinity className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="font-bold text-lg text-emerald-700 dark:text-emerald-400">Unlimited Registration</p>
                    <p className="text-sm text-muted-foreground">You can register as many properties as you want.</p>
                 </div>
               </div>
            ) : (
               <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-emerald-500/20 p-4 rounded-xl shadow-sm">
                 <div className="text-center p-3">
                    <p className="text-3xl font-black text-emerald-600">{limitInfo?.registrationLimit || 1}</p>
                 </div>
                 <div>
                    <p className="font-bold">Total Allowed Registrations</p>
                    <p className="text-sm text-muted-foreground">If you exceed this, you must redeem another token.</p>
                 </div>
               </div>
            )}
            
            <div className="flex justify-between text-sm p-4 bg-muted/30 rounded-xl">
               <span className="text-muted-foreground">Total Tokens Redeemed:</span>
               <span className="font-semibold">{limitInfo?.totalTokensRedeemed || 0} tokens</span>
            </div>
          </div>
        </div>

        {/* Redeem Form Card */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-emerald-600" /> Redeem New Token
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your 10-character token code (Starting with FM) to unlock more slots.
          </p>

          {resultMsg && (
            <div className={cn("p-3 rounded-lg mb-4 text-sm flex items-start gap-2", resultMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
              {resultMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p>{resultMsg.text}</p>
            </div>
          )}

          <form onSubmit={handleRedeem} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Token Code</label>
              <input 
                type="text" 
                placeholder="FMXXXXXXXX" 
                value={tokenCode}
                onChange={e => setTokenCode(e.target.value)}
                maxLength={12}
                className="w-full text-lg font-mono tracking-widest uppercase p-3 bg-muted/30 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/40 placeholder:tracking-normal"
              />
            </div>
            <button 
              disabled={redeeming || !tokenCode.trim()} 
              type="submit" 
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 mt-2"
            >
              {redeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : "Redeem Token"}
            </button>
          </form>
        </div>

      </div>

      {/* History Area */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-muted-foreground" /> Redemption History
        </h3>
        
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
           {tokens && tokens.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-muted/30 text-xs uppercase text-muted-foreground font-medium border-b border-gray-200 dark:border-gray-800">
                   <tr>
                     <th className="px-6 py-4">Code</th>
                     <th className="px-6 py-4">Effect</th>
                     <th className="px-6 py-4">Date Redeemed</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                   {tokens.map((t: any) => (
                     <tr key={t._id} className="hover:bg-muted/10 transition-colors">
                       <td className="px-6 py-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                         {t.code}
                       </td>
                       <td className="px-6 py-4">
                         {t.tokenType === 'unlimited' ? (
                           <Badge className="bg-purple-500 hover:bg-purple-600">Unlimited Granted</Badge>
                         ) : (
                           <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 bg-emerald-500/10">+{t.value} Limit</Badge>
                         )}
                       </td>
                       <td className="px-6 py-4 text-muted-foreground">
                         {format(new Date(t.usedAt), "MMM d, yyyy 'at' h:mm a")}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="p-8 text-center flex flex-col items-center justify-center">
                <Ticket className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">You haven't redeemed any tokens yet.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
