import Link from "next/link";
import {
  Search,
  ShoppingBag,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Category from "@/models/Category";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import { FloatingPaths } from "@/components/ui/background-paths";

async function getRecentListings() {
  await dbConnect();
  const listings = await Item.find({ isListed: true, "listing.status": "active" })
    .sort({ createdAt: -1 })
    .limit(12) // Show slightly more on the dedicated home page
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

async function getCategories() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function MarketHome() {
  const recentListings = await getRecentListings();
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden border-b">
        {/* Animated background paths */}
        <div className="absolute inset-0 z-10 opacity-40">
          {/* <FloatingPaths position={1} /> */}
          {/* <FloatingPaths position={-1} /> */}
        </div>
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-background via-emerald-950/5 to-background pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center max-w-4xl pt-8">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm text-xs font-bold mb-8 text-emerald-700 dark:text-emerald-400 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
            <ShoppingBag className="w-4 h-4 mr-2" />
            The FindMaster Marketplace
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Shop Verified. <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500">
              Trade Confidently.
            </span>
          </h1>

          <p className="text-lg md:text-xl font-medium text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Buy and sell secure, verified property with peace of mind. Every
            item is backed by our central registry to ensure you are buying
            safe, non-stolen goods.
          </p>

          <div className="max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="p-2 sm:p-4 rounded-3xl border border-emerald-500/20 bg-background/50 backdrop-blur-xl shadow-2xl">
              <HomeSearchBar />
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-4 items-center">
              <span className="font-semibold text-foreground">
                Popular right now:
              </span>
              {["iPhone 15", "Toyota Camry", "MacBook Pro", "Generator"].map(
                (term) => (
                  <Link
                    key={term}
                    href={`/browse?q=${term}`}
                    className="hover:text-emerald-500 font-medium transition-colors border-b border-dashed border-emerald-500/30 hover:border-emerald-500"
                  >
                    {term}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Zone */}
      <section className="py-16 bg-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Explore Categories
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">
                Find exactly what you are looking for.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full"
            >
              <Link href="/categories">View All Categories</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(categories.length > 12
              ? categories.slice(0, 12)
              : categories
            ).map((cat: any) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group"
              >
                <div className="h-full bg-background hover:bg-emerald-500/5 border hover:border-emerald-500/50 transition-all p-5 rounded-2xl shadow-sm hover:shadow-lg text-center group-hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl bg-muted group-hover:bg-emerald-500/10 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300 shadow-sm border border-transparent group-hover:border-emerald-500/20">
                    {cat.icon || "📦"}
                  </div>
                  <span className="font-semibold block text-sm group-hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh on the Market */}
      <section className="py-16 md:py-24 bg-background relative border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Fresh on the Market
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
                Recently added listings from our trusted sellers.
              </p>
            </div>
            <Button
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
              size="sm"
              asChild
            >
              <Link href="/browse">
                Browse All Listings <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {recentListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {recentListings.map((listing: any) => (
                <ListingCard
                  key={listing._id}
                  id={listing._id}
                  title={listing.listing?.title || listing.model}
                  price={listing.listing?.price}
                  image={listing.images[0]}
                  category={listing.listing?.category}
                  condition={listing.listing?.condition}
                  location={listing.listing?.location}
                  createdAt={listing.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-muted rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-emerald-500/20 text-emerald-600">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="text-xl font-bold tracking-tight">
                No active listings yet
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Be the first to create a listing in our marketplace!
              </p>
              <Button
                size="default"
                asChild
                className="px-6 rounded-full font-semibold bg-emerald-600 hover:bg-emerald-700"
              >
                <Link href="/listings/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Post an Ad
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-emerald-950 text-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

        {/* Subtle decorative glows border */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              How the Marketplace Works
            </h2>
            <p className="text-emerald-100/80 text-lg font-medium">
              It's incredibly simple to start trading safely within the
              FindMaster ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-10 text-center md:text-left">
            <div className="space-y-4 bg-black/20 p-6 rounded-3xl transition-colors border border-emerald-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 md:mx-0 mx-auto shadow-inner border border-emerald-500/30">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Find Your Item
              </h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed font-medium">
                Browse our categories or use powerful search capabilities to
                find the gadget or vehicle you're looking for locally.
              </p>
            </div>
            <div className="space-y-4 bg-black/20 p-6 rounded-3xl transition-colors border border-emerald-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 md:mx-0 mx-auto shadow-inner border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Verify its Clean
              </h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed font-medium">
                Request the IMEI or Serial number. Check it against the
                FindMaster Registry to ensure the property is fully legit.
              </p>
            </div>
            <div className="space-y-4 bg-black/20 p-6 rounded-3xl transition-colors border border-emerald-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 md:mx-0 mx-auto shadow-inner border border-emerald-500/30">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Trade Safely
              </h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed font-medium">
                Connect securely, meet safely, and once purchased, complete the
                digital ownership transfer in the registry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
