import Link from "next/link";
import { ArrowRight, Search, Zap, ShieldCheck, Globe } from "lucide-react";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function getRecentListings() {
  await dbConnect();
  const listings = await Listing.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

import Category from "@/models/Category";
import { HomeSearchBar } from "@/components/HomeSearchBar";

async function getCategories() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function Home() {
  const recentListings = await getRecentListings();
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 py-10 md:py-18 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-background -z-20" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full border bg-background/50 backdrop-blur-sm text-sm font-medium mb-6 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            The #1 Marketplace for verified sellers
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Buy & Sell <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-indigo-600">
              Without Limits.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-5 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Join the community of creators and collectors. Discover unique items, connect with verified sellers, and trade safely.
          </p>


                                
  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
       <HomeSearchBar />
     </div>

          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-in fade-in zoom-in duration-1000 delay-500">
            <span className="font-semibold text-foreground">Trending:</span>
            {['iPhone 15', 'PlayStation 5', 'Vintage Camera', 'MacBook Pro'].map((term) => (
              <Link key={term} href={`/browse?q=${term}`} className="hover:text-primary transition-colors border-b border-dashed border-muted-foreground/50 hover:border-primary">
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Explore Categories</h2>
              <p className="text-muted-foreground">Find exactly what you need.</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/categories">View All Categories</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link key={cat._id} href={`/browse?category=${cat.name}`} className="group">
                <div className="h-full bg-card hover:bg-background border border-transparent hover:border-border transition-all p-6 rounded-2xl shadow-sm hover:shadow-md text-center group-hover:-translate-y-1 duration-300">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform`}>
                    {cat.icon || '📦'}
                  </div>
                  <span className="font-semibold text-foreground/80 group-hover:text-foreground">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">Fresh on the Market</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Don't miss out on the latest listings added by our community today.</p>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {recentListings.map((listing: any) => (
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
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-3xl bg-muted/10">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No active listings yet</p>
            <p className="text-muted-foreground mb-6">Be the first to create a listing!</p>
            <Button size="lg" asChild>
              <Link href="/listings/create">Post an Ad</Link>
            </Button>
          </div>
        )}

        <div className="mt-16 text-center">
          <Button variant="outline" size="lg" className="rounded-full px-8 border-primary/20 hover:border-primary/50" asChild>
            <Link href="/browse">View All Listings</Link>
          </Button>
        </div>
      </section>

      {/* Features / Trust Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Fast & Easy</h3>
              <p className="text-primary-foreground/80 leading-relaxed">List your items in seconds and connect with buyers instantly. No complicated forms or hidden fees.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Secure Transactions</h3>
              <p className="text-primary-foreground/80 leading-relaxed">Our verified user system and safety guidelines ensure you can trade with confidence and peace of mind.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 text-white">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Local Community</h3>
              <p className="text-primary-foreground/80 leading-relaxed">Support your local economy by buying from neighbors. Reduce waste and find hidden gems nearby.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
