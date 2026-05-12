export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tag } from "lucide-react";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Item from "@/models/Item";
import { CategoryPageClient } from "../CategoryPageClient";
import EmojiGrid from "@/components/EmojiGrid";
// import { CategoryPageClient } from "@/components/CategoryPageClient";

async function getCategoryData(slug: string) {
  await dbConnect();

  const category = (await Category.findOne({ slug }).lean()) as any;
  if (!category) return null;

  const parent = category.parent
    ? await Category.findById(category.parent).lean()
    : null;

  const [subcategories, allListings, totalCount] = await Promise.all([
    Category.find({ parent: category._id })
      .sort({ name: 1 })
      .lean()
      .then((subs) =>
        Promise.all(
          subs.map(async (sub: any) => {
            const count = await Item.countDocuments({
              isListed: true,
              "listing.category": sub._id,
              "listing.status": "active",
            });
            return { ...sub, count };
          }),
        ),
      ),

    // Fetch ALL active listings — JS sorting below ensures boosted items
    // always stay at the top regardless of whatever sort the user picks.
    Item.find({
      isListed: true,
      "listing.category": category._id,
      "listing.status": "active",
    })
      .select(
        "brand model images listing.title listing.price listing.condition listing.location listing.boostStatus listing.boostedAt listing.boostExpiry listing.featuredStatus listing.featuredAt listing.views createdAt",
      )
      .lean(),

    Item.countDocuments({
      isListed: true,
      "listing.category": category._id,
      "listing.status": "active",
    }),
  ]);

  return JSON.parse(
    JSON.stringify({
      category,
      subcategories,
      allListings,
      totalCount,
      parent,
    }),
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) notFound();

  const { category, subcategories, allListings, totalCount, parent } = data;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-5 overflow-hidden border-b bg-gradient-to-br from-background to-muted/30">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href="/categories"
              className="hover:text-primary transition-colors"
            >
              Categories
            </Link>
            {parent && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <Link
                  href={`/categories/${(parent as any).slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {(parent as any).icon && (
                    <span className="mr-1">{(parent as any).icon}</span>
                  )}
                  {(parent as any).name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-medium flex items-center gap-2">
              {category.icon && (
                <div>
                  <EmojiGrid icon={category.icon} />
                </div>
              )}
              {category.name}
            </span>
          </nav>

          <div className="flex items-center gap-5">
            {!category.icon ? (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-primary/10 shadow-sm shrink-0">
                📦
              </div>
            ) : (
              <EmojiGrid icon={category.icon} />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
                {category.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {totalCount.toLocaleString()} active listing
                {totalCount !== 1 ? "s" : ""}
                {subcategories.length > 0 &&
                  ` · ${subcategories.length} subcategor${subcategories.length !== 1 ? "ies" : "y"}`}
                {parent && (
                  <span>
                    {" "}
                    · in{" "}
                    <Link
                      href={`/categories/${(parent as any).slug}`}
                      className="text-primary hover:underline"
                    >
                      {(parent as any).name}
                    </Link>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 space-y-10">
        {subcategories.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold">Browse Subcategories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {subcategories.map((sub: any) => (
                <Link
                  key={sub._id}
                  href={`/categories/${sub.slug}`}
                  className="group"
                >
                  <div className="bg-card hover:bg-background border border-transparent hover:border-primary/20 transition-all p-3 rounded-xl text-center group-hover:-translate-y-0.5 duration-200 shadow-sm hover:shadow-md">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">
                      {sub.icon || "📦"}
                    </div>
                    <p className="text-xs font-semibold text-foreground/80 group-hover:text-foreground leading-tight">
                      {sub.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {sub.count.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <CategoryPageClient
          listings={allListings}
          categoryName={category.name}
          hasSubcategories={subcategories.length > 0}
        />
      </div>
    </div>
  );
}
