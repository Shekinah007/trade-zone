"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Shield, Loader2 } from "lucide-react";

function ClaimTransferContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && token) {
      // Redirect to login or signup if not authenticated, keeping the token context
      const loginUrl = `/auth/signin?callbackUrl=${encodeURIComponent(`/registry/transfer/claim?token=${token}`)}`;
      router.push(loginUrl);
    }
  }, [status, router, token]);

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/registry/transfer/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to process transfer request.");
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {success ? "Transfer Complete!" : "Claim Property Ownership"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {!token ? (
            <div className="text-center text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              <p>Invalid or missing transfer token.</p>
            </div>
          ) : success ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-800">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p className="font-semibold text-lg">Property Secured</p>
                <p className="text-sm mt-2">The property has been successfully transferred to your Global Registry dashboard.</p>
              </div>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-black hover:bg-gray-800 text-white rounded-full h-12 text-lg"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <p className="text-gray-600">
                You are about to accept legal ownership of a property on FindMaster. By clicking accept, the asset will be permanently recorded in your name in the Global Registry.
              </p>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start text-left">
                  <AlertCircle className="w-4 h-4 mt-0.5 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button
                onClick={handleAccept}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full h-12 text-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? "Processing..." : "Accept Ownership"}
              </Button>
              
              <p className="text-xs text-gray-400 mt-4">
                Logged in as <span className="font-medium text-gray-700">{session?.user?.email}</span>. Not you? <a href="/api/auth/signout" className="text-red-500 hover:underline">Sign out</a>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaimTransferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    }>
      <ClaimTransferContent />
    </Suspense>
  );
}
