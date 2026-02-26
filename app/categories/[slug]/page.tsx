import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Tag } from "lucide-react";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ListingCard";

async function getCategoryData(slug: string) {
  await dbConnect();

  const category = await Category.findOne({ slug }).lean() as any;
  if (!category) return null;

                       
  const parent = category.parent
    ? await Category.findById(category.parent).lean()
    : null;

  const [subcategories, featuredListings, totalCount] = await Promise.all([
    // Subcategories with their listing counts
    Category.find({ parent: category._id }).sort({ name: 1 }).lean().then(
      (subs) => Promise.all(
        subs.map(async (sub: any) => {
          const count = await Listing.countDocuments({ category: sub._id, status: "active" });
          return { ...sub, count };
        })
      )
    ),
    // Featured listings in this category
    Listing.find({ category: category._id, status: "active" })
      .sort({ featured: -1, createdAt: -1 })
      .limit(8)
      .lean(),
    // Total listing count
    Listing.countDocuments({ category: category._id, status: "active" }),
  ]);

  return JSON.parse(JSON.stringify({ category, subcategories, featuredListings, totalCount, parent}));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> })                    
                      
   {
  const { slug } = await params;
  const data = await getCategoryData(slug)
  if (!data) notFound();

  const { category, subcategories, featuredListings, totalCount, parent } = data;

  return (
    <div className="min-h-screen bg-background">
     

      <section className="relative py-4 overflow-hidden border-b">
  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />
  <div className="container mx-auto px-4">

    {/* Breadcrumbs */}
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
      <Link href="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <Link href="/categories" className="hover:text-primary transition-colors">
        Categories
      </Link>

      {parent && (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link
            href={`/categories/${parent.slug}`}
            className="hover:text-primary transition-colors"
          >
            {parent.icon && <span className="mr-1">{parent.icon}</span>}
            {parent.name}
          </Link>
        </>
      )}

      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="text-foreground font-medium">
        {category.icon && <span className="mr-1">{category.icon}</span>}
        {category.name}
      </span>
    </nav>

    {/* Category header */}
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-primary/10 shadow-sm shrink-0">
        {category.icon || "📦"}
      </div>
      <div>
        <h1 className="text-2xl md:text-2xl font-extrabold tracking-tight mb-1">
          {category.name}
        </h1>
        <p className="text-muted-foreground">
          {totalCount.toLocaleString()} active listing{totalCount !== 1 ? "s" : ""}
          {subcategories.length > 0 && ` · ${subcategories.length} subcategor${subcategories.length !== 1 ? "ies" : "y"}`}
          {parent && (
            <span> · in <Link href={`/categories/${parent.slug}`} className="text-primary hover:underline">{parent.name}</Link></span>
          )}
        </p>
      </div>
    </div>
  </div>
</section>

      <div className="container mx-auto px-4 py-4 space-y-16">

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Subcategories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {subcategories.map((sub: any) => (
                <Link key={sub._id} href={`/categories/${sub.slug}`} className="group">
                  <div className="bg-card hover:bg-background border border-transparent hover:border-primary/20 transition-all p-2 rounded-xl text-center group-hover:-translate-y-0.5 duration-200 shadow-sm hover:shadow-md">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">
                      {sub.icon || "📦"}
                    </div>
                    <p className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                      {sub.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub.count.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {subcategories.length > 0 ? "Featured Listings" : "Listings"}
            </h2>
            <Link
              href={`/browse?category=${encodeURIComponent(category.name)}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all {totalCount} →
            </Link>
          </div>

          {featuredListings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-3xl">
              <p className="text-lg font-medium">No listings yet</p>
              <p className="text-muted-foreground mb-6">Be the first to post in this category!</p>
              <Link
                href="/listings/create"
                className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
              >
                Post an Ad
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing: any) => (
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
          )}
        </section>

      </div>
    </div>
  );
}