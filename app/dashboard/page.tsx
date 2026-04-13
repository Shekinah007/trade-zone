import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { 
  PlusCircle, 
  Settings, 
  Package, 
  Edit, 
  Shield, 
  MessageCircle,
  Store,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  LayoutDashboard,
  ShoppingBag,
  Database
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import Property from "@/models/Property";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

async function getUserListings(userId: string | undefined) {
  await dbConnect();
  const listings = await Listing.find({ seller: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(listings));
}

async function getUserProperties(userId: string | undefined) {
  await dbConnect();
  const properties = await Property.find({ owner: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(properties));
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const listings = await getUserListings(session.user.id);
  const properties = await getUserProperties(session.user.id);
  const activeListings = listings.filter((l: any) => l.status === "active");
  const soldListings = listings.filter((l: any) => l.status === "sold");
  const missingProperties = properties.filter((p: any) => p.status === "missing");
  const registeredProperties = properties.filter((p: any) => p.status === "registered");

  // Quick stats for dashboard
  const totalViews = listings.reduce((acc: number, l: any) => acc + (l.views || 0), 0);
  const totalMessages = 12; // This would come from your messages model

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.user.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Manage your marketplace listings and protected assets</p>
        </div>

        {/* Stats Overview - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <h2 className="text-2xl font-bold">{activeListings.length}</h2>
                </div>
                <Package className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Registered Items</p>
                  <h2 className="text-2xl font-bold">{properties.length}</h2>
                </div>
                <Shield className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <h2 className="text-2xl font-bold">{totalViews}</h2>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <h2 className="text-2xl font-bold">{totalMessages}</h2>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Always Visible */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="overflow-hidden sticky top-6">
              <div className="h-24 bg-gradient-to-r from-emerald-500 to-blue-500" />
              <CardContent className="text-center -mt-12 pb-6">
                <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 font-semibold text-lg">{session.user.name}</h2>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-around text-xs">
                    <div className="text-center">
                      <div className="font-bold text-emerald-600">{activeListings.length}</div>
                      <div className="text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{properties.length}</div>
                      <div className="text-muted-foreground">Protected</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{totalMessages}</div>
                      <div className="text-muted-foreground">Messages</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/listings/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post New Listing
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/registry/register">
                    <Shield className="mr-2 h-4 w-4" />
                    Register Property
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/messages">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    View Messages
                    {totalMessages > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {totalMessages}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tab System */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="marketplace" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger 
                    value="marketplace" 
                    className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Marketplace
                  </TabsTrigger>
                  <TabsTrigger 
                    value="registry" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Property Registry
                  </TabsTrigger>
                </TabsList>
                
                {/* Dynamic Action Button based on active tab */}
                <div className="hidden sm:block">
                  <div className="data-[state=marketplace]:block data-[state=registry]:hidden">
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-500/20">
                      <Link href="/listings/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post Ad
                      </Link>
                    </Button>
                  </div>
                  <div className="data-[state=registry]:block data-[state=marketplace]:hidden">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-500/20">
                      <Link href="/registry/register">
                        <Shield className="mr-2 h-4 w-4" />
                        Register Asset
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* ==================== MARKETPLACE TAB ==================== */}
              <TabsContent value="marketplace" className="space-y-6 mt-0">
                {/* Marketplace Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">Active Listings</p>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeListings.length}</p>
                        </div>
                        <Package className="h-8 w-8 text-emerald-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-700 dark:text-orange-400">Sold Items</p>
                          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{soldListings.length}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Messages Link Card */}
                <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                          <MessageCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Messages from buyers</p>
                          <p className="text-sm text-muted-foreground">You have {totalMessages} unread messages</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-emerald-600" asChild>
                        <Link href="/messages">
                          View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Listings Tabs */}
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="bg-emerald-500/10">
                    <TabsTrigger 
                      value="active" 
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                    >
                      Active ({activeListings.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sold" 
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                    >
                      Sold ({soldListings.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="mt-6">
                    {activeListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeListings.map((listing: any) => (
                          <div key={listing._id} className="relative group">
                            <ListingCard
                              id={listing._id}
                              title={listing.title}
                              price={listing.price}
                              image={listing.images[0]}
                              category={listing.category}
                              condition={listing.condition}
                              location={listing.location}
                              createdAt={listing.createdAt}
                            />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                                <Link href={`/listings/${listing._id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                          <Package className="h-12 w-12 mb-4 opacity-50" />
                          <p>You don't have any active listings.</p>
                          <Button variant="link" asChild className="mt-2">
                            <Link href="/listings/create">Create your first listing →</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sold" className="mt-6">
                    {soldListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {soldListings.map((listing: any) => (
                          <ListingCard
                            key={listing._id}
                            id={listing._id}
                            title={listing.title}
                            price={listing.price}
                            image={listing.images[0]}
                            category={listing.category}
                            condition={listing.condition}
                            location={listing.location}
                            createdAt={listing.createdAt}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                          <p>No sold items yet.</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              {/* ==================== PROPERTY REGISTRY TAB ==================== */}
              <TabsContent value="registry" className="space-y-6 mt-0">
                {/* Registry Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Total Protected</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{properties.length}</p>
                        </div>
                        <Shield className="h-8 w-8 text-blue-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700 dark:text-green-400">Clean Status</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{registeredProperties.length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-700 dark:text-red-400">Missing Items</p>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{missingProperties.length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Tips */}
                {properties.length === 0 && (
                  <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Protect your assets today</p>
                          <p className="text-sm text-muted-foreground">
                            Register your devices, vehicles, and electronics to create a verifiable chain of ownership and deter theft.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Properties Grid */}
                <div className="mt-4">
                  {properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {properties.map((p: any) => {
                        const statusColors: Record<string, string> = {
                          registered: "bg-green-500/10 text-green-600 border-green-500/20",
                          missing: "bg-red-500/10 text-red-600 border-red-500/20",
                          found: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                          transferred: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                        };
                        const statusIcons: Record<string, any> = {
                          registered: CheckCircle,
                          missing: AlertTriangle,
                          found: Shield,
                          transferred: ArrowRight,
                        };
                        const StatusIcon = statusIcons[p.status] || Shield;
                        
                        return (
                          <Link key={p._id} href={`/registry/${p._id}`}>
                            <Card className="group overflow-hidden rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                              <div className="relative h-40 w-full bg-muted">
                                {p.images?.[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt={`${p.brand} ${p.model}`}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                                    <Shield className="h-12 w-12 opacity-20" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <Badge className={`text-[10px] px-2 py-0.5 border flex items-center gap-1 ${statusColors[p.status] || ""}`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {p.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <CardContent className="p-4 space-y-3">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-sm leading-tight capitalize">
                                    {p.brand} {p.model}
                                  </h3>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {p.itemType}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  {p.color && <span>🎨 {p.color}</span>}
                                  {p.yearOfPurchase && <span>📅 {p.yearOfPurchase}</span>}
                                </div>

                                {(p.imei || p.serialNumber || p.chassisNumber) && (
                                  <div className="text-xs font-mono bg-muted/40 px-2 py-1 rounded-md truncate">
                                    🔑 {p.imei || p.serialNumber || p.chassisNumber}
                                  </div>
                                )}

                                {p.status === "missing" && (
                                  <div className="text-[11px] font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    ⚠ DO NOT PURCHASE - Report if found
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-3">
                        <Shield className="h-12 w-12 opacity-30" />
                        <p className="font-medium">No registered properties yet</p>
                        <p className="text-sm max-w-xs">Register your phones, laptops, cars, and more to protect your ownership.</p>
                        <Button asChild className="rounded-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 border-0">
                          <Link href="/registry/register">Register Your First Property</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}