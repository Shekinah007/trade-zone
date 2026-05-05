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
  Zap,
  Sparkles,
  Coins,
  History,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function UserTokensPage() {
  const { data: session } = useSession();
  const [tokensInfo, setTokensInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redeem form state
  const [tokenCode, setTokenCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [resultMsg, setResultMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchMyTokens = async () => {
    try {
      const res = await fetch("/api/tokens/my-tokens");
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
      const res = await fetch("/api/tokens/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tokenCode }),
      });
      const data = await res.json();

      if (data.success) {
        setResultMsg({
          type: "success",
          text: `Success! Recharged with a ${data.tokenType} token.`,
        });
        setTokenCode("");
        toast.success("Recharge successful");
        fetchMyTokens();
      } else {
        setResultMsg({
          type: "error",
          text: data.error || "Failed to redeem token.",
        });
      }
    } catch (err) {
      setResultMsg({ type: "error", text: "A network error occurred." });
    } finally {
      setRedeeming(false);
    }
  };

  // Loading skeleton for better UX
  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-red-500/20 rounded-2xl animate-pulse">
            <Ticket className="h-7 w-7 text-emerald-600/50" />
          </div>
          <div>
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded-lg mt-2 animate-pulse" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted/20 rounded-2xl animate-pulse" />
          <div className="h-64 bg-muted/20 rounded-2xl animate-pulse" />
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="h-6 w-32 bg-muted rounded-lg mb-6 animate-pulse" />
          <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { limitInfo, tokens } = tokensInfo || {};

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header with gradient text */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-red-500/20 rounded-2xl shadow-sm">
            <Ticket className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-red-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-red-400 bg-clip-text text-transparent">
              Recharge Credits
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Redeem tokens to add credits and unlock unlimited registration
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <Sparkles className="h-5 w-5 text-red-400 animate-pulse" />
        </div>
      </div>

      {/* Main Grid - Balance & Redeem */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Balance Card - Green/red Gradient */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-red-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50/30 to-red-50/30 dark:from-gray-900 dark:via-emerald-950/20 dark:to-red-950/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4">
              <Shield className="h-16 w-16 text-emerald-500/10 dark:text-emerald-400/5" />
            </div>

            <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-red-500 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-700 to-red-700 dark:from-emerald-300 dark:to-red-300 bg-clip-text text-transparent">
                Current Balance
              </span>
            </h3>

            <div className="flex flex-col gap-5">
              {limitInfo?.unlimitedRegistrations ? (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-red-500/10 border border-emerald-500/20 p-4">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-red-500/20 rounded-full blur-2xl" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-red-500 rounded-full shadow-lg">
                      <Infinity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-red-600 dark:from-emerald-400 dark:to-red-400 bg-clip-text text-transparent">
                        Unlimited Registration
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You can register as many properties as you want with no
                        limits.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-red-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-red-500 rounded-xl shadow-md">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        Available Credits
                      </p>
                      <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-red-600 dark:from-emerald-400 dark:to-red-400 bg-clip-text text-transparent">
                        {limitInfo?.creditBalance || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Active
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">
                    Total Tokens Redeemed
                  </span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-red-600 bg-clip-text text-transparent">
                  {limitInfo?.totalTokensRedeemed || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Form Card - red/Green Accents */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-indigo-400/5 to-emerald-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative p-6 rounded-2xl border border-red-500/20 bg-gradient-to-br from-white via-red-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-red-950/20 dark:to-emerald-950/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4">
              <CreditCard className="h-16 w-16 text-red-500/10 dark:text-red-400/5" />
            </div>

            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-red-500 to-emerald-500 rounded-lg">
                <Ticket className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-red-700 to-emerald-700 dark:from-red-300 dark:to-emerald-300 bg-clip-text text-transparent">
                Redeem New Token
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Enter your 10-character token code (Starting with{" "}
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                FM
              </span>
              ) to unlock more slots and increase your credit balance.
            </p>

            {resultMsg && (
              <div
                className={cn(
                  "p-3 rounded-xl mb-5 text-sm flex items-start gap-2 backdrop-blur-sm border animate-in fade-in slide-in-from-top-1 duration-300",
                  resultMsg.type === "success"
                    ? "bg-gradient-to-r from-emerald-50/90 to-green-50/90 border-emerald-200 dark:from-emerald-950/50 dark:to-green-950/50 dark:border-emerald-800"
                    : "bg-gradient-to-r from-red-50/90 to-rose-50/90 border-red-200 dark:from-red-950/50 dark:to-rose-950/50 dark:border-red-800",
                )}
              >
                {resultMsg.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <p className="font-medium">{resultMsg.text}</p>
              </div>
            )}

            <form onSubmit={handleRedeem} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">
                  Token Code
                </label>
                <input
                  type="text"
                  placeholder="FMXXXXXXXXXX"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="w-full text-lg font-mono tracking-wider uppercase p-3 bg-white/70 dark:bg-gray-900/70 border-2 border-red-200/50 dark:border-red-800/30 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 placeholder:text-muted-foreground/40 placeholder:tracking-normal"
                />
                <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                  Code is case-sensitive, will be automatically uppercased.
                </p>
              </div>
              <button
                disabled={redeeming || !tokenCode.trim()}
                type="submit"
                className="relative w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-red-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex justify-center items-center gap-2 group overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400/0 via-white/20 to-red-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {redeeming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    <span>Redeem Token</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* History Area */}
      <div className="mt-10 pt-6 border-t-2 border-gradient-to-r from-emerald-200/50 via-red-200/50 to-emerald-200/50 dark:from-emerald-800/30 dark:via-red-800/30" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-red-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-700 to-red-700 dark:from-emerald-300 dark:to-red-300 bg-clip-text text-transparent">
              Recharge History
            </span>
          </h3>
          <Badge
            variant="outline"
            className="bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          >
            <History className="h-3 w-3 mr-1" />
            {tokens?.length || 0} transactions
          </Badge>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden shadow-xl">
          {tokens && tokens.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-emerald-50/80 to-red-50/80 dark:from-emerald-950/40 dark:to-red-950/40 text-xs uppercase font-semibold tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Token Code</th>
                    <th className="px-6 py-4">Effect</th>
                    <th className="px-6 py-4 rounded-tr-2xl">Date Redeemed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {tokens.map((t: any, idx: number) => (
                    <tr
                      key={t._id}
                      className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-red-50/30 dark:hover:from-emerald-950/20 dark:hover:to-red-950/20 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md text-xs tracking-wider">
                          {t.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {t.tokenType === "unlimited" ? (
                          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 border-none shadow-sm">
                            <Infinity className="w-3 h-3 mr-1" />
                            Unlimited Granted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/50"
                          >
                            <Coins className="w-3 h-3 mr-1" />+{t.value} Credits
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {format(new Date(t.usedAt), "MMM d, yyyy 'at' h:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-red-500/10 rounded-full mb-4">
                <Ticket className="w-10 h-10 text-emerald-500/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                No tokens redeemed yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Use the form above to recharge your account with credits.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
