import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Listing from "@/models/Listing";

export async function getCategoriesWithCounts() {
  await dbConnect();
  const categories = await Category.find({ parent: null })
    .sort({ name: 1 })
    .lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const [count, subcategoryCount] = await Promise.all([
        Listing.countDocuments({ category: cat._id, status: "active" }),
        Category.countDocuments({ parent: cat._id }),
      ]);
      return { ...cat, count, subcategoryCount };
    }),
  );

  return JSON.parse(JSON.stringify(categoriesWithCounts));
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full border bg-background/50 backdrop-blur-sm text-sm font-medium mb-6 text-primary">
            <Grid3X3 className="h-3.5 w-3.5 mr-2" />
            All Categories
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Browse by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-indigo-600">
              Category
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Explore thousands of listings across all categories. Find exactly
            what you're looking for.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="container mx-auto px-4 mb-5">
        <div className="flex items-center justify-center gap-8 py-4 px-6 rounded-2xl bg-muted/30 border w-fit mx-auto text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{categories.length}</strong>{" "}
            Categories
          </span>
          <span className="w-px h-4 bg-border" />
          <span>
            <strong className="text-foreground">
              {categories
                .reduce((a: number, c: any) => a + c.count, 0)
                .toLocaleString()}
            </strong>{" "}
            Active Listings
          </span>
        </div>
      </div>

      {/* Grid */}
      <section className="container mx-auto px-4 pb-24">
        {categories.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl">
            <Grid3X3 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group"
              >
                <div className="relative h-full bg-card hover:bg-background border border-transparent hover:border-primary/20 transition-all p-6 rounded-2xl shadow-sm hover:shadow-lg text-center group-hover:-translate-y-1 duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                  <div className="relative w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-sm">
                    {cat.icon || "📦"}
                  </div>

                  <p className="relative font-semibold text-sm text-foreground/80 group-hover:text-foreground transition-colors mb-1">
                    {cat.name}
                  </p>

                  <p className="relative text-xs text-muted-foreground">
                    {cat.count === 0
                      ? "No listings"
                      : `${cat.count.toLocaleString()} listing${cat.count !== 1 ? "s" : ""}`}
                  </p>

                  {cat.subcategoryCount > 0 && (
                    <p className="relative text-xs text-primary/70 mt-1">
                      {cat.subcategoryCount} subcategorie
                      {cat.subcategoryCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-indigo-500/5 border border-primary/10">
          <h2 className="text-2xl font-bold mb-2">Can't find what you need?</h2>
          <p className="text-muted-foreground mb-6">
            Browse all active listings or post your own ad for free.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/browse"
              className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-md shadow-primary/25"
            >
              Browse All Listings
            </Link>
            <Link
              href="/listings/create"
              className="inline-flex items-center px-6 py-2.5 rounded-full border border-primary/20 hover:border-primary/50 font-medium hover:text-primary transition-all"
            >
              Post an Ad
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
