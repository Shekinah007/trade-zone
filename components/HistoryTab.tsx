import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CreditCard,
  ShoppingCart,
  Shield,
  ArrowLeftRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HistoryTab({
  purchases,
  transfers,
  userId,
}: {
  purchases: any[];
  transfers: any[];
  userId?: string;
}) {
  if (!userId) return null;
  return (
    <div className="space-y-6">
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="bg-muted/50 p-0.5 h-8 mb-4">
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs h-7 px-3"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Purchases
          </TabsTrigger>
          <TabsTrigger
            value="transfers"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs h-7 px-3"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
            Transfer History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card>
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Purchase History ({purchases.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {purchases.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <ShoppingCart className="h-8 w-8 mb-2 opacity-20 mx-auto" />
                  <p>No purchase history found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map((p) => (
                    <div
                      key={p._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card gap-4"
                    >
                      <div>
                        <p className="font-semibold text-sm capitalize">
                          {p.type} Purchase
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Method: {p.paymentMethod}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />{" "}
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-sm">
                          {p.paymentMethod === "naira" ||
                            p.paymentMethod === "paystack"
                            ? "₦"
                            : ""}
                          {p.amountPaid}
                          {p.paymentMethod === "credit" ||
                            p.paymentMethod === "credits"
                            ? " Credits"
                            : ""}
                        </span>
                        <Badge
                          variant={
                            p.status === "success"
                              ? "default"
                              : p.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Asset Transfer History ({transfers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {transfers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Shield className="h-8 w-8 mb-2 opacity-20 mx-auto" />
                  <p>No transfer history found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transfers.map((t) => {
                    const isIncoming =
                      t.toUser?._id === userId || t.toUser === userId;
                    const item = t.itemId || t.propertyId;

                    return (
                      <div
                        key={t._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-muted rounded overflow-hidden shrink-0">
                            {item?.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt="Property"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Shield className="h-full w-full p-2 opacity-20" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {item?.brand} {item?.model}
                            </p>
                            
                            {(item?.uniqueId || item?.imei || item?.serialNumber || item?.chasisNumber) && (
                              <p className="text-[11px] text-muted-foreground/80 font-mono mt-0.5 mb-1">
                                ID: {item.uniqueId || item.imei || item.serialNumber || item.chasisNumber}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                              {isIncoming ? (
                                <>
                                  From: {t.fromUser?.name || t.fromUser?.email}
                                </>
                              ) : (
                                <>
                                  To:{" "}
                                  {t.toUser
                                    ? t.toUser.name || t.toUser.email
                                    : t.receiverEmail}
                                </>
                              )}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />{" "}
                              {new Date(
                                t.updatedAt || t.createdAt,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={isIncoming ? "outline" : "secondary"}
                            className="text-[10px]"
                          >
                            {isIncoming ? "Incoming" : "Outgoing"}
                          </Badge>
                          <Badge
                            className="text-[10px]"
                            variant={
                              t.status === "accepted"
                                ? "default"
                                : t.status === "declined" ||
                                  t.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
