import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Metadata } from "next";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import {
  MapPin,
  Share2,
  ShieldCheck,
  Flag,
  Calendar,
  Eye,
  Shield,
  ExternalLink,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await dbConnect();
    const item = await Item.findById(id).lean();
    if (!item || !item.isListed) return {};

    const title = item.listing?.title || `${item.brand} ${item.model}`;
    const priceStr = item.listing?.price != null ? `₦${item.listing.price.toLocaleString()}` : "Price on request";
    const desc = `${item.listing?.condition || "Used"} ${title} for sale${item.listing?.location?.city ? ` in ${item.listing.location.city}` : ""}. Verified listing on FindMaster.`;

    const images = item.images && item.images.length > 0 ? item.images : [];

    return {
      title: `Buy ${title} for ${priceStr} — FindMaster`,
      description: desc,
      alternates: { canonical: `/listings/${id}` },
      openGraph: {
        title: `Buy ${title} for ${priceStr} — FindMaster`,
        description: desc,
        url: `/listings/${id}`,
        type: "website",
        images: images.map((url: string) => ({ url })),
      },
      twitter: {
        card: "summary_large_image",
        title: `Buy ${title} for ${priceStr}`,
        description: desc,
        images: images,
      },
    };
  } catch (e) {
    return {};
  }
}
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import "@/models/User"; // Ensure User model is registered
import "@/models/Category";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListingActions, ReportButton } from "@/components/ListingActions";
import { SellerRating } from "@/components/SellerRating";
import { SellerListingPanel } from "@/components/SellerListingPanel";
import { RecommendedItems } from "@/components/RecommendedItems";
import { ListingImageGallery } from "@/components/ListingImageGallery";

import Transaction from "@/models/Transaction";
import Conversation from "@/models/Conversation";
import Business from "@/models/Business";
import { ViewTracker } from "@/components/ViewTracker";

async function getListing(id: string) {
  try {
    await dbConnect();

    const listing = await Item.findById(id)
      .populate("owner")
      .populate("seller")
      .populate("listing.category")
      .lean();
    if (!listing || !listing.isListed) return null;

    const sellerOrOwnerId = listing.seller?._id || listing.owner?._id;

    const business = await Business.findOne({
      owner: sellerOrOwnerId,
    }).lean();

    // Fetch History
    const history = await Transaction.find({ item: id })
      .populate("buyer", "name image")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch conversation count for the item
    const conversationCount = await Conversation.countDocuments({ item: id });

    return {
      ...JSON.parse(JSON.stringify(listing)),
      history: JSON.parse(JSON.stringify(history)),
      business: JSON.parse(JSON.stringify(business)),
      conversationCount,
    };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const [listing, session] = await Promise.all([
    getListing(id),
    getServerSession(authOptions),
  ]);

  if (!listing) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
  }).format(listing.listing?.price || 0);

  const sellerId =
    listing.seller?._id?.toString() || listing.owner?._id?.toString();
  const isOwner = session?.user?.id === sellerId;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: listing.listing?.title || `${listing.brand} ${listing.model}`,
              image: listing.images && listing.images.length > 0 ? listing.images : undefined,
              description: listing.description?.replace(/<[^>]*>?/gm, ''),
              itemCondition: listing.listing?.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
              offers: {
                "@type": "Offer",
                url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://findmaster.org"}/listings/${listing._id}`,
                priceCurrency: "NGN",
                price: listing.listing?.price,
                availability: listing.listing?.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://findmaster.org"}`
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Browse",
                  item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://findmaster.org"}/browse`
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: listing.listing?.title || `${listing.brand} ${listing.model}`
                }
              ]
            }
          ])
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images */}
        <div className="lg:col-span-2 space-y-6">
          <ListingImageGallery
            images={listing.images}
            altText={listing.listing?.title || listing.model || "Listing image"}
          />

          <div className="rounded-md shadow  pb-4 bg-white">
            <div className="bg-green-100 mt-4 px-4 py-4 rounded-t-md">
              <CardTitle>Description</CardTitle>
            </div>
            <CardContent className="pt-3">
              <div
                className="leading-relaxed tiptap-content"
                dangerouslySetInnerHTML={{ __html: listing.description || "" }}
              />
            </CardContent>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Condition:
                  </span>
                  <span className="ml-2">{listing.listing?.condition}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Category:
                  </span>
                  <span className="ml-2">
                    {listing.listing?.category?.name || "Uncategorized"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Posted:
                  </span>
                  <span className="ml-2">
                    {formatDistanceToNow(new Date(listing.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex flex-row gap-2 items-center text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="font-semibold">
                    {listing.listing?.views || 0} views
                  </span>
                  <ViewTracker listingId={listing._id} />
                </div>
                {listing.uniqueIdentifier && (
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-muted-foreground">
                        Serial / Unique ID:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-mono select-all border border-border/50">
                          ••••••••••••••
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registry Record Card */}
          {listing.isRegistered && (
            <Card className="border border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                  Registered Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {listing.brand && (
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs mb-0.5">
                        Brand
                      </span>
                      <span>{listing.brand}</span>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs mb-0.5">
                        Model
                      </span>
                      <span>{listing.model}</span>
                    </div>
                  )}
                  {listing.color && (
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs mb-0.5">
                        Color
                      </span>
                      <span>{listing.color}</span>
                    </div>
                  )}
                  {listing.registry?.yearOfPurchase && (
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs mb-0.5">
                        Year
                      </span>
                      <span>{listing.registry.yearOfPurchase}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-semibold text-muted-foreground block text-xs mb-0.5">
                      Registry Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        listing.ownershipStatus === "owned"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : listing.ownershipStatus === "missing"
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : listing.ownershipStatus === "found"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {listing.ownershipStatus
                        ? listing.ownershipStatus.charAt(0).toUpperCase() +
                          listing.ownershipStatus.slice(1)
                        : "Unknown"}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/registry/${listing._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Full Registry Record
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Price, Seller, Actions */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/10">
            <CardContent className="p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold leading-tight mb-2">
                  {listing.listing?.title || listing.model}
                </h1>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">
                    {formattedPrice}
                  </span>
                  <Badge variant="outline">{listing.listing?.condition}</Badge>
                </div>
              </div>

              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.listing?.location?.city},{" "}
                {listing.listing?.location?.country}
              </div>

              <div className="space-y-3">
                <ListingActions
                  listingId={listing._id}
                  sellerId={listing.seller?._id || listing.owner?._id}
                  listingTitle={listing.listing?.title || listing.model}
                  price={listing.listing?.price || 0}
                  history={listing.history}
                  status={listing.listing?.status}
                  sellerPhone={listing.business?.phone || ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Seller Management Panel (only visible to the seller) ── */}
          <SellerListingPanel
            listing={listing}
            conversationCount={listing.conversationCount}
          />

          {/* ── Public Seller Info (hidden from seller themselves) ── */}
          {!isOwner && (
            <Card className="gap-1">
              <CardHeader className="">
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  href={`/store/${listing.seller?._id || listing.owner?._id}`}
                  className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
                >
                  <Avatar className="h-12 w-12 group-hover:ring-2 ring-primary/20 transition-all">
                    <AvatarImage
                      src={(listing.seller || listing.owner)?.image}
                    />
                    <AvatarFallback>
                      {(listing.seller || listing.owner)?.name?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {(listing.seller || listing.owner)?.name ||
                        "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Member since{" "}
                      {new Date(
                        (listing.seller || listing.owner)?.createdAt ||
                          new Date(),
                      ).getFullYear()}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                  <span>Verified Email</span>
                </div>

                <div className="pt-2 border-t mt-2">
                  <SellerRating
                    sellerId={listing.seller?._id || listing.owner?._id}
                  />
                </div>

                <ReportButton listingId={listing._id} />
              </CardContent>
            </Card>
          )}

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

      <RecommendedItems
        categoryId={listing.listing?.category?._id?.toString()}
        currentListingId={listing._id?.toString()}
      />
    </div>
  );
}
