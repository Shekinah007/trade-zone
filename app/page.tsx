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
  Star,
  ChevronRight,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import Category from "@/models/Category";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import { RegistrySearchBar } from "@/components/RegistrySearchBar";
import { FloatingPaths } from "@/components/ui/background-paths";

async function getRecentListings() {
  await dbConnect();
  const listings = await Item.find({ isListed: true, "listing.status": "active" })
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
        <div
          className="absolute inset-0 z-10 opacity-30"
          style={{
            contain: "strict",
            willChange: "opacity",
            transform: "translateZ(0)",
          }}
        >
          <FloatingPaths position={1} />
          {/* <FloatingPaths position={-1} /> */}
        </div>
        {/* Subtle linear overlay */}
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-background via-background/90 to-background pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full border bg-background/80 backdrop-blur-sm text-xs font-semibold mb-6 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            Africa&apos;s #1 Property Security Marketplace
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-linear-to-r from-red-500  to-emerald-500 tracking-tight mb-4 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Secure. Verify. <br className="hidden md:block" />
            <span className="">Trade Safely.</span>
          </h1>

          <p className="text-lg md:text-xl font-medium text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Register your devices in Africa&apos;s trusted property registry,
            and buy or sell with full confidence.
          </p>

          {/* Dual Search Cards */}
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {/* Marketplace Card */}
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-linear-to-b from-card to-emerald-900/10 backdrop-blur-2xl p-5 md:p-6 text-left space-y-3 shadow-[0_0_30px_-15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Marketplace
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      Buy &amp; sell verified items
                    </p>
                  </div>
                </div>
                <HomeSearchBar />
                <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs md:text-sm text-muted-foreground pt-2 items-center">
                  <span className="font-semibold text-foreground">
                    Popular:
                  </span>
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
            <div className="rounded-3xl border-2 border-red-500/30 bg-linear-to-b from-card to-red-900/10 backdrop-blur-2xl p-5 md:p-6 text-left space-y-3 shadow-[0_0_30px_-15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_-15px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Property Registry
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      Verify ownership before buying
                    </p>
                  </div>
                </div>
                <RegistrySearchBar />
                <p className="text-xs md:text-sm font-medium text-muted-foreground pt-2 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    Search by IMEI, Serial, or Chassis Number to check for
                    stolen flags.
                  </span>
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
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-red-500/5 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 dark:opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
              Platform Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Two Platforms.{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-red-600">
                One Mission.
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto font-medium">
              FindMaster seamlessly integrates a secure property registry with a
              dynamic marketplace.
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
                  <h3 className="text-xl font-bold tracking-tight">
                    The Marketplace
                  </h3>
                  <p className="text-muted-foreground text-xs font-medium mt-1">
                    For buying & selling
                  </p>
                </div>
              </div>
              <div className="space-y-6 flex-1">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center font-bold shadow-sm text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">Browse or Sell</h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      Explore listings across categories or post your own
                      devices and vehicles in seconds.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center font-bold shadow-sm text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">
                      Connect Securely
                    </h4>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      Chat securely with buyers or sellers on our platform to
                      arrange a deal and inspection.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-muted/60">
                <Button
                  asChild
                  className="w-full sm:w-auto font-semibold h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  size="default"
                >
                  <Link href="/browse">
                    Explore Marketplace <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Registry Path */}
            <div className="bg-red-950/5 rounded-3xl p-6 md:p-8 border border-red-500/20 flex flex-col h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-[80px] -z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-red-500/20" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm border border-red-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-950 dark:text-red-100 tracking-tight">
                    Property Registry
                  </h3>
                  <p className="text-red-900/60 dark:text-red-200/60 text-xs font-medium mt-1">
                    For safety & verification
                  </p>
                </div>
              </div>
              <div className="space-y-6 flex-1 relative z-10">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex justify-center items-center font-bold shadow-sm text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-red-950 dark:text-red-100">
                      Register &amp; Claim
                    </h4>
                    <p className="text-red-900/70 dark:text-red-200/70 mt-1 text-sm leading-relaxed">
                      Add your valuables using IMEI or Serial number to
                      establish your proof of ownership.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex justify-center items-center font-bold shadow-sm text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-red-950 dark:text-red-100">
                      Verify &amp; Transfer
                    </h4>
                    <p className="text-red-900/70 dark:text-red-200/70 mt-1 text-sm leading-relaxed">
                      Check items before buying to avoid stolen goods, and
                      transfer ownership digitally when selling.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-red-500/20 relative z-10">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold h-10 rounded-lg"
                  size="default"
                >
                  <Link href="/registry">
                    Open Registry <Shield className="w-4 h-4 ml-2" />
                  </Link>
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
                <h3 className="text-xl font-bold tracking-tight">
                  Top Categories
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  Browse verified listings securely.
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
            {/* Show only 4 or 8 categories on the home page */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(categories.length > 8
                ? categories.slice(0, 8)
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

          <div>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  Fresh on the Market
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  Recently added trusted listings.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href="/browse">Browse All Listings</Link>
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
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-muted rounded-3xl bg-background/50">
                <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold tracking-tight">
                  No active listings yet
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Be the first to create a listing!
                </p>
                <Button
                  size="default"
                  asChild
                  className="px-6 rounded-full font-semibold"
                >
                  <Link href="/listings/create">Post an Ad</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Trust Section - Complete Redesign */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#0a0101]">
        {/* Dynamic background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-linear(ellipse_at_top_right,_var(--tw-linear-stops))] from-red-900/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-linear(ellipse_at_bottom_left,_var(--tw-linear-stops))] from-emerald-900/30 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        </div>

        {/* Geometric decoration */}
        <div className="absolute top-10 right-10 w-32 h-32 border border-red-500/10 rounded-full" />
        <div className="absolute top-20 right-20 w-16 h-16 border border-red-500/20 rounded-full" />
        <div className="absolute bottom-10 left-10 w-40 h-40 border border-emerald-500/10 rounded-full" />
        <div className="absolute bottom-20 left-20 w-20 h-20 border border-emerald-500/20 rounded-full" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-red-500/10 via-transparent to-emerald-500/10 border border-red-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium bg-linear-to-r from-red-400 to-emerald-400 bg-clip-text text-transparent">
                Trust & Safety First
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-500" />
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-white">Reimagining </span>
              <span className="bg-linear-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
                Safe Trading
              </span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              We're building a marketplace where trust isn't just a feature—it's
              the foundation. Every transaction protected, every item verified.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-3 gap-1 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="group relative p-8 md:p-10 bg-linear-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20 group-hover:border-red-500/40 transition-colors">
                      <Zap className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping group-hover:animate-none" />
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-red-500/20 to-transparent" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Lightning Fast
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  List items in seconds. Our streamlined process gets you from
                  registration to listing faster than ever before.
                </p>

                <Link
                  href="/faq"
                  className="mt-6 flex items-center gap-2 text-sm text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                >
                  <span className="font-medium">Learn more</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2 - Center (slightly elevated) */}
            <div className="group relative p-8 md:p-10 bg-linear-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all duration-500 md:-mt-4 md:-mb-4 md:shadow-2xl md:shadow-black/50">
              <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
                  <div className="absolute top-4 right-4 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                    PREMIUM
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Verified & Secure
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Every user verified, every item tracked. Our registry system
                  ensures you're always trading with confidence.
                </p>

                <Link
                  href="/safety"
                  className="mt-6 flex items-center gap-2 text-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                >
                  <span className="font-medium">Explore security</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 md:p-10 bg-linear-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-emerald-500/20 to-transparent" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Community First
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Support your neighbors, reduce waste, and build a safer local
                  economy. Together we create lasting change.
                </p>

                <Link
                  href="/auth/signup"
                  className="mt-6 flex items-center gap-2 text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                >
                  <span className="font-medium">Join community</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="max-w-4xl mx-auto mt-16 md:mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                  50K+
                </div>
                <div className="text-sm text-zinc-500">Registered Items</div>
              </div>
              <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  10K+
                </div>
                <div className="text-sm text-zinc-500">Verified Users</div>
              </div>
              <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-sm text-zinc-500">Safe Transactions</div>
              </div>
              <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  200+
                </div>
                <div className="text-sm text-zinc-500">Cities Covered</div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-zinc-500 mb-4 text-sm">
              Join thousands of satisfied users
            </p>
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-red-500 fill-red-500" />
              ))}
              <span className="text-zinc-400 ml-2 text-sm font-medium">
                4.9/5 from 2,000+ reviews
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
