"use client"

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
  CheckCircle2,
  Database,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrySearchBar } from "@/components/RegistrySearchBar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

  const stats = [
    { value: "50K+", label: "Registered Items", icon: Database },
    { value: "98%", label: "Recovery Rate", icon: CheckCircle2 },
    { value: "15K+", label: "Active Users", icon: Users },
    { value: "24/7", label: "Real-time Protection", icon: Zap },
  ];



// export const metadata = {
//   title: "Property Registry — FindMaster",
//   description:
//     "Register and secure your devices, vehicles, and gadgets. Search the FindMaster registry to verify ownership before you buy.",
// };

export default function RegistryPage() {
    const [scrolled, setScrolled] = useState(false);
  const [activeStat, setActiveStat] = useState(0);

    useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
       <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-primary/10 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/20 rounded-full"
        />

        {/* Floating Shields Background */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute text-primary/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          >
            <Shield size={40 + i * 10} />
          </motion.div>
        ))}

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 backdrop-blur-sm mb-8"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 border-2 border-background"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  Trusted by 15,000+ Nigerians
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight"
              >
                Secure Your{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-cyan-500">
                    Property
                  </span>
                  <motion.div
                    animate={{
                      scaleX: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                    className="absolute bottom-2 left-0 right-0 h-3 bg-primary/20 blur-sm -z-0"
                  />
                </span>
                <br />
                <span className="relative">
                  With Confidence
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute -top-2 -right-8"
                  >
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </motion.div>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-md md:text-lg text-muted-foreground mb-8 max-w-lg"
              >
                Register your phones, laptops, cars, and more. Search any
                device's status before buying. Reduce theft, find missing items, verify ownership,
                and trade with peace of mind.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur-xl" />
                  <RegistrySearchBar />
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden rounded-full px-8 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg shadow-primary/20 border-0"
                >
                  <Link href="/registry/register">
                    <span className="relative z-10 flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Register a Property
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 backdrop-blur-sm bg-background/50"
                >
                  <Link href="/registry/search">
                    <Search className="mr-2 h-4 w-4" />
                    Search Registry
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-4 border-t"
              >
                {stats?.map((stat, idx) => {
                  const Icon = stat.icon;
                  const isActive = idx === activeStat;
                  return (
                    <motion.div
                      key={stat.label}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        opacity: isActive ? 1 : 0.7,
                      }}
                      className="text-center"
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Right Content - Animated Security Dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Glowing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl rounded-3xl border shadow-2xl p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Live Protection</span>
                    </div>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-500">Active</span>
                    </motion.div>
                  </div>

                  {/* Animated Status Cards */}
                  <div className="space-y-4 mb-6">
                    {[
                      { label: "Items Protected", value: "50,234", change: "+12%", color: "primary" },
                      { label: "Theft Reports", value: "127", change: "-8%", color: "red" },
                      { label: "Successful Checks", value: "15,892", change: "+23%", color: "green" },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-background/50 backdrop-blur-sm border"
                      >
                        <div>
                          <div className="text-sm text-muted-foreground">{item.label}</div>
                          <div className="text-2xl font-bold">{item.value}</div>
                        </div>
                        <div className={`text-sm text-${item.color}-500 font-medium`}>
                          {item.change}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold mb-3">Recent Activity</div>
                    <div className="space-y-2">
                      {[
                        "iPhone 14 Pro • Registered",
                        "Toyota Camry • Checked",
                        "MacBook Pro • Verified",
                      ].map((activity, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {activity}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-primary/30 rounded-full"
                      animate={{
                        y: [0, -100, 0],
                        x: [0, (Math.random() - 0.5) * 50, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-primary rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
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
