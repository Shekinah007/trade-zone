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
  ArrowLeftRight,
  ShoppingBag,
  Database,
  Zap,
  Coins,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import Property from "@/models/Property";
import TransferRequest from "@/models/TransferRequest";
import { ListingCard } from "@/components/ListingCard";
import { TransfersTab } from "@/components/TransfersTab";
import { TokenPurchaseButton } from "@/components/TokenPurchaseButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import User from "@/models/User";

async function getUserListings(userId: string | undefined) {
  await dbConnect();
  const listings = await Listing.find({ seller: userId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

async function getUserProperties(userId: string | undefined) {
  await dbConnect();
  const properties = await Property.find({ owner: userId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(properties));
}

async function getUserDetails(userId: string | undefined) {
  await dbConnect();
  const user = await User.findById(userId);
  return JSON.parse(JSON.stringify(user));
}

async function getUserTransfers(userId: string | undefined) {
  await dbConnect();
  const incoming = await TransferRequest.find({
    toUser: userId,
    status: "pending",
  })
    .populate("fromUser", "name email")
    .populate("propertyId", "brand model images itemType")
    .sort({ createdAt: -1 })
    .lean();
  const outgoing = await TransferRequest.find({
    fromUser: userId,
    status: "pending",
  })
    .populate("toUser", "name email")
    .populate("propertyId", "brand model images itemType")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify({ incoming, outgoing }));
}

export default async function DashboardPage({ searchParams }: any) {
  const session = await getServerSession(authOptions);
  // Parse search params for Next.js 15+ compatibility
  const params = await searchParams;
  const defaultTab = params?.tab === "registry" ? "registry" : "marketplace";

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const listings = await getUserListings(session.user.id);
  const properties = await getUserProperties(session.user.id);
  const details = await getUserDetails(session.user.id);
  const transfers = await getUserTransfers(session.user.id);
  const activeListings = listings.filter((l: any) => l.status === "active");
  const soldListings = listings.filter((l: any) => l.status === "sold");
  const missingProperties = properties.filter(
    (p: any) => p.status === "missing",
  );
  const registeredProperties = properties.filter(
    (p: any) => p.status === "registered",
  );

  const totalViews = listings.reduce(
    (acc: number, l: any) => acc + (l.views || 0),
    0,
  );
  // const totalMessages = 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Welcome Header - Compact */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your marketplace listings and protected assets
          </p>
        </div>

        {/* Stats Overview - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Listings
                  </p>
                  <h2 className="text-xl font-bold">{activeListings.length}</h2>
                </div>
                <Package className="h-6 w-6 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Registered Items
                  </p>
                  <h2 className="text-xl font-bold">{properties.length}</h2>
                </div>
                <Shield className="h-6 w-6 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                  <h2 className="text-xl font-bold">{totalViews}</h2>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                  <h2 className="text-xl font-bold">{totalMessages}</h2>
                </div>
                <MessageCircle className="h-6 w-6 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Compact */}
          <div className="lg:col-span-1 space-y-4 ">
            {/* User Profile Card - Compact */}
            <Card className="overflow-hidden sticky top-6 py-0">
              <div className="h-16 bg-gradient-to-r from-emerald-500 to-red-500" />
              <CardContent className="text-center -mt-10 pb-4">
                <Avatar className="h-16 w-16 mx-auto border-2 border-background shadow-lg">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="text-lg bg-gradient-to-r from-emerald-500 to-red-500 text-white">
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-2 font-semibold text-sm">
                  {session.user.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-around text-xs">
                    <div className="text-center">
                      <div className="font-bold text-emerald-600">
                        {activeListings.length}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        Active
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {properties.length}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        Protected
                      </div>
                    </div>
                    {/* <div className="text-center">
                      <div className="font-bold text-orange-600">{totalMessages}</div>
                      <div className="text-muted-foreground text-[10px]">Messages</div>
                    </div> */}
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                    asChild
                  >
                    <Link href="/settings">
                      <Settings className="mr-2 h-3 w-3" />
                      Account Settings
                    </Link>
                  </Button>
                </div>

                <p className="text-xs font-semibold text-muted-foreground mt-7">
                  Quick Actions
                </p>

                <div className="flex flex-col gap-1 mt-1">
                  <Button
                    size="sm"
                    className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                    asChild
                  >
                    <Link href="/listings/create">
                      <PlusCircle className="mr-2 h-3 w-3" />
                      Post New Listing
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs h-8"
                    asChild
                  >
                    <Link href="/registry/register">
                      <Shield className="mr-2 h-3 w-3" />
                      Register Property
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs h-8"
                    asChild
                  >
                    <Link href="/messages">
                      <MessageCircle className="mr-2 h-3 w-3" />
                      View Messages
                      {/* {totalMessages > 0 && (
                      <Badge variant="destructive" className="ml-auto text-[10px] px-1">
                        {totalMessages}
                      </Badge>
                    )} */}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs h-8"
                    asChild
                  >
                    <Link href="/dashboard/tokens">
                      <Coins className="mr-2 h-3 w-3" />
                      My Tokens
                      {/* {totalMessages > 0 && (
                      <Badge variant="destructive" className="ml-auto text-[10px] px-1">
                        {totalMessages}
                      </Badge>
                    )} */}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tab System */}
          <div className="lg:col-span-3">
            <Tabs defaultValue={defaultTab} className="w-full">
              <div className="flex items-center justify-between mb-1">
                <TabsList className="bg-muted/50 p-0.5 h-8">
                  <TabsTrigger
                    value="marketplace"
                    className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5 text-xs h-7 px-3"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Marketplace
                  </TabsTrigger>
                  <TabsTrigger
                    value="registry"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-1.5 text-xs h-7 px-3"
                  >
                    <Database className="h-3.5 w-3.5" />
                    Property Registry
                  </TabsTrigger>
                  <TabsTrigger
                    value="transfers"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-1.5 text-xs h-7 px-3 relative"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Transfers
                    {(transfers.incoming.length > 0 ||
                      transfers.outgoing.length > 0) && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Dynamic Action Button */}
                {/* <div className="hidden sm:block">
                  <div className="data-[state=marketplace]:block data-[state=registry]:hidden">
                    <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-8 text-xs">
                      <Link href="/listings/create">
                        <PlusCircle className="mr-1.5 h-3 w-3" />
                        Post Ad
                      </Link>
                    </Button>
                  </div>
                  <div className="data-[state=registry]:block data-[state=marketplace]:hidden">
                    <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 rounded-full h-8 text-xs">
                      <Link href="/registry/register">
                        <Shield className="mr-1.5 h-3 w-3" />
                        Register Asset
                      </Link>
                    </Button>
                  </div>
                </div> */}
              </div>

              {/* ==================== MARKETPLACE TAB ==================== */}
              <TabsContent value="marketplace" className="space-y-4 mt-0">
                <div className="data-[state=marketplace]:block data-[state=registry]:hidden">
                  <Button
                    size="sm"
                    asChild
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 rounded-full h-8 text-base"
                  >
                    <Link href="/listings/create">
                      <PlusCircle className="mr-1.5 h-3 w-3" />
                      Post Ad
                    </Link>
                  </Button>
                </div>
                {/* Marketplace Stats - Compact */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            Active Listings
                          </p>
                          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            {activeListings.length}
                          </p>
                        </div>
                        <Package className="h-6 w-6 text-emerald-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-orange-700 dark:text-orange-400">
                            Sold Items
                          </p>
                          <p className="text-xl font-bold text-orange-700 dark:text-orange-400">
                            {soldListings.length}
                          </p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-orange-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Messages Link Card - Compact */}
                <Card className="border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        {/* <div>
                          <p className="font-semibold text-sm">Messages from buyers</p>
                          <p className="text-xs text-muted-foreground">You have {totalMessages} unread messages</p>
                        </div> */}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 text-xs h-7"
                        asChild
                      >
                        <Link href="/messages">
                          View All <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Listings Tabs - Compact */}
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="bg-emerald-500/10 h-8">
                    <TabsTrigger
                      value="active"
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs h-7"
                    >
                      Active ({activeListings.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="sold"
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs h-7"
                    >
                      Sold ({soldListings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="mt-4">
                    {activeListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7"
                                asChild
                              >
                                <Link href={`/listings/${listing._id}/edit`}>
                                  <Edit className="h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">
                            You don't have any active listings.
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            asChild
                            className="mt-1 text-xs"
                          >
                            <Link href="/listings/create">
                              Create your first listing →
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="sold" className="mt-4">
                    {soldListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                          <p className="text-sm">No sold items yet.</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* ==================== PROPERTY REGISTRY TAB ==================== */}
              <TabsContent value="registry" className="space-y-4 mt-0">
                <div className="data-[state=registry]:block data-[state=marketplace]:hidden">
                  <Button
                    size="sm"
                    asChild
                    className="w-full py-6 bg-red-600 hover:bg-blue-700 rounded-full h-8 text-base"
                  >
                    <Link href="/registry/register">
                      <Shield className="mr-1.5 h-3 w-3" />
                      Register New Item
                    </Link>
                  </Button>
                </div>
                {/* Registry Stats - Compact */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-red-700 dark:text-red-400">
                            Total Protected
                          </p>
                          <p className="text-xl font-bold text-red-700 dark:text-red-400">
                            {properties.length}
                          </p>
                        </div>
                        <Shield className="h-6 w-6 text-red-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Clean Status
                          </p>
                          <p className="text-xl font-bold text-green-700 dark:text-green-400">
                            {registeredProperties.length}
                          </p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-red-700 dark:text-red-400">
                            Missing Items
                          </p>
                          <p className="text-xl font-bold text-red-700 dark:text-red-400">
                            {missingProperties.length}
                          </p>
                        </div>
                        <AlertTriangle className="h-6 w-6 text-red-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Registry Options - Upgrade Limit */}
                <Card className="border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20 mb-4 mt-4">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full">
                          <Zap className="h-3.5 w-3.5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Registration Quota
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {details.unlimitedRegistrations
                              ? "You have unlimited property registrations."
                              : `You have registered ${properties.length} out of ${details.registrationLimit || 1} properties.`}
                          </p>
                        </div>
                      </div>
                      {!details.unlimitedRegistrations && (
                        <TokenPurchaseButton
                          size="sm"
                          className="h-7 text-xs"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Tips - Compact */}
                {properties.length === 0 && (
                  <Card className="border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs">
                            Protect your assets today
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Register your devices, vehicles, and electronics to
                            create a verifiable chain of ownership.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Properties Grid - Compact */}
                <div className="mt-4">
                  {properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {properties.map((p: any) => {
                        const statusColors: Record<string, string> = {
                          registered:
                            "bg-green-500/10 text-green-600 border-green-500/20",
                          missing:
                            "bg-red-500/10 text-red-600 border-red-500/20",
                          found: "bg-red-500/10 text-red-600 border-red-500/20",
                          transferred:
                            "bg-purple-500/10 text-purple-600 border-purple-500/20",
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
                            <Card className="group overflow-hidden rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                              <div className="relative h-32 w-full bg-muted">
                                {p.images?.[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt={`${p.brand} ${p.model}`}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                                    <Shield className="h-8 w-8 opacity-20" />
                                  </div>
                                )}
                                <div className="absolute top-1.5 right-1.5">
                                  <Badge
                                    className={`text-[9px] px-1.5 py-0 border flex items-center gap-0.5 ${statusColors[p.status] || ""}`}
                                  >
                                    <StatusIcon className="h-2.5 w-2.5" />
                                    {p.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <CardContent className="p-3 space-y-2">
                                <div>
                                  <h3 className="font-semibold text-xs leading-tight capitalize">
                                    {p.brand} {p.model}
                                  </h3>
                                  <p className="text-[10px] text-muted-foreground capitalize">
                                    {p.itemType}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                                  {p.color && <span>🎨 {p.color}</span>}
                                  {p.yearOfPurchase && (
                                    <span>📅 {p.yearOfPurchase}</span>
                                  )}
                                </div>

                                {(p.imei ||
                                  p.serialNumber ||
                                  p.chassisNumber) && (
                                  <div className="text-[9px] font-mono bg-muted/40 px-1.5 py-0.5 rounded truncate">
                                    🔑{" "}
                                    {p.imei ||
                                      p.serialNumber ||
                                      p.chassisNumber}
                                  </div>
                                )}

                                {p.status === "missing" && (
                                  <div className="text-[9px] font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <AlertTriangle className="h-2.5 w-2.5" />⚠
                                    DO NOT PURCHASE
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
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
                        <Shield className="h-8 w-8 opacity-30" />
                        <p className="font-medium text-sm">
                          No registered properties yet
                        </p>
                        <p className="text-xs max-w-xs">
                          Register your phones, laptops, cars, and more to
                          protect your ownership.
                        </p>
                        <Button
                          size="sm"
                          asChild
                          className="rounded-full mt-1 bg-gradient-to-r from-red-600 to-red-700 border-0 text-xs h-8"
                        >
                          <Link href="/registry/register">
                            Register Your First Property
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* ==================== TRANSFERS TAB ==================== */}
              <TabsContent value="transfers" className="space-y-4 mt-0">
                <TransfersTab
                  incoming={transfers.incoming}
                  outgoing={transfers.outgoing}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
