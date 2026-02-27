import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { PlusCircle, Settings, Package, Trash2, Edit } from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

async function getUserListings(userId: string | undefined) {
  await dbConnect();
  const listings = await Listing.find({ seller: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(listings));
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

   //  const { data: session } = useSession();


  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const listings = await getUserListings(session.user.id);
  const activeListings = listings.filter((l: any) => l.status === "active");
  const soldListings = listings.filter((l: any) => l.status === "sold");


  return (
    <div className="container mx-auto py-10 px-4">
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

        {/* Main Content */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
              <Button asChild>
                <Link href="/listings/create">
                   <PlusCircle className="mr-2 h-4 w-4" />
                   New Listing
                </Link>
              </Button>
           </div>

           <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
                <TabsTrigger value="sold">Sold ({soldListings.length})</TabsTrigger>
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
      </div>
    </div>
  );
}
