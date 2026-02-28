"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  User,
  CreditCard,
  Package,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
  {
    icon: User,
    label: "Accounts",
    color: "bg-blue-500/10 text-blue-500",
    faqs: [
      {
        q: "How do I create an account on TradeZone?",
        a: "Click 'Sign Up' on the homepage, fill in your name, email, and password, then submit. Your account will be reviewed by our team within 24–48 hours before you can post listings.",
      },
      {
        q: "How long does account approval take?",
        a: "Account approvals are typically processed within 24–48 hours. You can browse and save listings while you wait. You'll be notified once your account is approved.",
      },
      {
        q: "Can I sign up with Google or Facebook?",
        a: "Yes! You can sign up using your Google or Facebook account for a faster registration experience. These accounts are still subject to the same approval process.",
      },
      {
        q: "How do I reset my password?",
        a: "On the sign-in page, click 'Forgot password?' and enter your email address. If you signed up with Google or Facebook, password reset is managed through those platforms.",
      },
      {
        q: "How do I update my profile information?",
        a: "Go to Settings from the navigation menu. You can update your name, profile photo, phone number, and other account details from there.",
      },
      {
        q: "Can I have multiple accounts?",
        a: "No. Each person is allowed one account on TradeZone. Creating multiple accounts to circumvent bans or suspensions is a violation of our Terms and Conditions.",
      },
    ],
  },
  {
    icon: ShoppingBag,
    label: "Listings",
    color: "bg-purple-500/10 text-purple-500",
    faqs: [
      {
        q: "How do I post a listing?",
        a: "Once your account is approved, click 'Post an Ad' from the navigation menu. Fill in your item title, category, condition, description, price, and location, then upload at least one photo and submit.",
      },
      {
        q: "How many photos can I upload per listing?",
        a: "You can upload up to 5 photos per listing. The first image will be used as the cover photo shown in search results.",
      },
      {
        q: "Can I edit my listing after posting?",
        a: "Yes. Go to your listing page and click 'Edit Listing'. You can update all details including photos, price, and description. Note that sold listings cannot be edited.",
      },
      {
        q: "How do I mark my item as sold?",
        a: "On your listing page, click 'Mark as Sold'. This removes the listing from active search results and records the sale. This action cannot be undone.",
      },
      {
        q: "What items are not allowed on TradeZone?",
        a: "Prohibited items include stolen goods, counterfeit products, weapons, drugs, adult content, and any item whose sale is illegal under Nigerian law. Violations result in immediate listing removal and possible account suspension.",
      },
      {
        q: "Why was my listing removed?",
        a: "Listings may be removed if they violate our Terms and Conditions, are reported by other users, or are flagged by our moderation team. Contact support if you believe your listing was removed in error.",
      },
    ],
  },
  {
    icon: CreditCard,
    label: "Buying & Selling",
    color: "bg-green-500/10 text-green-500",
    faqs: [
      {
        q: "How do I contact a seller?",
        a: "On any listing page, click 'Contact Seller' to send an in-app message, open a WhatsApp chat, or call directly if the seller has added a phone number.",
      },
      {
        q: "Does TradeZone handle payments?",
        a: "TradeZone currently facilitates buyer-seller contact but does not process payments directly. Transactions are conducted between buyers and sellers. Always follow our Safety Tips when exchanging money.",
      },
      {
        q: "What should I do if a seller is unresponsive?",
        a: "If a seller does not respond within a reasonable time, you can try contacting them via WhatsApp or phone if they've provided those details. If the listing appears abandoned, report it to our team.",
      },
      {
        q: "Can I negotiate the price?",
        a: "Yes. Price negotiation is entirely between you and the seller. Use the in-app chat or WhatsApp to discuss pricing before agreeing to a transaction.",
      },
      {
        q: "How do I leave a review for a seller?",
        a: "After interacting with a seller, visit their listing page and click 'Leave a Review'. You can rate the seller from 1–5 stars and leave a written comment.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    label: "Safety & Trust",
    color: "bg-yellow-500/10 text-yellow-500",
    faqs: [
      {
        q: "How does TradeZone keep the platform safe?",
        a: "We verify sellers through our account approval process, allow users to report suspicious listings, and have a moderation team that reviews reports and takes action on violations.",
      },
      {
        q: "How do I report a suspicious listing or user?",
        a: "On any listing page, scroll down and click 'Report this listing'. For user concerns, contact our support team directly via the Contact page.",
      },
      {
        q: "What should I do if I've been scammed?",
        a: "Contact TradeZone support immediately with full details of the transaction. You should also report the incident to the Nigerian Police Force or the EFCC. Do not attempt to resolve the issue directly with the scammer.",
      },
      {
        q: "Are sellers verified on TradeZone?",
        a: "All sellers go through an admin approval process before they can post listings. Sellers with a verified business profile have an additional layer of credibility. Always check a seller's reviews and ratings.",
      },
    ],
  },
  {
    icon: Package,
    label: "Saved & Orders",
    color: "bg-pink-500/10 text-pink-500",
    faqs: [
      {
        q: "How do I save a listing?",
        a: "Click the heart icon on any listing card or listing page. Saved listings are accessible from the 'Saved' section in your account menu.",
      },
      {
        q: "How do I share a listing?",
        a: "On any listing page, click the share icon to copy the link, share to WhatsApp, Facebook, or Twitter, or use your device's native share menu on mobile.",
      },
      {
        q: "Can I see my purchase history?",
        a: "Yes. Your transaction history is available from your profile settings. It shows all purchases you've made through the platform.",
      },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = categories
    .filter((cat) => activeCategory === "all" || cat.label === activeCategory)
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (faq) =>
          !search ||
          faq.q.toLowerCase().includes(search.toLowerCase()) ||
          faq.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  const totalResults = filtered.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/20 py-14">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about TradeZone.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-10 rounded-full h-11 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <p className="text-sm text-muted-foreground mt-3">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for "{search}
              "
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted border-transparent"
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat.label
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted border-transparent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ sections */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term or{" "}
              <button
                onClick={() => setSearch("")}
                className="text-primary hover:underline"
              >
                clear the search
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filtered.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.label}>
                  {/* Category header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`p-2 rounded-xl shrink-0 ${cat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="font-bold text-lg">{cat.label}</h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {cat.faqs.length}
                    </span>
                  </div>

                  {/* FAQ items */}
                  <div className="space-y-2">
                    {cat.faqs.map((faq, i) => {
                      const key = `${cat.label}-${i}`;
                      const isOpen = !!openItems[key];
                      return (
                        <div
                          key={key}
                          className={`rounded-xl border overflow-hidden transition-colors ${
                            isOpen ? "bg-muted/30" : "bg-card hover:bg-muted/20"
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                          >
                            <span className="font-medium text-sm">{faq.q}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-14 rounded-2xl bg-primary text-primary-foreground p-8 text-center relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-90" />
            <h3 className="font-bold text-xl mb-2">Still have questions?</h3>
            <p className="text-primary-foreground/80 text-sm mb-6 max-w-sm mx-auto">
              Can't find what you're looking for? Our support team is happy to
              help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
