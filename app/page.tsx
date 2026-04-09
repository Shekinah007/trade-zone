import Link from "next/link";
import {
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  Globe,
  Shield,
  AlertTriangle,
  ArrowLeftRight,
  Smartphone,
  Car,
  Laptop,
  Cpu,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import Category from "@/models/Category";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import { RegistrySearchBar } from "@/components/RegistrySearchBar";
import { FloatingPaths } from "@/components/ui/background-paths";

async function getRecentListings() {
  await dbConnect();
  const listings = await Listing.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

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
      <section className="relative px-4 py-10 md:py-16 overflow-hidden border-b pb-16 md:pb-24">
        {/* Animated background paths */}
        <div className="absolute inset-0 z-10 opacity-30">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full border bg-background/80 backdrop-blur-sm text-xs font-semibold mb-6 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            Africa&apos;s #1 Property Security Marketplace
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Secure. Verify. <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500">
              Trade Safely.
            </span>
          </h1>

          <p className="text-lg md:text-xl font-medium text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Register your devices in Africa&apos;s trusted property registry, and buy or sell with full confidence.
          </p>

          {/* Dual Search Cards */}
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {/* Marketplace Card */}
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-card to-emerald-900/10 backdrop-blur-2xl p-5 md:p-6 text-left space-y-3 shadow-[0_0_30px_-15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Marketplace</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      Buy &amp; sell verified items
                    </p>
                  </div>
                </div>
                <HomeSearchBar />
                <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs md:text-sm text-muted-foreground pt-2 items-center">
                  <span className="font-semibold text-foreground">Popular:</span>
                  {["iPhone 15", "HP Elitebook", "MacBook Pro"].map((term) => (
                    <Link
                      key={term}
                      href={`/browse?q=${term}`}
                      className="hover:text-emerald-500 font-medium transition-colors border-b border-dashed border-emerald-500/30 hover:border-emerald-500"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Registry Card */}
            <div className="rounded-3xl border-2 border-blue-500/30 bg-gradient-to-b from-card to-blue-900/10 backdrop-blur-2xl p-5 md:p-6 text-left space-y-3 shadow-[0_0_30px_-15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_-15px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Property Registry</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      Verify ownership before buying
                    </p>
                  </div>
                </div>
                <RegistrySearchBar />
                <p className="text-xs md:text-sm font-medium text-muted-foreground pt-2 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Search by IMEI, Serial, or Chassis Number to check for stolen flags.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visually distinct Marketplace and Registry How-It-Works section */}
      <section className="py-16 bg-card/50 relative overflow-hidden">
        {/* Decorative background for the section */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 dark:opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-500/5 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 dark:opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Platform Architecture</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Two Platforms. <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">One Mission.</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto font-medium">
              FindMaster seamlessly integrates a secure property registry with a dynamic marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Marketplace Path */}
            <div className="bg-background rounded-3xl p-6 md:p-8 border border-emerald-500/10 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[80px] -z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-500/10" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm border border-emerald-500/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">The Marketplace</h3>
                  <p className="text-muted-foreground text-xs font-medium mt-1">For buying & selling</p>
                </div>
              </div>
              <div className="space-y-6 flex-1">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center font-bold shadow-sm text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-base">Browse or Sell</h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">Explore listings across categories or post your own devices and vehicles in seconds.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center font-bold shadow-sm text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-base">Connect Securely</h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">Chat securely with buyers or sellers on our platform to arrange a deal and inspection.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-muted/60">
                <Button asChild className="w-full sm:w-auto font-semibold h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700" size="default">
                  <Link href="/browse">Explore Marketplace <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>

            {/* Registry Path */}
            <div className="bg-blue-950/5 rounded-3xl p-6 md:p-8 border border-blue-500/20 flex flex-col h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-[80px] -z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500/20" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950 dark:text-blue-100 tracking-tight">Property Registry</h3>
                  <p className="text-blue-900/60 dark:text-blue-200/60 text-xs font-medium mt-1">For safety & verification</p>
                </div>
              </div>
              <div className="space-y-6 flex-1 relative z-10">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex justify-center items-center font-bold shadow-sm text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-base text-blue-950 dark:text-blue-100">Register &amp; Claim</h4>
                    <p className="text-blue-900/70 dark:text-blue-200/70 mt-1 text-sm leading-relaxed">Add your valuables using IMEI or Serial number to establish your proof of ownership.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex justify-center items-center font-bold shadow-sm text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-base text-blue-950 dark:text-blue-100">Verify &amp; Transfer</h4>
                    <p className="text-blue-900/70 dark:text-blue-200/70 mt-1 text-sm leading-relaxed">Check items before buying to avoid stolen goods, and transfer ownership digitally when selling.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-blue-500/20 relative z-10">
                <Button asChild className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold h-10 rounded-lg" size="default">
                  <Link href="/registry">Open Registry <Shield className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Marketplace Zone */}
      <section className="py-16 bg-muted/40 border-t relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-xs mb-4 tracking-widest uppercase shadow-sm">
              The Marketplace
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Start Shopping Now
            </h2>
          </div>

          <div className="mb-14">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Top Categories</h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Browse verified listings securely.</p>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link href="/categories">View All Categories</Link>
              </Button>
            </div>
            {/* Show only 4 or 8 categories on the home page */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(categories.length > 8 ? categories.slice(0, 8) : categories).map((cat: any) => (
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

          <div>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Fresh on the Market</h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Recently added trusted listings.</p>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link href="/browse">Browse All Listings</Link>
              </Button>
            </div>
            
            {recentListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-muted rounded-3xl bg-background/50">
                <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold tracking-tight">No active listings yet</p>
                <p className="text-sm text-muted-foreground mb-6">Be the first to create a listing!</p>
                <Button size="default" asChild className="px-6 rounded-full font-semibold">
                  <Link href="/listings/create">Post an Ad</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />
        
        {/* Subtle decorative glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full blur-[100px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-[100px] opacity-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built on Trust and Verification</h2>
            <p className="text-primary-foreground/80 text-lg font-medium">We&apos;re fundamentally changing how used goods are bought and sold by making safety the ultimate priority.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10 text-center md:text-left">
            <div className="space-y-4 bg-black/5 hover:bg-black/10 p-6 rounded-2xl transition-colors border border-white/5">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white md:mx-0 mx-auto shadow-inner border border-white/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Fast &amp; Easy</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed font-medium">
                List your items in seconds and register property in under 2 minutes. No complicated forms or hidden fees.
              </p>
            </div>
            <div className="space-y-4 bg-black/5 hover:bg-black/10 p-6 rounded-2xl transition-colors border border-white/5">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white md:mx-0 mx-auto shadow-inner border border-white/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Verified &amp; Secure</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed font-medium">
                Our property registry, verified user system, and safety guidelines ensure you always trade with confidence.
              </p>
            </div>
            <div className="space-y-4 bg-black/5 hover:bg-black/10 p-6 rounded-2xl transition-colors border border-white/5">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white md:mx-0 mx-auto shadow-inner border border-white/20">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Local Community</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed font-medium">
                Support your local economy by buying from neighbors. Reduce waste, find hidden gems, and reduce crime nearby.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
