"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Clock, Shield } from "lucide-react";
// import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TransfersTab({
  incoming,
  outgoing,
}: {
  incoming: any[];
  outgoing: any[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (
    id: string,
    action: "accept" | "decline" | "cancel",
  ) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/transfers/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `Failed to ${action}`);

      toast.success(`Transfer ${action}ed successfully`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-blue-600" />
            Incoming Transfers ({incoming.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {incoming.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm flex flex-col items-center">
              <Shield className="h-8 w-8 mb-2 opacity-20" />
              <p>No pending incoming transfers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incoming.map((t) => (
                <div
                  key={t._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded overflow-hidden shrink-0">
                      {t.propertyId?.images?.[0] ? (
                        <img
                          src={t.propertyId.images[0]}
                          alt="Property"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Shield className="h-full w-full p-2 opacity-20" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {t.propertyId?.brand} {t.propertyId?.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        From: {t.fromUser?.name || t.fromUser?.email}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" /> Expires:{" "}
                        {new Date(t.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleAction(t._id, "decline")}
                      disabled={loadingId === t._id}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleAction(t._id, "accept")}
                      disabled={loadingId === t._id}
                    >
                      Accept Property
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-orange-50/50 dark:bg-orange-900/10 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600" />
            Outgoing Transfers ({outgoing.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {outgoing.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm flex flex-col items-center">
              <Shield className="h-8 w-8 mb-2 opacity-20" />
              <p>No pending outgoing transfers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outgoing.map((t) => (
                <div
                  key={t._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded overflow-hidden shrink-0">
                      {t.propertyId?.images?.[0] ? (
                        <img
                          src={t.propertyId.images[0]}
                          alt="Property"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Shield className="h-full w-full p-2 opacity-20" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {t.propertyId?.brand} {t.propertyId?.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To:{" "}
                        {t.toUser
                          ? t.toUser.name || t.toUser.email
                          : t.receiverEmail}
                        {!t.toUser && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[9px]"
                          >
                            Unregistered
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(t._id, "cancel")}
                      disabled={loadingId === t._id}
                    >
                      Cancel Transfer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
