import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Eye,
  CreditCard,
  Phone,
  AlertTriangle,
  UserCheck,
  Package,
  MessageSquare,
  Flag,
} from "lucide-react";

const tips = [
  {
    icon: MapPin,
    title: "Meet in a Safe, Public Place",
    color: "bg-blue-500/10 text-blue-500",
    points: [
      "Always meet in a busy, well-lit public location such as a shopping mall, bank lobby, or busy restaurant.",
      "Avoid meeting at your home, the seller's home, or any isolated location.",
      "Consider bringing a friend or family member with you.",
      "Inform someone you trust about where you are going and who you are meeting.",
    ],
  },
  {
    icon: Eye,
    title: "Inspect Before You Buy",
    color: "bg-purple-500/10 text-purple-500",
    points: [
      "Always physically inspect the item before handing over any payment.",
      "Test electronic devices — power them on, check all functions, and verify serial numbers.",
      "For vehicles, request a VIN check and service history before purchase.",
      "Be wary of sellers who refuse to let you inspect the item thoroughly.",
    ],
  },
  {
    icon: CreditCard,
    title: "Pay Only After Collecting",
    color: "bg-green-500/10 text-green-500",
    points: [
      "Never pay in advance or send money before receiving and inspecting the item.",
      "Be extremely cautious of sellers asking for deposits or upfront payments.",
      "Avoid wire transfers to unknown individuals — use cash for in-person transactions where possible.",
      "If paying online, use a secure payment method and keep records of all transactions.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Recognize & Avoid Scams",
    color: "bg-yellow-500/10 text-yellow-500",
    points: [
      "If a deal seems too good to be true, it probably is.",
      "Be suspicious of sellers who claim to be abroad and offer to ship the item.",
      "Never share your bank account details, BVN, OTP codes, or passwords with anyone.",
      "Watch out for fake payment notifications — verify your bank balance directly before releasing any item.",
    ],
  },
  {
    icon: Phone,
    title: "Communicate Safely",
    color: "bg-orange-500/10 text-orange-500",
    points: [
      //   "Use TradeZone's in-app chat to communicate — this keeps a record of all conversations.",
      //   "Be cautious of buyers or sellers who insist on communicating only outside the platform.",
      "Do not share personal information such as your home address or ID number with strangers.",
      "Trust your instincts — if something feels off, disengage from the conversation.",
    ],
  },
  {
    icon: Package,
    title: "Shipping & Delivery",
    color: "bg-pink-500/10 text-pink-500",
    points: [
      "Use reputable, trackable courier services for any shipments.",
      "Do not release payment until you have a valid tracking number and can verify the shipment.",
      "Inspect delivered packages immediately and document any damage with photos.",
      "For high-value items, consider using escrow or a trusted third-party delivery service.",
    ],
  },
  {
    icon: UserCheck,
    title: "Verify the Seller",
    color: "bg-teal-500/10 text-teal-500",
    points: [
      "Check the seller's profile — review their ratings, reviews, and how long they've been on the platform.",
      "Look for verified badges and approved account status.",
      "Read reviews from previous buyers before making a decision.",
      "A low rating or no reviews on a high-value listing should raise caution.",
    ],
  },
  {
    icon: Flag,
    title: "Report Suspicious Activity",
    color: "bg-red-500/10 text-red-500",
    points: [
      "If you encounter a suspicious listing, use the 'Report' button on the listing page.",
      "Report any user who attempts to scam, threaten, or harass you.",
      "Contact our support team immediately if you believe you've been defrauded.",
      "Your reports help keep the TradeZone community safe for everyone.",
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-primary py-16 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-5%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-5">
            <ShieldCheck className="h-3.5 w-3.5" /> Your Safety is Our Priority
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Safety Tips
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            TradeZone connects buyers and sellers, but your safety during
            transactions is paramount. Follow these guidelines to protect
            yourself and trade with confidence.
          </p>
        </div>
      </section>

      {/* Tips grid */}
      <div className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          {tips.map(({ icon: Icon, title, color, points }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-base">{title}</h2>
              </div>
              <ul className="space-y-2">
                {points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Emergency CTA */}
        <div className="mt-12 rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Been scammed or harassed?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Don't stay silent. Report it to our team immediately and we'll take
            swift action.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" /> Contact Support
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
