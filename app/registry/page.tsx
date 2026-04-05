import Link from "next/link";
import {
  Shield,
  Search,
  ClipboardList,
  ArrowRight,
  Smartphone,
  Car,
  Laptop,
  Cpu,
  ShieldCheck,
  ArrowLeftRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrySearchBar } from "@/components/RegistrySearchBar";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Sign Up & Set Up Profile",
    desc: "Create your FindMaster account and set up your profile with your personal details.",
  },
  {
    icon: Shield,
    step: "02",
    title: "Register Your Property",
    desc: "Add your device, vehicle or gadget with its serial number, IMEI, or chassis number.",
  },
  {
    icon: Search,
    step: "03",
    title: "Search Before You Buy",
    desc: "Look up any item's registry status before purchasing to confirm it's not stolen.",
  },
  {
    icon: ArrowLeftRight,
    step: "04",
    title: "Transfer Ownership",
    desc: "Securely transfer ownership when you sell — keeping the registry accurate and honest.",
  },
];

const deviceTypes = [
  { icon: Smartphone, label: "Phones & Tablets" },
  { icon: Laptop, label: "Laptops & PCs" },
  { icon: Car, label: "Cars & Motorcycles" },
  { icon: Cpu, label: "Electronics & More" },
];

const features = [
  {
    icon: Shield,
    color: "bg-blue-500/10 text-blue-600",
    title: "Property Registration",
    desc: "Register any item with a serial number, IMEI, or chassis number under your account for lifetime ownership proof.",
  },
  {
    icon: Search,
    color: "bg-purple-500/10 text-purple-600",
    title: "Instant Status Check",
    desc: "Anyone can search the registry to verify whether an item is clean, missing, or already registered to another owner.",
  },
  {
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-600",
    title: "Report Missing Items",
    desc: "Mark any of your registered properties as missing instantly. Buyers can then see its stolen status before purchasing.",
  },
  {
    icon: ArrowLeftRight,
    color: "bg-green-500/10 text-green-600",
    title: "Ownership Transfer",
    desc: "Transfer ownership to a buyer after sale, complete with optional sale price, date, and location records.",
  },
  {
    icon: ShieldCheck,
    color: "bg-orange-500/10 text-orange-600",
    title: "Crime Deterrence",
    desc: "Thieves can't easily sell registered items. Every registered item creates a verifiable chain of custody.",
  },
  {
    icon: ClipboardList,
    color: "bg-teal-500/10 text-teal-600",
    title: "Full History Log",
    desc: "See the complete ownership history of any property — previous owners, transfer dates, sale prices, and locations.",
  },
];

export const metadata = {
  title: "Property Registry — FindMaster",
  description:
    "Register and secure your devices, vehicles, and gadgets. Search the FindMaster registry to verify ownership before you buy.",
};

export default function RegistryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden border-b">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border bg-background/70 backdrop-blur-sm text-sm font-medium mb-6 text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            Africa&apos;s #1 Property Security Registry
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-tight">
            Secure Your Property{" "}
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-cyan-500">
              With Confidence.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Register your phones, laptops, cars, and more. Search any device's
            status before buying. Reduce theft, verify ownership, and trade with
            peace of mind.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <RegistrySearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg shadow-primary/20 border-0"
            >
              <Link href="/registry/register">
                <Shield className="mr-2 h-4 w-4" />
                Register a Property
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              <Link href="/registry/search">
                <Search className="mr-2 h-4 w-4" />
                Search Registry
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What You Can Secure */}
      <section className="py-16 bg-muted/20 border-b">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            What You Can Secure
          </p>
          <h2 className="text-3xl font-bold mb-10">
            Register Any Property With a Serial ID
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {deviceTypes.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground/80">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Generators, power tools, musical instruments, and any item with a
            unique serial number.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-4xl font-bold">How It Works</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <div key={step} className="relative">
              <div className="rounded-2xl border bg-card p-6 h-full space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-3xl font-black text-primary/20">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-8 -right-3 z-10">
                  <ArrowRight className="h-5 w-5 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/20 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Platform Features
            </p>
            <h2 className="text-4xl font-bold">
              Everything You Need to Stay Protected
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, color, title, desc }) => (
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

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-2xl">
          <ShieldCheck className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-extrabold mb-4">
            Register Your Properties Today
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of Nigerians protecting their assets on FindMaster.
            It takes less than 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
            >
              <Link href="/auth/signup">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-white/30 text-black hover:text-white hover:bg-white/10"
            >
              <Link href="/registry/search">Search Registry</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
