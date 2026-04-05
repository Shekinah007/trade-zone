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
      <section className="relative px-4 py-14 md:py-20 overflow-hidden">
        {/* Animated background paths */}
        <div className="absolute inset-0 z-10">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        {/* Subtle gradient overlay so text stays readable */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/40 to-background/80 pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full border bg-background/50 backdrop-blur-sm text-sm font-medium mb-6 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
            Africa&apos;s #1 Property Security Marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Secure. Verify.{" "}
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-cyan-500">
              Trade Safely.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Register your devices and vehicles in Africa&apos;s most trusted property
            registry — and buy or sell with full confidence on our marketplace.
          </p>

          {/* Dual Search Cards */}
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {/* Marketplace Search */}
            <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-5 text-left space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">Marketplace</p>
                  <p className="text-xs text-muted-foreground">
                    Buy &amp; sell items
                  </p>
                </div>
              </div>
              <HomeSearchBar />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Trending:</span>
                {["iPhone 15", "HP Elitebook", "MacBook Pro"].map((term) => (
                  <Link
                    key={term}
                    href={`/browse?q=${term}`}
                    className="hover:text-primary transition-colors border-b border-dashed border-muted-foreground/50 hover:border-primary"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {/* Registry Search */}
            <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-5 text-left space-y-3 hover:shadow-md transition-shadow border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">Property Registry</p>
                  <p className="text-xs text-muted-foreground">
                    Verify before you buy
                  </p>
                </div>
              </div>
              <RegistrySearchBar />
              <p className="text-xs text-muted-foreground">
                Search by IMEI, serial number or chassis number to check if an
                item is reported stolen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How FindMasters Works */}
      <section className="py-20 border-y bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Two Platforms. One Mission.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              FindMasters combines a thriving marketplace with a powerful
              property security registry to protect buyers and sellers alike.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: ShieldCheck,
                color: "bg-blue-500/10 text-blue-600",
                title: "Register Your Property",
                desc: "Add any device or vehicle to the registry with its unique serial, IMEI, or chassis number.",
              },
              {
                icon: Search,
                color: "bg-purple-500/10 text-purple-600",
                title: "Verify Before Buying",
                desc: "Check the registry status of any item before purchasing. Avoid stolen goods instantly.",
              },
              {
                icon: AlertTriangle,
                color: "bg-red-500/10 text-red-600",
                title: "Report if Stolen",
                desc: "Mark your property as missing from your account. Others will see it flagged immediately.",
              },
              {
                icon: ArrowLeftRight,
                color: "bg-green-500/10 text-green-600",
                title: "Transfer Ownership",
                desc: "After selling, transfer the property registration to the buyer — keeping records clean.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border bg-card p-5 space-y-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`p-2.5 rounded-xl w-fit ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/registry">
                <Shield className="mr-2 h-4 w-4" />
                Explore Property Registry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-2 justify-between items-start md:items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Explore Categories
              </h2>
              <p className="text-muted-foreground">
                Find exactly what you need.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/categories">View All Categories</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group"
              >
                <div className="h-full bg-card hover:bg-background border border-transparent hover:border-border transition-all p-6 rounded-2xl shadow-sm hover:shadow-md text-center group-hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    {cat.icon || "📦"}
                  </div>
                  <span className="font-semibold text-foreground/80 group-hover:text-foreground">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-muted/20 border-y container mx-auto px-4">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">
            Fresh on the Market
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Don&apos;t miss out on the latest listings added by our community today.
          </p>
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
            <p className="text-muted-foreground mb-6">
              Be the first to create a listing!
            </p>
            <Button size="lg" asChild>
              <Link href="/listings/create">Post an Ad</Link>
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-primary/20 hover:border-primary/50"
            asChild
          >
            <Link href="/browse">View All Listings</Link>
          </Button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Fast &amp; Easy</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                List your items in seconds and register property in under 2
                minutes. No complicated forms or hidden fees.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Verified &amp; Secure</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Our property registry, verified user system, and safety
                guidelines ensure you always trade with confidence.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 text-white">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Local Community</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Support your local economy by buying from neighbors. Reduce
                waste, find hidden gems, and reduce crime nearby.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
