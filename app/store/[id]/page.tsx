// import { notFound } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   MapPin,
//   Globe,
//   Clock,
//   Mail,
//   Phone,
//   Calendar,
//   Star,
// } from "lucide-react";
// import dbConnect from "@/lib/db";
// import User from "@/models/User";
// import Business from "@/models/Business";
// import Listing from "@/models/Listing";
// import { ListingCard } from "@/components/ListingCard";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";

// async function getStoreData(sellerId: string) {
//   await dbConnect();

//   // Fetch Business and User data in parallel
//   const [business, user, listings] = await Promise.all([
//     Business.findOne({ owner: sellerId }).lean(),
//     User.findById(sellerId).select("-password").lean(),
//     Listing.find({ seller: sellerId, status: "active" })
//       .sort({ createdAt: -1 })
//       .lean(),
//   ]);

//   if (!user) {
//     return null;
//   }

//   // Parse JSON to avoid serialization issues with MongoDB objects
//   return {
//     business: business ? JSON.parse(JSON.stringify(business)) : null,
//     user: JSON.parse(JSON.stringify(user)),
//     listings: JSON.parse(JSON.stringify(listings)),
//   };
// }

// export default async function StorePage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   // Use await params (Next.js 15+ requirement if params is a promise,
//   // currently params is usually synchronous in 13/14 but safe to handle)
//   // Actually, in the latest Next.js versions params is just an object.
//   // However, I see "await params" usage in previous user edit in review route.
//   // I'll stick to direct access for now, but be mindful.

//   const { id } = await params;
//   const data = await getStoreData(id);

//   if (!data) {
//     notFound();
//   }

//   const { business, user, listings } = data;

//   // Determine display name and image
//   const displayName = business?.name || user.name;
//   const displayImage = business?.image || user.image; // Use business logo if available, else user avatar
//   const description =
//     business?.description || `Welcome to ${user.name}'s store!`;

//   return (
//     <div className="container mx-auto py-8 px-4">
//       {/* Header Section */}
//       <div className="mb-10">
//         <Card className="overflow-hidden border-none shadow-md bg-gradient-to-b from-muted/50 to-background">
//           <CardContent className="p-8">
//             <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
//               {/* Avatar / Logo */}
//               <div className="relative group">
//                 <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
//                   <AvatarImage src={displayImage} className="object-cover" />
//                   <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
//                     {displayName.charAt(0).toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//               </div>

//               {/* Info */}
//               <div className="flex-1 text-center md:text-left space-y-4">
//                 <div>
//                   <h1 className="text-3xl font-bold">{displayName}</h1>
//                   {business?.type && (
//                     <Badge variant="secondary" className="mt-2">
//                       {business.type}
//                     </Badge>
//                   )}
//                   <p className="text-muted-foreground mt-2 max-w-2xl">
//                     {description}
//                   </p>
//                 </div>

//                 {/* Details Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
//                   {business?.address && (
//                     <div className="flex items-center justify-center md:justify-start gap-2">
//                       <MapPin className="h-4 w-4" />
//                       <span>{business.address}</span>
//                     </div>
//                   )}
//                   {business?.businessHours && (
//                     <div className="flex items-center justify-center md:justify-start gap-2">
//                       <Clock className="h-4 w-4" />
//                       <span>{business.businessHours}</span>
//                     </div>
//                   )}
//                   {business?.email && (
//                     <div className="flex items-center justify-center md:justify-start gap-2">
//                       <Mail className="h-4 w-4" />
//                       <span>{business.email}</span>
//                     </div>
//                   )}
//                   {business?.phone && (
//                     <div className="flex items-center justify-center md:justify-start gap-2">
//                       <Phone className="h-4 w-4" />
//                       <span>{business.phone}</span>
//                     </div>
//                   )}
//                   <div className="flex items-center justify-center md:justify-start gap-2">
//                     <Calendar className="h-4 w-4" />
//                     <span>
//                       Joined {new Date(user.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Socials */}
//                 {business?.socials && business.socials.length > 0 && (
//                   <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
//                     {business.socials.map((social: any, idx: number) => (
//                       <a
//                         key={idx}
//                         href={social.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-muted-foreground hover:text-primary transition-colors"
//                       >
//                         <Globe className="h-5 w-5" />
//                       </a>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Actions (Future: Follow, Message) */}
//               {/* <div className="flex gap-2">
//                  <Button>Message</Button>
//               </div> */}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Separator className="my-8" />

//       {/* Listings Grid */}
//       <div>
//         <h2 className="text-2xl font-semibold mb-6">
//           Active Listings ({listings.length})
//         </h2>

//         {listings.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {listings.map((listing: any) => (
//               <ListingCard
//                 key={listing._id}
//                 id={listing._id}
//                 title={listing.title}
//                 price={listing.price}
//                 image={listing.images?.[0]}
//                 category={listing.category}
//                 condition={listing.condition}
//                 location={listing.location}
//                 createdAt={listing.createdAt}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-20 bg-muted/30 rounded-lg">
//             <p className="text-muted-foreground text-lg">
//               No active listings yet.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Globe,
  Clock,
  Mail,
  Phone,
  Calendar,
  Star,
  ShoppingBag,
  Award,
  MessageCircle,
  ArrowLeft,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import Listing from "@/models/Listing";
import Review from "@/models/Review";
import { ListingCard } from "@/components/ListingCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getStoreData(sellerId: string) {
  await dbConnect();
  const [business, user, listings, reviews] = await Promise.all([
    Business.findOne({ owner: sellerId }).lean(),
    User.findById(sellerId).select("-password").lean(),
    Listing.find({ seller: sellerId, status: "active" })
      .sort({ createdAt: -1 })
      .lean(),
    Review.find({ reviewee: sellerId })
      .populate("reviewer", "name image")
      .populate("listing", "title")
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  if (!user) return null;
  return {
    business: business ? JSON.parse(JSON.stringify(business)) : null,
    user: JSON.parse(JSON.stringify(user)),
    listings: JSON.parse(JSON.stringify(listings)),
    reviews: JSON.parse(JSON.stringify(reviews)),
  };
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const s = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${s} ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const data = await getStoreData(id);
  if (!data) notFound();

  const { business, user, listings, reviews } = data;

  const displayName = business?.name || user.name;
  const displayImage = business?.image || user.image;
  const description =
    business?.description || `Welcome to ${user.name}'s store on TradeZone.`;

  // Review stats
  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
      reviews.length
    : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r: any) => r.rating === star).length /
            reviews.length) *
            100,
        )
      : 0,
  }));

  const isOwnStore = session?.user?.id === id;

  return (
    <div className="min-h-screen bg-background">
      <div>
        {/* Store header */}
        <div className="border-b bg-muted/20">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link
              href="/browse"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Browse
            </Link>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg shrink-0">
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
                {displayImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="h-full w-full object-cover rounded-full"
                  />
                )}
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-start gap-3">
                  <div>
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {business?.type && (
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {business.type}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        {listings.length} active listing
                        {listings.length !== 1 ? "s" : ""}
                      </Badge>
                      {reviews.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={Math.round(avgRating)} />
                          <span className="text-sm font-semibold">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({reviews.length} review
                            {reviews.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  {business?.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {business.address}
                    </span>
                  )}
                  {business?.businessHours && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {business.businessHours}
                    </span>
                  )}
                  {business?.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {business.email}
                    </a>
                  )}
                  {business?.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {business.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Socials */}
                {business?.socials?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {business.socials.map((s: any, i: number) => (
                      <a
                        key={i}
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border hover:bg-muted transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="capitalize">{s.name}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isOwnStore && session && (
                <Link
                  href={`/messages?seller=${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium hover:bg-muted transition-colors shrink-0"
                >
                  <MessageCircle className="h-4 w-4" /> Message
                </Link>
              )}
            </div>

            {/* Business extras */}
            {(business?.categories?.length > 0 ||
              business?.certifications?.length > 0 ||
              business?.bankDetails?.length > 0) && (
              <div className="mt-6 pt-5 border-t flex flex-wrap gap-6">
                {business?.categories?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      Specialises in
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {business.categories.map((cat: string) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {business?.certifications?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {business.certifications.map(
                        (cert: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs text-yellow-600"
                          >
                            <Award className="h-3 w-3" />
                            {cert}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {business?.bankDetails?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                      Payment
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {business.bankDetails.map((b: any, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full"
                        >
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          {b.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Listings — 2 cols */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Active Listings
                <span className="text-sm font-normal text-muted-foreground">
                  ({listings.length})
                </span>
              </h2>

              {listings.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl text-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="font-medium text-sm">No active listings</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This seller hasn't posted any listings yet.
                  </p>
                </div>
              )}
            </div>

            {/* Reviews sidebar */}
            <div className="space-y-5">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                Reviews
                <span className="text-sm font-normal text-muted-foreground">
                  ({reviews.length})
                </span>
              </h2>

              {reviews.length > 0 ? (
                <>
                  {/* Rating summary */}
                  <div className="rounded-2xl border bg-card p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-4xl font-extrabold">
                          {avgRating.toFixed(1)}
                        </p>
                        <StarRating rating={Math.round(avgRating)} size="lg" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingBreakdown.map(({ star, count, pct }) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-3">
                              {star}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-5">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="space-y-3">
                    {reviews.map((review: any) => (
                      <div
                        key={review._id}
                        className="rounded-2xl border bg-card p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {review.reviewer?.name?.charAt(0)}
                              </AvatarFallback>
                              {review.reviewer?.image && (
                                <img
                                  src={review.reviewer.image}
                                  alt=""
                                  className="h-full w-full object-cover rounded-full"
                                />
                              )}
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold leading-none">
                                {review.reviewer?.name || "User"}
                              </p>
                              {review.listing?.title && (
                                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                                  re: {review.listing.title}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <StarRating rating={review.rating} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-NG",
                                { dateStyle: "medium" },
                              )}
                            </p>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        )}

                        {/* Seller response */}
                        {review.response && (
                          <div className="mt-2 pl-3 border-l-2 border-primary/30">
                            <p className="text-xs font-semibold text-primary mb-0.5">
                              Seller's response
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {review.response}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl text-center">
                  <Star className="h-7 w-7 text-muted-foreground mb-2" />
                  <p className="font-medium text-sm">No reviews yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Be the first to leave a review.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
