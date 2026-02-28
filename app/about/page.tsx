import Link from "next/link";
import {
  ShoppingBag,
  Users,
  ShieldCheck,
  Globe,
  Zap,
  Heart,
  ArrowRight,
  Star,
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Active Listings" },
  { value: "5,000+", label: "Registered Users" },
  { value: "50+", label: "Categories" },
  { value: "4.8★", label: "Average Rating" },
];

const values = [
  {
    icon: ShieldCheck,
    color: "bg-blue-500/10 text-blue-500",
    title: "Trust & Safety",
    desc: "Every seller is reviewed and approved by our team before they can post. We take fraud seriously and act swiftly on reports.",
  },
  {
    icon: Users,
    color: "bg-purple-500/10 text-purple-500",
    title: "Community First",
    desc: "TradeZone is built for real people, buyers, sellers, and collectors who want a fair and friendly place to trade.",
  },
  {
    icon: Globe,
    color: "bg-green-500/10 text-green-500",
    title: "Local Focus",
    desc: "We connect people within their communities, reducing logistics friction and supporting local economies across Nigeria.",
  },
  {
    icon: Zap,
    color: "bg-yellow-500/10 text-yellow-500",
    title: "Speed & Simplicity",
    desc: "From registration to your first listing in minutes. We've cut the complexity so you can focus on trading.",
  },
  {
    icon: Heart,
    color: "bg-pink-500/10 text-pink-500",
    title: "Transparency",
    desc: "No hidden fees, no shady algorithms. Listings are shown fairly and our policies are written in plain language.",
  },
  {
    icon: Star,
    color: "bg-orange-500/10 text-orange-500",
    title: "Quality Over Quantity",
    desc: "We'd rather have fewer, trustworthy listings than thousands of spam posts. Our approval system keeps standards high.",
  },
];

const team = [
  {
    name: "Diamnod Savwal",
    role: "Founder & CEO",
    avatar: "AO",
    bio: "Passionate about creating safe, accessible marketplaces for everyday Nigerians.",
  },
  //   {
  //     name: "Emeka Nwosu",
  //     role: "Head of Product",
  //     avatar: "EN",
  //     bio: "Obsessed with building products that are intuitive, fast, and delightful to use.",
  //   },
  //   {
  //     name: "Fatima Aliyu",
  //     role: "Head of Trust & Safety",
  //     avatar: "FA",
  //     bio: "Dedicated to making TradeZone the safest peer-to-peer marketplace in Nigeria.",
  //   },
  //   {
  //     name: "Chukwudi Eze",
  //     role: "Lead Engineer",
  //     avatar: "CE",
  //     bio: "Building the infrastructure that keeps TradeZone fast, reliable, and scalable.",
  //   },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden border-b">
        <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium text-primary mb-5">
            <ShoppingBag className="h-3.5 w-3.5" />
            Our Story
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            We're building the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-indigo-500">
              future of trading
            </span>{" "}
            in Nigeria
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            TradeZone was founded with a simple belief: buying and selling goods
            should be safe, simple, and accessible to everyone, not just those
            who can afford to lose money to scams.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Our Mission
            </p>
            <h2 className="text-3xl font-bold tracking-tight mb-5">
              Making peer-to-peer commerce work for everyone
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Too many Nigerians have been burned by online marketplace scams.
              We built TradeZone because we believe trust should be the
              foundation of every transaction, not an afterthought.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Through our seller verification system, in-app communication
              tools, and dedicated support team, we've created a marketplace
              where both buyers and sellers can trade with genuine confidence.
            </p>
            <Link
              href="/safety"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Read our Safety Tips <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Visual card */}
          <div className="rounded-2xl bg-primary p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-5">
              {[
                {
                  icon: ShieldCheck,
                  text: "Every seller verified before going live",
                },
                { icon: Users, text: "Community-driven reviews and ratings" },
                { icon: Zap, text: "List your item in under 5 minutes" },
                { icon: Heart, text: "No hidden fees, ever" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/15 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/20 border-y">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Our Core Values
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border bg-card p-5 space-y-3"
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
        </div>
      </section>

      {/* Team */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            The People Behind TradeZone
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Meet the Team</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map(({ name, role, avatar, bio }) => (
            <div
              key={name}
              className="rounded-2xl border bg-card p-5 text-center space-y-3"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto">
                {avatar}
              </div>
              <div>
                <p className="font-bold">{name}</p>
                <p className="text-xs text-primary font-medium">{role}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t bg-muted/20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to start trading?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of buyers and sellers already on TradeZone. It's free
            to sign up.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-semibold text-sm hover:bg-muted transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
