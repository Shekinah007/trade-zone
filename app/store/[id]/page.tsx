import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Clock, Mail, Phone, Calendar, Star } from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

async function getStoreData(sellerId: string) {
  await dbConnect();

  // Fetch Business and User data in parallel
  const [business, user, listings] = await Promise.all([
    Business.findOne({ owner: sellerId }).lean(),
    User.findById(sellerId).select("-password").lean(),
    Listing.find({ seller: sellerId, status: 'active' }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) {
    return null;
  }

  // Parse JSON to avoid serialization issues with MongoDB objects
  return {
    business: business ? JSON.parse(JSON.stringify(business)) : null,
    user: JSON.parse(JSON.stringify(user)),
    listings: JSON.parse(JSON.stringify(listings)),
  };
}

export default async function StorePage({ params }: { params: { id: string } }) {
  // Use await params (Next.js 15+ requirement if params is a promise, 
  // currently params is usually synchronous in 13/14 but safe to handle)
  // Actually, in the latest Next.js versions params is just an object. 
  // However, I see "await params" usage in previous user edit in review route.
  // I'll stick to direct access for now, but be mindful.
  
  const { id } = await params; 
  const data = await getStoreData(id);

  if (!data) {
    notFound();
  }

  const { business, user, listings } = data;
  
  // Determine display name and image
  const displayName = business?.name || user.name;
  const displayImage = business?.image || user.image; // Use business logo if available, else user avatar
  const description = business?.description || `Welcome to ${user.name}'s store!`;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-10">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-b from-muted/50 to-background">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar / Logo */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={displayImage} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {business?.type && (
                     <Badge variant="secondary" className="mt-2">{business.type}</Badge>
                  )}
                  <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                   {business?.address && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{business.address}</span>
                      </div>
                   )}
                   {(business?.businessHours) && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{business.businessHours}</span>
                      </div>
                   )}
                   {business?.email && (
                     <div className="flex items-center justify-center md:justify-start gap-2">
                       <Mail className="h-4 w-4" />
                       <span>{business.email}</span>
                     </div>
                   )}
                   {business?.phone && (
                     <div className="flex items-center justify-center md:justify-start gap-2">
                       <Phone className="h-4 w-4" />
                       <span>{business.phone}</span>
                     </div>
                   )}
                   <div className="flex items-center justify-center md:justify-start gap-2">
                     <Calendar className="h-4 w-4" />
                     <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
                
                {/* Socials */}
                {business?.socials && business.socials.length > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                    {business.socials.map((social: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={social.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                         <Globe className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Actions (Future: Follow, Message) */}
              {/* <div className="flex gap-2">
                 <Button>Message</Button>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Listings Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Active Listings ({listings.length})</h2>
        
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing: any) => (
              <ListingCard
                key={listing._id}
                id={listing._id}
                title={listing.title}
                price={listing.price}
                image={listing.images?.[0]}
                category={listing.category}
                condition={listing.condition}
                location={listing.location}
                createdAt={listing.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
             <p className="text-muted-foreground text-lg">No active listings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
