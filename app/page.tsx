import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function getRecentListings() {
  await dbConnect();
  // Fetch 6 recent active listings
  const listings = await Listing.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

export default async function Home() {
  const recentListings = await getRecentListings();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-background text-center overflow-hidden">
        <div className="container mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Buy & Sell Locally, Securely.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Discover great deals, connect with your community, and trade with confidence on Trade Zone.
          </p>

          <div className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="What are you looking for?"
                className="pl-10 h-12 text-lg bg-background/80 backdrop-blur"
              />
            </div>
            <Button size="lg" className="h-12 px-8">Search</Button>
          </div>
          
          <div className="mt-8 flex justify-center gap-4 text-sm text-muted-foreground">
             <span>Popular:</span>
             <Link href="/browse?q=iPhone" className="hover:text-primary underline underline-offset-4">iPhone</Link>
             <Link href="/browse?q=Car" className="hover:text-primary underline underline-offset-4">Cars</Link>
             <Link href="/browse?q=Furniture" className="hover:text-primary underline underline-offset-4">Furniture</Link>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Categories Section (Quick Links) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
           <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Home', 'Services'].map((cat) => (
                <Link key={cat} href={`/browse?category=${cat}`}>
                  <div className="bg-card hover:bg-card/80 transition-colors p-6 rounded-xl border text-center shadow-sm cursor-pointer">
                     <span className="font-semibold">{cat}</span>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Featured/Recent Listings */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Fresh Recommendations</h2>
          <Button variant="ghost" asChild>
            <Link href="/browse">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
           <div className="text-center py-12 border-2 border-dashed rounded-lg">
             <p className="text-muted-foreground">No active listings at the moment. Be the first to post!</p>
             <Button className="mt-4" asChild>
               <Link href="/listings/create">Post an Ad</Link>
             </Button>
           </div>
        )}
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl font-bold mb-4">Ready to declutter?</h2>
           <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
             Join thousands of sellers turning their unused items into cash. It's safe, fast, and free to sell locally.
           </p>
           <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/listings/create">Start Selling</Link>
           </Button>
        </div>
      </section>
    </div>
  );
}
