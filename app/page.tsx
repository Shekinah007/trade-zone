// export const revalidate = 0;
// export const dynamic = "force-dynamic";

// import Link from "next/link";
// import {
//   ArrowRight,
//   Search,
//   Zap,
//   ShieldCheck,
//   Globe,
//   Shield,
//   AlertTriangle,
//   ArrowLeftRight,
//   Smartphone,
//   Car,
//   Laptop,
//   Cpu,
//   Star,
//   ChevronRight,
//   ArrowUpRight,
// } from "lucide-react";
// import dbConnect from "@/lib/db";
// import Item from "@/models/Item";
// import { ListingCard } from "@/components/ListingCard";
// import { Button } from "@/components/ui/button";
// import Category from "@/models/Category";
// import { HomeSearchBar } from "@/components/HomeSearchBar";
// import { RegistrySearchBar } from "@/components/RegistrySearchBar";
// import { FloatingPaths } from "@/components/ui/background-paths";
// import EmojiGrid, { CategoryCard } from "@/components/EmojiGrid";

// async function getRecentListings() {
//   await dbConnect();
//   const listings = await Item.find({
//     isListed: true,
//     "listing.status": "active",
//   })
//     .sort({ createdAt: -1 })
//     .limit(8)
//     .lean();
//   return JSON.parse(JSON.stringify(listings));
// }

// async function getFeaturedListings() {
//   await dbConnect();
//   const listings = await Item.find({
//     isListed: true,
//     "listing.status": "active",
//     "listing.featuredStatus": "active",
//   })
//     .sort({ "listing.featuredAt": -1 })
//     .lean();
//   return JSON.parse(JSON.stringify(listings));
// }

// async function getCategories() {
//   await dbConnect();
//   const categories = await Category.find().sort({ name: 1 }).lean();
//   return JSON.parse(JSON.stringify(categories));
// }

// export default async function Home() {
//   const recentListings = await getRecentListings();
//   const featuredListings = await getFeaturedListings();
//   const categories = await getCategories();

//   return (
//     <div className="flex flex-col min-h-screen bg-background">
//       {/* Hero Section */}
//       <section
//         className="relative px-4 py-10 md:py-16 overflow-hidden border-b pb-40 md:pb-40 min-h-screen flex flex-col justify-center"
//         style={{ background: "#fafaf8" }}
//       >
//         {/* Grid pattern */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(209,213,219,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(209,213,219,0.4)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

//         {/* Emerald glow */}
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/4" />

//         {/* Red glow */}
//         <div className="absolute top-0 right-0 w-96 h-96 bg-red-400/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />

//         {/* Your content */}
//         <div className="container mx-auto relative z-10 text-center">
//           <div className="inline-flex items-center px-2.5 py-1 rounded-full border bg-background/80 backdrop-blur-sm text-xs font-semibold mb-6 text-primary  shadow-sm">
//             <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
//             Africa&apos;s #1 Property Security Marketplace
//           </div>

//           <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-linear-to-r from-red-500  to-emerald-500 tracking-tight mb-4 leading-tight ">
//             Secure. Verify. <br className="hidden md:block" />
//             <span className="">Trade Safely.</span>
//           </h1>

//           <p className="text-lg md:text-xl font-medium text-muted-foreground mb-10 max-w-2xl mx-auto ">
//             Register your devices in Africa&apos;s trusted property registry,
//             and buy or sell with full confidence.
//           </p>

//           {/* Dual Search Cards */}
//           <div className="grid md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto  ">
//             {/* Marketplace Card */}
//             <div className="rounded-3xl border-2 border-emerald-500/30 bg-linear-to-b from-card to-emerald-900/10 p-5 md:p-6 text-left space-y-3 shadow-[0_0_30px_-15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
//               <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500" />
//               <div className="relative z-10">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
//                     <Search className="h-6 w-6" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold tracking-tight">
//                       Marketplace
//                     </h2>
//                     <p className="text-sm font-medium text-muted-foreground mt-0.5">
//                       Buy &amp; sell verified items
//                     </p>
//                   </div>
//                 </div>
//                 <HomeSearchBar />
//                 <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs md:text-sm text-muted-foreground pt-2 items-center">
//                   <span className="font-semibold text-foreground">
//                     Popular:
//                   </span>
//                   {["iPhone 15", "HP Elitebook", "MacBook Pro"].map((term) => (
//                     <Link
//                       key={term}
//                       href={`/browse?q=${term}`}
//                       className="hover:text-emerald-500 font-medium transition-colors border-b border-dashed border-emerald-500/30 hover:border-emerald-500"
//                     >
//                       {term}
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Registry Card */}
//             <div className="rounded-3xl border-2 border-red-500/30 bg-linear-to-b from-card to-red-900/10 backdrop-blur-2xl p-5 md:p-6 text-left space-y-3 shadow-[0_0_30px_-15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_-15px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
//               <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all duration-500" />
//               <div className="relative z-10">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg">
//                     <Shield className="h-6 w-6" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold tracking-tight">
//                       Property Registry
//                     </h2>
//                     <p className="text-sm font-medium text-muted-foreground mt-0.5">
//                       Verify ownership before buying
//                     </p>
//                   </div>
//                 </div>
//                 <RegistrySearchBar />
//                 <p className="text-xs md:text-sm font-medium text-muted-foreground pt-2 flex items-start gap-2">
//                   <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
//                   <span>
//                     Search by IMEI, Serial, or Chassis Number to check for
//                     stolen flags.
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Visually distinct Marketplace and Registry How-It-Works section */}
//       <section className="py-16 bg-card/50 relative overflow-hidden">
//         {/* Decorative background for the section */}
//         <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 dark:opacity-20" />
//         <div className="absolute bottom-0 left-0 w-1/2 h-full bg-red-500/5 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 dark:opacity-20" />

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-12">
//             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
//               Platform Architecture
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
//               Two Platforms.{" "}
//               <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-red-600">
//                 One Mission.
//               </span>
//             </h2>
//             <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto font-medium">
//               FindMaster seamlessly integrates a secure property registry with a
//               dynamic marketplace.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
//             {/* Marketplace Path */}
//             <div className="bg-background rounded-3xl p-6 md:p-8 border border-emerald-500/10 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
//               <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[80px] -z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-500/10" />
//               <div className="flex items-center gap-4 mb-8">
//                 <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm border border-emerald-500/20">
//                   <Smartphone className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold tracking-tight">
//                     The Marketplace
//                   </h3>
//                   <p className="text-muted-foreground text-xs font-medium mt-1">
//                     For buying & selling
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-6 flex-1">
//                 <div className="flex gap-4">
//                   <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center font-bold shadow-sm text-sm">
//                     1
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-base">Browse or Sell</h4>
//                     <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
//                       Explore listings across categories or post your own
//                       devices and vehicles in seconds.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-4">
//                   <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center font-bold shadow-sm text-sm">
//                     2
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-base">
//                       Connect Securely
//                     </h4>
//                     <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
//                       Chat securely with buyers or sellers on our platform to
//                       arrange a deal and inspection.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-8 pt-6 border-t border-muted/60">
//                 <Button
//                   asChild
//                   className="w-full sm:w-auto font-semibold h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700"
//                   size="default"
//                 >
//                   <Link href="/browse">
//                     Explore Marketplace <ArrowRight className="w-4 h-4 ml-2" />
//                   </Link>
//                 </Button>
//               </div>
//             </div>

//             {/* Registry Path */}
//             <div className="bg-red-950/5 rounded-3xl p-6 md:p-8 border border-red-500/20 flex flex-col h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
//               <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-[80px] -z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-red-500/20" />
//               <div className="flex items-center gap-4 mb-8 relative z-10">
//                 <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm border border-red-500/20">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-red-950 dark:text-red-100 tracking-tight">
//                     Property Registry
//                   </h3>
//                   <p className="text-red-900/60 dark:text-red-200/60 text-xs font-medium mt-1">
//                     For safety & verification
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-6 flex-1 relative z-10">
//                 <div className="flex gap-4">
//                   <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex justify-center items-center font-bold shadow-sm text-sm">
//                     1
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-base text-red-950 dark:text-red-100">
//                       Register &amp; Claim
//                     </h4>
//                     <p className="text-red-900/70 dark:text-red-200/70 mt-1 text-sm leading-relaxed">
//                       Add your valuables using IMEI or Serial number to
//                       establish your proof of ownership.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-4">
//                   <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex justify-center items-center font-bold shadow-sm text-sm">
//                     2
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-base text-red-950 dark:text-red-100">
//                       Verify &amp; Transfer
//                     </h4>
//                     <p className="text-red-900/70 dark:text-red-200/70 mt-1 text-sm leading-relaxed">
//                       Check items before buying to avoid stolen goods, and
//                       transfer ownership digitally when selling.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-8 pt-6 border-t border-red-500/20 relative z-10">
//                 <Button
//                   asChild
//                   className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold h-10 rounded-lg"
//                   size="default"
//                 >
//                   <Link href="/registry">
//                     Open Registry <Shield className="w-4 h-4 ml-2" />
//                   </Link>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Unified Marketplace Zone */}
//       <section className="py-16 bg-muted/40 border-t relative overflow-hidden">
//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-12">
//             <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-xs mb-4 tracking-widest uppercase shadow-sm">
//               The Marketplace
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
//               Start Shopping Now
//             </h2>
//           </div>

//           <div className="mb-14">
//             <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
//               <div>
//                 <h3 className="text-xl font-bold tracking-tight">
//                   Top Categories
//                 </h3>
//                 <p className="text-sm text-muted-foreground mt-1 font-medium">
//                   Browse verified listings securely.
//                 </p>
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 asChild
//                 className="rounded-full"
//               >
//                 <Link href="/categories">View All Categories</Link>
//               </Button>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {categories.map((cat: any) => (
//                 <CategoryCard key={cat._id} cat={cat} />
//               ))}
//             </div>
//           </div>

//           {featuredListings.length > 0 && (
//             <section className="relative mb-20 overflow-hidden rounded-[2rem] border border-purple-500/20 bg-[#0b0613] p-6 md:p-10">
//               {/* Background Effects */}
//               <div className="absolute inset-0 overflow-hidden">
//                 <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
//                 <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

//                 <div className="absolute inset-0 bg-[radial-linear(circle_at_top_right,rgba(168,85,247,0.15),transparent_30%)]" />
//                 <div className="absolute inset-0 bg-[radial-linear(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_30%)]" />
//               </div>

//               <div className="relative z-10">
//                 {/* Header */}
//                 <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
//                   <div className="max-w-2xl">
//                     <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 mb-5">
//                       <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
//                       <span className="text-sm font-semibold text-purple-200 tracking-wide">
//                         PREMIUM MARKETPLACE
//                       </span>
//                     </div>

//                     <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
//                       Featured
//                       <span className="bg-linear-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
//                         {" "}
//                         Listings
//                       </span>
//                     </h2>

//                     <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
//                       Handpicked premium listings from trusted sellers.
//                       Verified, boosted, and highlighted for maximum visibility.
//                     </p>
//                   </div>

//                   <Button
//                     asChild
//                     size="lg"
//                     className="rounded-full bg-white text-black hover:bg-zinc-200 font-semibold shadow-xl"
//                   >
//                     <Link href="/featured">
//                       Explore Featured
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </Link>
//                   </Button>
//                 </div>

//                 {/* Featured Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
//                   {featuredListings.map((listing: any, index: number) => (
//                     <div
//                       key={listing._id}
//                       className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-purple-400/40 hover:bg-white/8 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.45)]"
//                     >
//                       {/* Glow */}
//                       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-purple-500/10 via-transparent to-indigo-500/10" />

//                       {/* Premium Badge */}
//                       <div className="absolute left-4 top-4 z-30">
//                         <div className="flex items-center gap-1 rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
//                           <Star className="h-3 w-3 fill-current" />
//                           Featured
//                         </div>
//                       </div>

//                       {/* Ranking Number */}
//                       <div className="absolute right-4 top-4 z-30">
//                         <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sm font-bold text-white backdrop-blur-md">
//                           #{index + 1}
//                         </div>
//                       </div>

//                       {/* Top Accent */}
//                       <div className="absolute top-0 left-0 h-1.5 w-full bg-linear-to-r from-purple-500 via-fuchsia-500 to-indigo-500" />

//                       {/* Listing */}
//                       <div className="relative">
//                         <ListingCard
//                           id={listing._id}
//                           title={listing.listing?.title || listing.model}
//                           price={listing.listing?.price}
//                           image={listing.images[0]}
//                           category={listing.listing?.category}
//                           condition={listing.listing?.condition}
//                           location={listing.listing?.location}
//                           createdAt={listing.createdAt}
//                         />
//                       </div>

//                       {/* Bottom Glow */}
//                       <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-purple-900/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </section>
//           )}

//           <div>
//             <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
//               <div>
//                 <h3 className="text-xl font-bold tracking-tight">
//                   Fresh on the Market
//                 </h3>
//                 <p className="text-sm text-muted-foreground mt-1 font-medium">
//                   Recently added trusted listings.
//                 </p>
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 asChild
//                 className="rounded-full"
//               >
//                 <Link href="/browse">Browse All Listings</Link>
//               </Button>
//             </div>

//             {recentListings.length > 0 ? (
//               <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
//                 {recentListings.map((listing: any) => (
//                   <ListingCard
//                     key={listing._id}
//                     id={listing._id}
//                     title={listing.listing?.title || listing.model}
//                     price={listing.listing?.price}
//                     image={listing.images[0]}
//                     category={listing.listing?.category}
//                     condition={listing.listing?.condition}
//                     location={listing.listing?.location}
//                     createdAt={listing.createdAt}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-muted rounded-3xl bg-background/50">
//                 <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-muted">
//                   <Search className="h-8 w-8 text-muted-foreground" />
//                 </div>
//                 <p className="text-xl font-bold tracking-tight">
//                   No active listings yet
//                 </p>
//                 <p className="text-sm text-muted-foreground mb-6">
//                   Be the first to create a listing!
//                 </p>
//                 <Button
//                   size="default"
//                   asChild
//                   className="px-6 rounded-full font-semibold"
//                 >
//                   <Link href="/listings/create">Post an Ad</Link>
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>
//       {/* Trust Section - Complete Redesign */}
//       <section className="relative py-24 md:py-32 overflow-hidden bg-[#0a0101]">
//         {/* Dynamic background pattern */}
//         <div className="absolute inset-0">
//           <div className="absolute inset-0 bg-[radial-linear(ellipse_at_top_right,_var(--tw-linear-stops))] from-red-900/30 via-transparent to-transparent" />
//           <div className="absolute inset-0 bg-[radial-linear(ellipse_at_bottom_left,_var(--tw-linear-stops))] from-emerald-900/30 via-transparent to-transparent" />
//           <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] animate-pulse" />
//           <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
//         </div>

//         {/* Geometric decoration */}
//         <div className="absolute top-10 right-10 w-32 h-32 border border-red-500/10 rounded-full" />
//         <div className="absolute top-20 right-20 w-16 h-16 border border-red-500/20 rounded-full" />
//         <div className="absolute bottom-10 left-10 w-40 h-40 border border-emerald-500/10 rounded-full" />
//         <div className="absolute bottom-20 left-20 w-20 h-20 border border-emerald-500/20 rounded-full" />

//         <div className="container mx-auto px-4 relative z-10">
//           {/* Section Header */}
//           <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-red-500/10 via-transparent to-emerald-500/10 border border-red-500/20 mb-8">
//               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//               <span className="text-sm font-medium bg-linear-to-r from-red-400 to-emerald-400 bg-clip-text text-transparent">
//                 Trust & Safety First
//               </span>
//               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-500" />
//             </div>

//             <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
//               <span className="text-white">Reimagining </span>
//               <span className="bg-linear-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
//                 Safe Trading
//               </span>
//             </h2>
//             <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
//               We're building a marketplace where trust isn't just a feature—it's
//               the foundation. Every transaction protected, every item verified.
//             </p>
//           </div>

//           {/* Feature Cards Grid */}
//           <div className="grid md:grid-cols-3 gap-1 max-w-5xl mx-auto">
//             {/* Card 1 */}
//             <div className="group relative p-8 md:p-10 bg-linear-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all duration-500">
//               <div className="absolute inset-0 bg-linear-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//               <div className="relative z-10">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="relative">
//                     <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20 group-hover:border-red-500/40 transition-colors">
//                       <Zap className="w-6 h-6 text-red-400" />
//                     </div>
//                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping group-hover:animate-none" />
//                   </div>
//                   <div className="h-px flex-1 bg-linear-to-r from-red-500/20 to-transparent" />
//                 </div>

//                 <h3 className="text-2xl font-bold text-white mb-3">
//                   Lightning Fast
//                 </h3>
//                 <p className="text-zinc-400 leading-relaxed">
//                   List items in seconds. Our streamlined process gets you from
//                   registration to listing faster than ever before.
//                 </p>

//                 <Link
//                   href="/faq"
//                   className="mt-6 flex items-center gap-2 text-sm text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
//                 >
//                   <span className="font-medium">Learn more</span>
//                   <ChevronRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             </div>

//             {/* Card 2 - Center (slightly elevated) */}
//             <div className="group relative p-8 md:p-10 bg-linear-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all duration-500 md:-mt-4 md:-mb-4 md:shadow-2xl md:shadow-black/50">
//               <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//               <div className="relative z-10">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="relative">
//                     <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-colors">
//                       <ShieldCheck className="w-6 h-6 text-white" />
//                     </div>
//                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
//                   </div>
//                   <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
//                   <div className="absolute top-4 right-4 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
//                     PREMIUM
//                   </div>
//                 </div>

//                 <h3 className="text-2xl font-bold text-white mb-3">
//                   Verified & Secure
//                 </h3>
//                 <p className="text-zinc-400 leading-relaxed">
//                   Every user verified, every item tracked. Our registry system
//                   ensures you're always trading with confidence.
//                 </p>

//                 <Link
//                   href="/safety"
//                   className="mt-6 flex items-center gap-2 text-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
//                 >
//                   <span className="font-medium">Explore security</span>
//                   <ChevronRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             </div>

//             {/* Card 3 */}
//             <div className="group relative p-8 md:p-10 bg-linear-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500">
//               <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//               <div className="relative z-10">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
//                     <Globe className="w-6 h-6 text-emerald-400" />
//                   </div>
//                   <div className="h-px flex-1 bg-linear-to-r from-emerald-500/20 to-transparent" />
//                 </div>

//                 <h3 className="text-2xl font-bold text-white mb-3">
//                   Community First
//                 </h3>
//                 <p className="text-zinc-400 leading-relaxed">
//                   Support your neighbors, reduce waste, and build a safer local
//                   economy. Together we create lasting change.
//                 </p>

//                 <Link
//                   href="/auth/signup"
//                   className="mt-6 flex items-center gap-2 text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
//                 >
//                   <span className="font-medium">Join community</span>
//                   <ChevronRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Stats Row */}
//           <div className="max-w-4xl mx-auto mt-16 md:mt-20">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
//                 <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
//                   50K+
//                 </div>
//                 <div className="text-sm text-zinc-500">Registered Items</div>
//               </div>
//               <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
//                 <div className="text-3xl md:text-4xl font-bold text-white mb-2">
//                   10K+
//                 </div>
//                 <div className="text-sm text-zinc-500">Verified Users</div>
//               </div>
//               <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
//                 <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
//                   99.9%
//                 </div>
//                 <div className="text-sm text-zinc-500">Safe Transactions</div>
//               </div>
//               <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
//                 <div className="text-3xl md:text-4xl font-bold text-white mb-2">
//                   200+
//                 </div>
//                 <div className="text-sm text-zinc-500">Cities Covered</div>
//               </div>
//             </div>
//           </div>

//           {/* Bottom CTA */}
//           <div className="text-center mt-16">
//             <p className="text-zinc-500 mb-4 text-sm">
//               Join thousands of satisfied users
//             </p>
//             <div className="flex items-center justify-center gap-2">
//               {[...Array(5)].map((_, i) => (
//                 <Star key={i} className="w-5 h-5 text-red-500 fill-red-500" />
//               ))}
//               <span className="text-zinc-400 ml-2 text-sm font-medium">
//                 4.9/5 from 2,000+ reviews
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Shield,
  Star,
  ChevronRight,
  Flame,
  Tag,
  Clock,
  Zap,
  Globe,
  BadgeCheck,
  TrendingUp,
  Sparkles,
  Bell,
  Gift,
  Package,
  Percent,
  ShoppingBag,
  Database,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import Category from "@/models/Category";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import { RegistrySearchBar } from "@/components/RegistrySearchBar";
import { CategoryCard } from "@/components/EmojiGrid";

async function getRecentListings() {
  await dbConnect();
  const listings = await Item.find({
    isListed: true,
    "listing.status": "active",
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

async function getFeaturedListings() {
  await dbConnect();
  const listings = await Item.find({
    isListed: true,
    "listing.status": "active",
    "listing.featuredStatus": "active",
  })
    .sort({ "listing.featuredAt": -1 })
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
  const featuredListings = await getFeaturedListings();
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f0] font-[family-name:var(--font-geist-sans)]">

      {/* ── TOP ANNOUNCEMENT BANNER ── */}
      {/* <div className="bg-emerald-600 text-white text-xs md:text-sm font-semibold text-center py-2 px-4 flex items-center justify-center gap-2">
        <Bell className="h-3.5 w-3.5 shrink-0" />
        <span>Free listing for the first 30 days — Africa's trusted property marketplace is live!</span>
        <Link href="/auth/signup" className="underline underline-offset-2 ml-1 hover:text-emerald-100">
          Join now →
        </Link>
      </div> */}

      {/* ── HERO: SEARCH BAR HEADER ── */}
      <section className="bg-[#0f1923] pt-5 pb-0 px-4">
        <div className="container mx-auto">
          {/* Logo + search row */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
            {/* <Link href="/" className="shrink-0">
              <span className="text-2xl font-black tracking-tight text-white">
                Find<span className="text-emerald-400">Master</span>
              </span>
            </Link> */}
            <div className="w-full max-w-2xl rounded-2xl border border-border/60 overflow-hidden bg-green-100 shadow-sm">

              {/* Header bar */}
              <div className="bg-[#0f1923] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span className="text-white text-sm font-medium">Marketplace</span>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              {/* Search area */}
              <div className="p-4">
                <div className="flex-1">
                  <HomeSearchBar />
                </div>


                {/* Popular tags */}
                <p className="mt-2.5 text-xs text-red-700 flex items-center gap-1">
                  Popular Categories: Phones & Accessories, Electronics...
                </p>
              </div>

              {/* Footer strip */}
              <div className="border-t border-border/50 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Find what you need, verified &amp; secure</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">10K+ listings</span>
                </div>
              </div>

            </div>
            {/* ── REGISTRY CHECK BAR ── */}
            <div className="w-full max-w-3xl rounded-2xl border border-red-200 overflow-hidden bg-red-50 shadow-sm">

              {/* Header bar */}
              <div className="bg-red-950 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-red-300" />
                  <span className="text-white text-sm font-medium">Property Registry</span>
                </div>
                <span className="bg-red-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                  Verify now
                </span>
              </div>

              {/* Search area */}
              <div className="p-4">
                <div className="flex items-center  rounded-xl overflow-hidden">
                  <div className="flex-1">
                    <RegistrySearchBar />
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-red-700 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  Search by IMEI &nbsp;·&nbsp; Serial Number &nbsp;·&nbsp; Chassis Number
                </p>
              </div>

              {/* Footer strip */}
              <div className="border-t border-red-100 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-red-700">Check item status.</span>
                <div className="flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">30K+ items registered</span>
                </div>
              </div>

            </div>
            <br />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/auth/signin" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              Register
            </Link>
            <Link href="/listings/create" className="bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              + Post Ad
            </Link>
          </div>

          {/* Category nav strip */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0">
            <p className="text-white/80 text-xs font-medium px-3 py-2.5 rounded-t-lg transition-colors whitespace-nowrap" >
              All Categories:
            </p>
            {
              // [
              //   { label: "All Categories", href: "/categories", icon: <Package className="h-3.5 w-3.5" /> },
              //   { label: "Phones", href: "/browse?cat=phones", icon: null },
              //   { label: "Laptops", href: "/browse?cat=laptops", icon: null },
              //   { label: "Vehicles", href: "/browse?cat=vehicles", icon: null },
              //   { label: "Electronics", href: "/browse?cat=electronics", icon: null },
              //   { label: "Fashion", href: "/browse?cat=fashion", icon: null },
              //   { label: "Home & Garden", href: "/browse?cat=home", icon: null },
              //   { label: "Agriculture", href: "/browse?cat=agriculture", icon: null },
              //   { label: "Services", href: "/browse?cat=services", icon: null },
              // ]
              categories.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/categories/${item.slug}`}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium px-3 py-2.5 rounded-t-lg transition-colors whitespace-nowrap"
                >
                  {/* {item.icon} */}
                  {item.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ── HERO BANNER ── */}
      <section className="bg-[#0f1923] px-4 pt-0 pb-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-3">
            {/* Main hero banner */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 min-h-[220px] flex flex-col justify-between">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute top-6 right-6">
                <span className="bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  🔥 Hot Deals
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-emerald-300 text-sm font-semibold uppercase tracking-widest mb-2">
                  Africa's #1 Property Registry
                </p>
                <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-3">
                  Secure. Verify.<br />
                  <span className="text-emerald-300">Trade Safely.</span>
                </h1>
                <p className="text-white/60 text-sm mb-6 max-w-sm">
                  Buy and sell verified phones, laptops & vehicles. Every item traceable.
                </p>
                <div className="flex gap-3">
                  <Link href="/browse" className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
                    Shop Now
                  </Link>
                  <Link href="/registry" className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors border border-white/20">
                    Check Registry
                  </Link>
                </div>
              </div>
            </div>

            {/* Side banners */}
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 flex-1 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                <Tag className="h-6 w-6 text-white/80" />
                <div>
                  <p className="text-white font-black text-lg leading-tight">Post a Free Ad</p>
                  <p className="text-white/70 text-xs mt-1">30-day free listing for new sellers</p>
                  <Link href="/listings/create" className="mt-3 inline-block bg-white text-orange-600 text-xs font-black px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors">
                    List Now →
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-red-700 to-red-950 p-5 flex-1 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                <ShieldCheck className="h-6 w-6 text-red-300" />
                <div>
                  <p className="text-white font-black text-lg leading-tight">Register your item</p>
                  <p className="text-white/60 text-xs mt-1">IMEI · Serial · Chassis</p>
                  <Link href="/registry/register" className="mt-3 inline-block bg-red-400 text-white text-xs font-black px-4 py-1.5 rounded-full hover:bg-red-300 transition-colors">
                    Go →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── STATS TICKER ── */}
      <div className="bg-white border-b border-gray-100 py-2 px-4 overflow-hidden">
        <div className="container mx-auto flex items-center gap-8 text-xs text-gray-500 overflow-x-auto scrollbar-none">
          {[
            { label: "50K+ Items Registered", icon: <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> },
            { label: "10K+ Verified Users", icon: <Star className="h-3.5 w-3.5 text-amber-500" /> },
            { label: "99.9% Safe Transactions", icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> },
            { label: "200+ Cities Covered", icon: <Globe className="h-3.5 w-3.5 text-blue-500" /> },
            { label: "4.9/5 Rating · 2,000+ Reviews", icon: <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5 whitespace-nowrap font-medium">
              {stat.icon}
              {stat.label}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">

        {/* ── SHOP BY CATEGORY ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Shop by Category</h2>
              <p className="text-xs text-gray-500 mt-0.5">Browse verified listings in every category</p>
            </div>
            <Link href="/categories" className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:text-emerald-700">
              See all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.map((cat: any) => (
              <CategoryCard key={cat._id} cat={cat} />
            ))}
          </div>
        </section>

        {/* ── FEATURED LISTINGS ── */}
        {featuredListings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-amber-400 rounded-lg p-1.5">
                  <Sparkles className="h-4 w-4 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">Featured Listings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Premium selections</p>
                </div>
              </div>
              <Link href="/featured" className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:text-emerald-700">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Featured row with gold accent */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {featuredListings.map((listing: any) => (
                  <div key={listing._id} className="relative group">
                    <div className="absolute top-2 left-2 z-20 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-current" /> Featured
                    </div>
                    <div className="rounded-xl overflow-hidden border border-amber-200/40 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <ListingCard
                        id={listing._id}
                        title={listing.listing?.title || listing.model}
                        price={listing.listing?.price}
                        image={listing.images[0]}
                        category={listing.listing?.category}
                        condition={listing.listing?.condition}
                        location={listing.listing?.location}
                        createdAt={listing.createdAt}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── PROMO BANNERS ROW ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 flex items-center gap-4">
            <Zap className="h-10 w-10 text-violet-200 shrink-0" />
            <div>
              <p className="text-white font-black text-base">Fast Listing</p>
              <p className="text-violet-200 text-xs">Go live in under 2 minutes</p>
              <Link href="/listings/create" className="mt-2 inline-block text-xs text-white font-bold underline">Start →</Link>
            </div>
          </div>
          {/* <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-5 flex items-center gap-4">
            <BadgeCheck className="h-10 w-10 text-teal-200 shrink-0" />
            <div>
              <p className="text-white font-black text-base">Buy Safe</p>
              <p className="text-teal-200 text-xs">Every seller ID-verified</p>
              <Link href="/safety" className="mt-2 inline-block text-xs text-white font-bold underline">Learn how →</Link>
            </div>
          </div> */}
          {/* <div className="rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 p-5 flex items-center gap-4">
            <Gift className="h-10 w-10 text-rose-200 shrink-0" />
            <div>
              <p className="text-white font-black text-base">Refer & Earn</p>
              <p className="text-rose-200 text-xs">₦5,000 for every referral</p>
              <Link href="/referral" className="mt-2 inline-block text-xs text-white font-bold underline">Refer now →</Link>
            </div>
          </div> */}
        </section>

        {/* ── FRESH LISTINGS ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 rounded-lg p-1.5">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Fresh on the Market</h2>
                <p className="text-xs text-gray-500 mt-0.5">Just added by trusted sellers</p>
              </div>
            </div>
            <Link href="/browse" className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:text-emerald-700">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recentListings.map((listing: any) => (
                <div key={listing._id} className="rounded-xl overflow-hidden border border-gray-200/70 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <ListingCard
                    id={listing._id}
                    title={listing.listing?.title || listing.model}
                    price={listing.listing?.price}
                    image={listing.images[0]}
                    category={listing.listing?.category}
                    condition={listing.listing?.condition}
                    location={listing.listing?.location}
                    createdAt={listing.createdAt}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <Search className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-base font-bold text-gray-700">No active listings yet</p>
              <p className="text-sm text-gray-400 mb-5">Be the first to post an ad!</p>
              <Link href="/listings/create" className="bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-emerald-700 transition-colors">
                Post an Ad
              </Link>
            </div>
          )}
        </section>

        {/* ── TRENDING SEARCHES ── */}
        <section className="bg-white rounded-2xl border border-gray-200/70 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Trending Searches</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "iPhone 15 Pro", "MacBook Air M2", "HP Elitebook", "Toyota Corolla",
              "Samsung Galaxy S24", "PS5", "Honda Civic", "iPad Pro",
              "Dell XPS 15", "iPhone 14", "Toyota Camry", "AirPods Pro",
            ].map((term) => (
              <Link
                key={term}
                href={`/browse?q=${encodeURIComponent(term)}`}
                className="bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              >
                {term}
              </Link>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS + REGISTRY (compact two-column) ── */}
        <section className="grid md:grid-cols-2 gap-4">
          {/* Marketplace how-it-works */}
          <div className="bg-emerald-950 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
            <h3 className="text-white font-black text-base mb-4 flex items-center gap-2">
              <span className="bg-emerald-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-black">M</span>
              How the Marketplace Works
            </h3>
            <div className="space-y-3">
              {[
                { n: "1", title: "Browse or Sell", desc: "Explore listings or post your device in seconds." },
                { n: "2", title: "Connect Securely", desc: "Chat with buyers/sellers and arrange inspection." },
                { n: "3", title: "Trade with Confidence", desc: "Every item verified. Every user accountable." },
              ].map((step) => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-7 h-7 shrink-0 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-black">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{step.title}</p>
                    <p className="text-emerald-200/60 text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/browse" className="mt-5 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
              Explore Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Registry how-it-works */}
          <div className="bg-red-950 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-red-500/20 rounded-full blur-2xl" />
            <h3 className="text-white font-black text-base mb-4 flex items-center gap-2">
              <span className="bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-black">R</span>
              How the Property Registry Works
            </h3>
            <div className="space-y-3">
              {[
                { n: "1", title: "Register & Claim", desc: "Add your items using IMEI or serial number." },
                { n: "2", title: "Verify Before Buying", desc: "Search any device to check for stolen flags." },
                { n: "3", title: "Transfer Ownership", desc: "Digital transfer when you sell. Safe, instant." },
              ].map((step) => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-7 h-7 shrink-0 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-xs font-black">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{step.title}</p>
                    <p className="text-red-200/60 text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/registry" className="mt-5 inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors">
              Open Registry <Shield className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── TRUST STATS ROW ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "50K+", label: "Registered Items", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { value: "10K+", label: "Verified Users", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { value: "99.9%", label: "Safe Transactions", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
            { value: "200+", label: "Cities Covered", color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 text-center ${stat.bg}`}>
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ── CTA: POST AD ── */}
        <section className="bg-[#0f1923] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Ready to sell?</p>
            <h2 className="text-white text-2xl font-black mb-2">Post your first ad today</h2>
            <p className="text-white/50 text-sm max-w-md">
              List your phones, laptops, vehicles, or any property. Reach thousands of verified buyers across Africa.
            </p>
          </div>
          <div className="flex gap-3 relative z-10 shrink-0">
            <Link href="/listings/create" className="bg-amber-400 hover:bg-amber-300 text-black font-black text-sm px-6 py-3 rounded-full transition-colors whitespace-nowrap">
              Post a Free Ad →
            </Link>
            <Link href="/browse" className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors border border-white/20 whitespace-nowrap">
              Browse Listings
            </Link>
          </div>
        </section>

      </div>

      {/* ── FOOTER STRIP ── */}
      {/* <footer className="bg-[#0f1923] mt-8 pt-8 pb-6 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <p className="text-white font-black mb-3">FindMaster</p>
              <p className="text-white/40 text-xs leading-relaxed">Africa's trusted marketplace for verified property and device trading.</p>
            </div>
            {[
              { title: "Marketplace", links: ["Browse Listings", "Post an Ad", "Featured Listings", "Categories"] },
              { title: "Registry", links: ["Register Item", "Check IMEI", "Transfer Ownership", "Stolen Database"] },
              { title: "Support", links: ["Help Centre", "Safety Tips", "Contact Us", "Report Listing"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white/80 font-bold mb-3 text-xs uppercase tracking-widest">{col.title}</p>
                <ul className="space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">© 2025 FindMaster. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
                <Link key={item} href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer> */}

    </div>
  );
}