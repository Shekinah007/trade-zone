"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Shield, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function ClaimTokenPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && token) {
      handleClaim();
    }
  }, [status, token]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transfers/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to claim transfer");
      }

      toast.success(data.message || "Property claimed successfully!");
      router.push("/dashboard?tab=transfers");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Claim Your Property</CardTitle>
          <CardDescription>
            You've been sent a property transfer on FindMaster's Global
            Registry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg text-sm text-center">
            To accept this transfer and secure your legal ownership, you need a
            FindMaster account.
          </div>

          {status === "authenticated" ? (
            <Button className="w-full" onClick={handleClaim} disabled={loading}>
              {loading ? "Claiming..." : "Claim Property Now"}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href={`/auth/signup?callbackUrl=/claim/${token}`}>
                  Create Account to Claim{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/auth/signin?callbackUrl=/claim/${token}`}>
                  I already have an account
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
