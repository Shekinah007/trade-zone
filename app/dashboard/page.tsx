import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import {
  PlusCircle,
  Settings,
  Package,
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
  Star,
  Clock,
  Infinity,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import TransferRequest from "@/models/TransferRequest";
import Purchase from "@/models/Purchase";
import "@/models/FeaturedTier";
import "@/models/BoostTier";
import "@/models/Conversation"
import "@/models/FeaturedWaitlist"
import "@/models/ListingPack"
import { SearchableMarketplace } from "@/components/dashboard/SearchableMarketplace";
import { SearchableRegistry } from "@/components/dashboard/SearchableRegistry";
import { TransfersTab } from "@/components/TransfersTab";
import { HistoryTab } from "@/components/HistoryTab";
import { TokenPurchaseButton } from "@/components/TokenPurchaseButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import User from "@/models/User";
import Conversation from "@/models/Conversation";

async function getUserListings(userId: string | undefined) {
  await dbConnect();
  const listings = await Item.find({ owner: userId, isListed: true })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

async function getUserProperties(userId: string | undefined) {
  await dbConnect();
  const properties = await Item.find({ owner: userId, isRegistered: true })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(properties));
}

async function getUserDetails(userId: string | undefined) {
  await dbConnect();
  const user = await User.findById(userId);
  return JSON.parse(JSON.stringify(user));
}

async function fetchConversations(userId: string | undefined) {
  await dbConnect();
  const conversations = await Conversation.find({
    participants: userId,
  });
  return JSON.parse(JSON.stringify(conversations));
}

async function getUserTransfers(userId: string | undefined) {
  await dbConnect();
  const incoming = await TransferRequest.find({
    toUser: userId,
    status: "pending",
  })
    .populate("fromUser", "name email")
    .populate("itemId", "brand model images itemType uniqueIdentifier registry")
    .sort({ createdAt: -1 })
    .lean();
  const outgoing = await TransferRequest.find({
    fromUser: userId,
    status: "pending",
  })
    .populate("toUser", "name email")
    .populate("itemId", "brand model images itemType uniqueIdentifier registry")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify({ incoming, outgoing }));
}

async function getUserHistory(userId: string | undefined) {
  await dbConnect();
  const purchases = await Purchase.find({ user: userId })
    .populate("tier")
    .populate("item", "brand model images listing")
    .sort({ createdAt: -1 })
    .lean();

  const transfers = await TransferRequest.find({
    $or: [{ fromUser: userId }, { toUser: userId }],
  })
    .populate("fromUser", "name email")
    .populate("toUser", "name email")
    .populate("itemId", "brand model images itemType uniqueIdentifier registry")
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify({ purchases, transfers }));
}

export default async function DashboardPage({ searchParams }: any) {
  const session = await getServerSession(authOptions);
  // Parse search params for Next.js 15+ compatibility
  const params = await searchParams;
  const defaultTab = params?.tab === "registry" ? "registry" : "marketplace";

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const conversations = await fetchConversations(session.user.id);

  const unreadCount = conversations.filter(
    (conv: any) =>
      session?.user?.id &&
      conv.unreadCount &&
      conv.unreadCount[session.user.id] > 0,
  ).length;

  const listings = await getUserListings(session.user.id);
  const properties = await getUserProperties(session.user.id);
  const details = await getUserDetails(session.user.id);
  const transfers = await getUserTransfers(session.user.id);
  const history = await getUserHistory(session.user.id);
  const activeListings = listings.filter(
    (l: any) => l.listing?.status === "active",
  );
  const soldListings = listings.filter(
    (l: any) => l.listing?.status === "sold",
  );
  const missingProperties = properties.filter(
    (p: any) => p.ownershipStatus === "missing",
  );
  const registeredProperties = properties.filter(
    (p: any) => p.ownershipStatus === "owned",
  );

  const totalViews = listings.reduce(
    (acc: number, l: any) => acc + (l.listing?.views || 0),
    0,
  );
  // const totalMessages = 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Welcome & High Priority Actions */}
        <div className="mb-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 pointer-events-none">
              <Zap className="w-64 h-64" />
            </div>
            <div className="relative z-10 mb-6">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                Welcome back, {session.user.name?.split(" ")[0]}!
              </h1>
              <p className="text-emerald-100/90 text-sm md:text-base max-w-md">
                Manage your marketplace listings, protected assets, and credits
                all in one place.
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-800 hover:bg-gray-100 shadow-md font-semibold rounded-full border-0"
              >
                <Link href="/listings/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Post New Ad
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-red-500 text-white hover:bg-red-600 shadow-md font-semibold rounded-full border-0"
              >
                <Link href="/registry/register">
                  <Shield className="mr-2 h-5 w-5" />
                  Register Asset
                </Link>
              </Button>
            </div>
          </div>

          <div className="w-full md:w-[320px] lg:w-[380px] grid grid-cols-2 gap-3">
            <Card className="border py-2 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/80 rounded-2xl">
              <CardContent className="p-4 flex flex-col gap-3 h-full">
                {/* <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full mb-1">
                  <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {listings.length}
                </h2>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Total Ads
                </p> */}
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                    <Package className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Total Ads
                    </p>
                    <h2 className="text-2xl font-black text-red-700 dark:text-red-400 leading-none">
                      {listings.length}
                    </h2>
                  </div>
                </div>

                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-gray-600 dark:text-gray-400">
                    <span>Quota</span>
                    <span>
                      {listings.length} / {details.listingQuota}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${(listings.length / details.listingQuota) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500">
                    {details.listingQuota - listings.length} remaining
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md py-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/80 rounded-2xl">
              <CardContent className="p-4 flex flex-col gap-3 h-full">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                    <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Protected
                    </p>
                    <h2 className="text-2xl font-black text-red-700 dark:text-red-400 leading-none">
                      {properties.length}
                    </h2>
                  </div>
                </div>

                {/* Quota section */}
                <div className="w-full space-y-1 mt-auto">
                  <div className="flex justify-between items-center text-[11px] font-medium text-gray-600 dark:text-gray-400">
                    <span>Quota</span>
                    <span className="font-semibold">
                      {properties.length} /{" "}
                      {details.unlimitedRegistrations ? (
                        <Infinity className="inline h-4 w-4" />
                      ) : (
                        details.registrationLimit
                      )}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                      style={{
                        width: details.unlimitedRegistrations
                          ? "100%"
                          : `${Math.min((properties.length / details.registrationLimit) * 100, 100)}%`,
                      }}
                    />
                  </div>

                  <p className="text-[10px] text-gray-500 dark:text-gray-500">
                    {details.unlimitedRegistrations
                      ? <span className="font-bold text-green-500">No Limits ⚡</span>
                      : `${details.registrationLimit - properties.length} slot${details.registrationLimit - properties.length !== 1 ? "s" : ""} remaining`}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/80 rounded-2xl col-span-2">
              <CardContent className="p-4 flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                    <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-black text-amber-700 dark:text-amber-400">
                      {details.creditBalance || 0}
                    </h2>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Available Credits
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs"
                >
                  <Link href="/dashboard/tokens">
                    Recharge <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
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
                        {listings.length}
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
                    <div className="text-center">
                      <div className="font-bold text-amber-600">
                        {details.creditBalance || 0}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        Credits
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm h-12 mb-3 bg-green-500 text-white"
                    asChild
                  >
                    <Link href={`/store/${session.user.id}`}>
                      <Store className="mr-2 h-3 w-3" />
                      View My Store
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm h-9"
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

                <div className="flex flex-col gap-2 mt-1">
                  <Button
                    size="sm"
                    className="w-full justify-start bg-green-600 hover:bg-blue-700 text-white shadow-sm text-xs h-9 rounded-lg"
                    asChild
                  >
                    <Link href="/dashboard/tokens">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Increase Listing Quota
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start py-4 border bg-red-500 hover:bg-green-700 text-white shadow-sm text-xs h-9 rounded-lg"
                    asChild
                  >
                    <TokenPurchaseButton
                      size="sm"
                      className="h-7 text-xs"
                      creditBalance={details.creditBalance || 0}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30 text-xs h-9 rounded-lg shadow-sm"
                    asChild
                  >
                    <Link href="/dashboard/boosts">
                      <Zap className="mr-2 h-4 w-4" />
                      Manage Boosts
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/30 text-xs h-9 rounded-lg shadow-sm"
                    asChild
                  >
                    <Link href="/dashboard/featured">
                      <Star className="mr-2 h-4 w-4" />
                      Manage Featured
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs h-9 rounded-lg"
                    asChild
                  >
                    <Link href="/messages">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      View Messages
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs h-9 rounded-lg"
                    asChild
                  >
                    <Link href="/dashboard/tokens">
                      <Coins className="mr-2 h-4 w-4" />
                      My Credits
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tab System */}
          <div className="lg:col-span-3">
            <Tabs defaultValue={defaultTab} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                {/* Tabs container - scrollable on mobile */}
                <div className="relative w-full sm:w-auto overflow-x-auto scrollbar-none pb-1">
                  <TabsList className="inline-flex w-max sm:w-auto gap-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-full shadow-inner">
                    <TabsTrigger
                      value="marketplace"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:shadow-md data-[state=active]:text-white rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 gap-1.5"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Marketplace</span>
                      <span className="sm:hidden">Market</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="registry"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:shadow-md data-[state=active]:text-white rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 gap-1.5"
                    >
                      <Database className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">
                        Property Registry
                      </span>
                      <span className="sm:hidden">Registry</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="transfers"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:shadow-md data-[state=active]:text-white rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 gap-1.5 relative"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Transfers</span>
                      <span className="sm:hidden">Transfers</span>
                      {(transfers.incoming.length > 0 ||
                        transfers.outgoing.length > 0) && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                          </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:shadow-md data-[state=active]:text-white rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 gap-1.5"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">History</span>
                      <span className="sm:hidden">History</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
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
                            All Listings
                          </p>
                          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            {listings.length}
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
                <Card className="border border-emerald-200 dark:border-emerald-800 bg-linear-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                  <CardContent className="py-0 px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Messages from buyers
                          </p>
                          <p className="text-xs text-muted-foreground">
                            You have {unreadCount} unread messages
                          </p>
                        </div>
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

                {/* Registry Options - Upgrade Limit */}
                <Card className="border border-red-200 dark:border-red-800 bg-linear-to-r from-red-50/50 to-transparent dark:from-red-950/20 mb-4 mt-4">
                  <CardContent className="py-0 px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full">
                          <Zap className="h-3.5 w-3.5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Listing Quota</p>
                          <p className="text-xs text-muted-foreground">
                            {`Used ${listings.length} / ${details.listingQuota || 1} quota. You have ${details.creditBalance || 0} credits.`}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={"/dashboard/tokens"}
                        className="text-xs  bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg"
                      >
                        Get More
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Searchable Listings */}
                <SearchableMarketplace
                  activeListings={activeListings}
                  soldListings={soldListings}
                />
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
                  <Card className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
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
                  <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
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
                  <Card className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
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
                <Card className="border border-red-200 dark:border-red-800 bg-linear-to-r from-red-50/50 to-transparent dark:from-red-950/20 mb-4 mt-4">
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
                              : `Used ${properties.length} / ${details?.registrationLimit} quota. You have ${details.creditBalance || 0} credits.`}
                          </p>
                        </div>
                      </div>
                      {!details.unlimitedRegistrations && (
                        <TokenPurchaseButton
                          size="sm"
                          className="h-7 text-xs"
                          creditBalance={details.creditBalance || 0}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Tips - Compact */}
                {properties.length === 0 && (
                  <Card className="border border-red-200 dark:border-red-800 bg-linear-to-r from-red-50/50 to-transparent dark:from-red-950/20">
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

                {/* Searchable Properties Grid */}
                <div className="mt-4">
                  <SearchableRegistry properties={properties} />
                </div>
              </TabsContent>

              {/* ==================== TRANSFERS TAB ==================== */}
              <TabsContent value="transfers" className="space-y-4 mt-0">
                <TransfersTab
                  incoming={transfers.incoming}
                  outgoing={transfers.outgoing}
                />
              </TabsContent>

              {/* ==================== HISTORY TAB ==================== */}
              <TabsContent value="history" className="space-y-4 mt-0">
                <HistoryTab
                  purchases={history.purchases}
                  transfers={history.transfers}
                  userId={session.user.id}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
