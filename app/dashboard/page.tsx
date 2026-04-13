import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { PlusCircle, Settings, Package, Edit, Shield } from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import Property from "@/models/Property";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

   //  const { data: session } = useSession();


  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const listings = await getUserListings(session.user.id);
  const properties = await getUserProperties(session.user.id);
  const activeListings = listings.filter((l: any) => l.status === "active");
  const soldListings = listings.filter((l: any) => l.status === "sold");


  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <Card className="p-4">
    <p className="text-xs text-muted-foreground">Active Listings</p>
    <h2 className="text-2xl font-bold">{activeListings.length}</h2>
  </Card>

  <Card className="p-4">
    <p className="text-xs text-muted-foreground">Sold</p>
    <h2 className="text-2xl font-bold">{soldListings.length}</h2>
  </Card>

  <Card className="p-4">
    <p className="text-xs text-muted-foreground">Registered Items</p>
    <h2 className="text-2xl font-bold">{properties.length}</h2>
  </Card>

  <Card className="p-4 border-red-500/30">
    <p className="text-xs text-muted-foreground">Missing</p>
    <h2 className="text-2xl font-bold text-red-600">
      {properties.filter((p: any) => p.status === "missing").length}
    </h2>
  </Card>
</div>
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        
        {/* Sidebar / User Info */}
        <div className="space-y-6">
          <Card>
             <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Avatar className="h-24 w-24">
                     <AvatarImage src={session.user.image || ""} />
                     <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{session.user.name}</CardTitle>
                <CardDescription>{session.user.email}</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-2">
                   <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/settings">
                       <Settings className="mr-2 h-4 w-4" />
                       Settings
                     </Link>
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* <Card className="sticky top-6 overflow-hidden h-[250px]">
  <div className="h-20 bg-gradient-to-r from-primary to-blue-600" />

  <CardContent className="text-center -mt-10">
    <Avatar className="h-20 w-20 mx-auto border-4 border-background">
      <AvatarImage src={session.user.image || ""} />
      <AvatarFallback>
        {session.user.name?.charAt(0)}
      </AvatarFallback>
    </Avatar>

    <h2 className="mt-3 font-semibold">{session.user.name}</h2>
    <p className="text-xs text-muted-foreground">{session.user.email}</p>

    <div className="mt-4 space-y-2">
      <Button variant="outline" className="w-full" asChild>
        <Link href="/settings">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </Button>
    </div>
  </CardContent>
</Card> */}

        {/* Main Content */}
        <div className="space-y-16">
          
          {/* Section 1: Marketplace */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                     <Package className="h-6 w-6 text-emerald-600" /> Marketplace
                   </h2>
                   <p className="text-sm text-muted-foreground mt-1">Manage your classified ads for sale.</p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                  <Link href="/listings/create">
                     <PlusCircle className="mr-2 h-4 w-4" />
                     Post Ad
                  </Link>
                </Button>
             </div>

             <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-emerald-500/10">
                  <TabsTrigger value="active" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Active ({activeListings.length})</TabsTrigger>
                  <TabsTrigger value="sold" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Sold ({soldListings.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-6">
                 {activeListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            {/* Actions Overlay (could be improved) */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button size="icon" variant="secondary">
                                 <Edit className="h-4 w-4" />
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
                       </CardContent>
                    </Card>
                 )}
              </TabsContent>
              
              <TabsContent value="sold" className="mt-6">
                  {soldListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>

          <hr className="border-t border-border/50" />

          {/* Section 2: Registry */}
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                    <Shield className="h-6 w-6 text-blue-600" /> Property Registry
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your secured assets and view ownership status. ({properties.length} registered propert{properties.length !== 1 ? "ies" : "y"})
                  </p>
                </div>
                <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-0 self-start sm:self-auto">
                  <Link href="/registry/register">
                    <Shield className="mr-2 h-4 w-4" />
                    Register New Asset
                  </Link>
                </Button>
             </div>
             
             <div className="mt-4">

                 {properties.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {properties.map((p: any) => {
                       const statusColors: Record<string, string> = {
                         registered: "bg-green-500/10 text-green-600 border-green-500/20",
                         missing: "bg-red-500/10 text-red-600 border-red-500/20",
                         found: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                         transferred: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                       };
                       return (
                       <Link key={p._id} href={`/registry/${p._id}`}>
  <Card className="group overflow-hidden rounded-2xl border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
    
    {/* Image */}
    <div className="relative h-40 w-full bg-muted">
      {p.images?.[0] ? (
        <img
          src={p.images[0]}
          alt={`${p.brand} ${p.model}`}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
          No Image
        </div>
      )}

      {/* Status badge overlay */}
      <div className="absolute top-2 right-2">
        <Badge
          className={`text-[10px] px-2 py-0.5 border ${
            statusColors[p.status] || ""
          }`}
        >
          {p.status.toUpperCase()}
        </Badge>
      </div>
    </div>

    <CardContent className="p-4 space-y-3">
      
      {/* Title */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm leading-tight capitalize">
          {p.brand} {p.model}
        </h3>
        <p className="text-xs text-muted-foreground capitalize">
          {p.itemType}
        </p>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {p.color && <span>🎨 {p.color}</span>}
        {p.yearOfPurchase && <span>📅 {p.yearOfPurchase}</span>}
      </div>

      {/* Identifier */}
      {(p.imei || p.serialNumber || p.chassisNumber) && (
        <div className="text-xs font-mono bg-muted/40 px-2 py-1 rounded-md truncate">
          {p.imei || p.serialNumber || p.chassisNumber}
        </div>
      )}

      {/* Alert for missing */}
      {p.status === "missing" && (
        <div className="text-[11px] font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
          ⚠ DO NOT PURCHASE
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
                       <Shield className="h-10 w-10 opacity-30" />
                       <p className="font-medium">No registered properties yet</p>
                       <p className="text-sm max-w-xs">Register your phones, laptops, cars, and more to protect your ownership.</p>
                       <Button asChild className="rounded-full mt-2 bg-gradient-to-r from-primary to-blue-600 border-0">
                         <Link href="/registry/register">Register a Property</Link>
                       </Button>
                     </CardContent>
                   </Card>
                 )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
