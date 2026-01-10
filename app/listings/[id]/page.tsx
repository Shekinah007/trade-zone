import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart, MapPin, Share2, ShieldCheck, Flag, Calendar } from "lucide-react";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import "@/models/User"; // Ensure User model is registered
import "@/models/Category";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListingActions, ReportButton } from "@/components/ListingActions";
import { SellerRating } from "@/components/SellerRating";

import Transaction from "@/models/Transaction";
import "@/models/User"; // Ensure User model is registered

async function getListing(id: string) {
  try {
    await dbConnect();
    // Validate ID format
    // if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

    const listing = await Listing.findById(id).populate("seller").populate("category").lean();
    if (!listing) return null;

    // Fetch History
    const history = await Transaction.find({ listing: id })
      .populate("buyer", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return { 
      ...JSON.parse(JSON.stringify(listing)), 
      history: JSON.parse(JSON.stringify(history)) 
    };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const listing = await getListing(id);
  
  if (!listing) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(listing.price);


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-none bg-transparent">
             <Carousel className="w-full">
              <CarouselContent>
                {listing.images && listing.images.length > 0 ? (
                  listing.images.map((img: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        <img
                          src={img}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                   <CarouselItem>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No images available</span>
                      </div>
                    </CarouselItem>
                )}
              </CarouselContent>
              {listing.images && listing.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="font-semibold text-muted-foreground">Condition:</span>
                   <span className="ml-2">{listing.condition}</span>
                 </div>
                  <div>
                   <span className="font-semibold text-muted-foreground">Category:</span>
                   <span className="ml-2">{listing.category?.name || "Uncategorized"}</span>
                 </div>
                 <div>
                    <span className="font-semibold text-muted-foreground">Posted:</span>
                    <span className="ml-2">{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                 </div>
                  <div>
                     <span className="font-semibold text-muted-foreground">Views:</span>
                     <span className="ml-2">{listing.views}</span>
                  </div>
                  {listing.uniqueIdentifier && (
                    <div className="col-span-2 border-t pt-2 mt-2">
                       <span className="font-semibold text-muted-foreground block mb-1">Serial / Unique ID:</span>
                       <code className="bg-muted px-2 py-1 rounded text-xs font-mono select-all">
                         {listing.uniqueIdentifier}
                       </code>
                    </div>
                  )}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Price, Seller, Actions */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/10">
            <CardContent className="p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold leading-tight mb-2">{listing.title}</h1>
                 <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">{formattedPrice}</span>
                    <Badge variant="outline">{listing.condition}</Badge>
                 </div>
              </div>

               <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location?.city}, {listing.location?.country}
               </div>

              <div className="space-y-3">
                <ListingActions 
                  listingId={listing._id} 
                  sellerId={listing.seller?._id} 
                  listingTitle={listing.title} 
                  price={listing.price}
                  history={listing.history}
                  status={listing.status}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-lg">Seller Information</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                     <AvatarImage src={listing.seller?.image} />
                     <AvatarFallback>{listing.seller?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{listing.seller?.name || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">Member since {new Date(listing.seller?.createdAt).getFullYear()}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                   <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                   <span>Verified Email</span>
                </div>

                <div className="pt-2 border-t mt-2">
                   <SellerRating sellerId={listing.seller?._id} />
                </div>
                
                
                 <ReportButton listingId={listing._id} />
             </CardContent>
          </Card>

          <Card className="bg-muted/30">
             <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                   <ShieldCheck className="h-4 w-4 mr-2" />
                   Safety Tips
                </h3>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                   <li>Meet in a safe, public place</li>
                   <li>Check the item before buying</li>
                   <li>Pay only after collecting the item</li>
                   <li>Avoid sharing financial info</li>
                </ul>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
