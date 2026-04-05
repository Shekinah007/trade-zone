import Link from "next/link";
import {
  Shield,
  Users,
  ShieldCheck,
  Globe,
  Zap,
  Heart,
  ArrowRight,
  Star,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Registered Properties" },
  { value: "5,000+", label: "Registered Members" },
  { value: "50+", label: "Marketplace Categories" },
  { value: "4.8★", label: "Average Rating" },
];

const values = [
  {
    icon: ShieldCheck,
    color: "bg-blue-500/10 text-blue-500",
    title: "Trust & Safety",
    desc: "Every seller is reviewed before going live. We take fraud, theft, and suspicious activity seriously and act swiftly on reports.",
  },
  {
    icon: Shield,
    color: "bg-purple-500/10 text-purple-500",
    title: "Property Security",
    desc: "Our registry lets owners register their assets against theft. Buyers can verify ownership before purchasing any item.",
  },
  {
    icon: Users,
    color: "bg-indigo-500/10 text-indigo-500",
    title: "Community First",
    desc: "FindMaster is built for real people — buyers, sellers, and victims of theft who want a safer planet to live and trade.",
  },
  {
    icon: Globe,
    color: "bg-green-500/10 text-green-500",
    title: "Local Focus",
    desc: "We connect people within their communities, reducing logistics friction and supporting local economies across Nigeria.",
  },
  {
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-500",
    title: "Crime Reduction",
    desc: "Thieves can't easily sell registered items. Every property registered on FindMaster makes Nigeria safer for everyone.",
  },
  {
    icon: Star,
    color: "bg-orange-500/10 text-orange-500",
    title: "Transparency",
    desc: "No hidden fees, no shady algorithms. Listings are shown fairly and our ownership registry is publicly searchable.",
  },
];

const team = [
  {
    name: "Diamond Savwal",
    role: "Founder & CEO",
    avatar: "DS",
    bio: "Passionate about creating safe, accessible marketplaces and crime reduction tools for everyday Nigerians.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden border-b">
        <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium text-primary mb-5">
            <Shield className="h-3.5 w-3.5" />
            Our Story
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            We&apos;re building the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-cyan-500">
              future of safe trading
            </span>{" "}
            in Nigeria
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            FindMaster was founded with a dual mission: to make buying and
            selling goods safe, simple, and accessible — and to give every
            Nigerian a way to register, protect, and verify ownership of their
            property.
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
              A marketplace and a registry — in one platform
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Too many Nigerians have been burned by stolen phones, cars, and
              gadgets sold without disclosure. We built FindMaster because we
              believe ownership verification should be free, simple, and
              available to every Nigerian.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Through our property registry, verified seller system, in-app
              communication tools, and dedicated support team, we&apos;ve created a
              platform where both buyers and sellers can trade with genuine
              confidence — and where stolen property becomes unsellable.
            </p>
            <Link
              href="/registry"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Explore the Property Registry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Visual card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-5">
              {[
                { icon: ShieldCheck, text: "Register any property with a serial or IMEI" },
                { icon: Shield, text: "Public registry search before you buy" },
                { icon: AlertTriangle, text: "Report stolen items instantly" },
                { icon: ArrowLeftRight, text: "Transfer ownership with full history" },
                { icon: Users, text: "Community-driven reviews and ratings" },
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
        </div>
      </section>

      {/* Team */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            The People Behind FindMaster
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Meet the Team</h2>
        </div>
        <div className="flex justify-center">
          {team.map(({ name, role, avatar, bio }) => (
            <div
              key={name}
              className="rounded-2xl border bg-card p-6 text-center space-y-3 max-w-xs w-full"
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
            Ready to trade safely?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of buyers, sellers, and property owners already on
            FindMaster. It&apos;s free to sign up.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/registry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-semibold text-sm hover:bg-muted transition-colors"
            >
              <Shield className="h-4 w-4" />
              Explore Registry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
