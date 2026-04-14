"use client";

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
  Zap,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrySearchBar } from "@/components/RegistrySearchBar";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";

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
    color: "bg-red-500/10 text-red-600",
    title: "Property Registration",
    desc: "Register any item with a serial number, IMEI, or chassis number under your account for lifetime ownership proof.",
  },
  {
    icon: Search,
    color: "bg-rose-500/10 text-rose-600",
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
    color: "bg-orange-500/10 text-orange-600",
    title: "Ownership Transfer",
    desc: "Transfer ownership to a buyer after sale, complete with optional sale price, date, and location records.",
  },
  {
    icon: ShieldCheck,
    color: "bg-red-500/10 text-red-600",
    title: "Crime Deterrence",
    desc: "Thieves can't easily sell registered items. Every registered item creates a verifiable chain of custody.",
  },
  {
    icon: ClipboardList,
    color: "bg-rose-500/10 text-rose-600",
    title: "Full History Log",
    desc: "See the complete ownership history of any property, previous owners, transfer dates, sale prices, and locations.",
  },
];

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function RegistryPage() {
  const [activeStat, setActiveStat] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const stats = [
    { value: "50K+", label: "Registered Items", icon: Database },
    { value: "98%", label: "Recovery Rate", icon: CheckCircle2 },
    { value: "15K+", label: "Active Users", icon: Users },
    { value: "24/7", label: "Real-time Protection", icon: Zap },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar - Red Theme */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 z-50 origin-left"
        style={{ scaleX: smoothProgress }}
      />
      
      {/* Hero - Compact with Red Theme */}
      <motion.section 
        ref={heroRef}
        style={{ y: heroY, opacity, scale }}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background Orbs - Red */}
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
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
          className="absolute top-20 left-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
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
          className="absolute bottom-20 right-10 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl"
        />
        
        {/* Rotating Rings - Red */}
        <motion.div
          style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, 360]) }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-red-600/10 rounded-full"
        />
        <motion.div
          style={{ rotate: useTransform(scrollYProgress, [0, 1], [360, 0]) }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-red-600/20 rounded-full"
        />

        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              {/* Trust Badge - Red */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-600/20 bg-background/50 backdrop-blur-sm mb-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-rose-500 border-2 border-background"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-red-600">
                  Trusted by 15,000+ Nigerians
                </span>
              </motion.div>

              {/* Main Heading - Red Gradient */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
              >
                Secure Your{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-600">
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
                    className="absolute bottom-1 left-0 right-0 h-2 bg-red-600/20 blur-sm -z-0"
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
                    className="absolute -top-2 -right-6"
                  >
                    <ShieldCheck className="w-6 h-6 text-red-600" />
                  </motion.div>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base text-muted-foreground mb-6 max-w-lg"
              >
                Register your phones, laptops, cars, and more. Search any
                device's status before buying. Reduce theft, verify ownership,
                and trade with peace of mind.
              </motion.p>

              {/* Search Bar - Red */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-500/20 rounded-xl blur-xl" />
                  <RegistrySearchBar />
                </div>
              </motion.div>

              {/* CTA Buttons - Red */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  asChild
                  size="default"
                  className="group relative overflow-hidden rounded-full px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 shadow-lg shadow-red-600/20 border-0"
                >
                  <Link href="/registry/register">
                    <span className="relative z-10 flex items-center text-sm text-white">
                      <Shield className="mr-2 h-3.5 w-3.5" />
                      Register a Property
                      <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="rounded-full px-6 backdrop-blur-sm bg-background/50 text-sm border-red-600/30 hover:border-red-600 hover:bg-red-600/10"
                >
                  <Link href="/registry/search">
                    <Search className="mr-2 h-3.5 w-3.5" />
                    Search Registry
                  </Link>
                </Button>
              </motion.div>

              {/* Stats - Red Theme */}
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-red-600/10">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  const isActive = idx === activeStat;
                  return (
                    <motion.div
                      key={stat.label}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        opacity: isActive ? 1 : 0.7,
                      }}
                      className="text-center cursor-pointer"
                      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1.5 text-red-600" />
                      <div className="text-xl font-bold text-red-600">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Right Content - Animated Security Dashboard (Red Theme) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-rose-500/20 to-red-600/20 rounded-2xl blur-2xl" />
                
                <motion.div 
                  style={{ 
                    rotateY: useTransform(scrollYProgress, [0, 0.5], [0, 5]),
                    rotateX: useTransform(scrollYProgress, [0, 0.5], [0, 5]),
                  }}
                  className="relative bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl rounded-2xl border border-red-600/20 shadow-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-sm">Live Protection</span>
                    </div>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-500">Active</span>
                    </motion.div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {[
                      { label: "Items Protected", value: "50,234", change: "+12%", color: "red" },
                      { label: "Theft Reports", value: "127", change: "-8%", color: "red" },
                      { label: "Successful Checks", value: "15,892", change: "+23%", color: "green" },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5, transition: { duration: 0.2 } }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 backdrop-blur-sm border border-red-600/10 cursor-pointer"
                      >
                        <div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <div className="text-xl font-bold text-red-600">{item.value}</div>
                        </div>
                        <div className={`text-xs text-${item.color}-500 font-medium`}>
                          {item.change}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-red-600/10 pt-3">
                    <div className="text-xs font-semibold mb-2">Recent Activity</div>
                    <div className="space-y-1.5">
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
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {activity}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Red */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
          }}
        >
          <div className="w-5 h-8 border-2 border-red-600/30 rounded-full flex justify-center">
            <div className="w-1 h-1.5 bg-red-600 rounded-full mt-1.5 animate-bounce" />
          </div>
        </motion.div>
      </motion.section>

      {/* What You Can Secure - Red Theme */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-12 bg-muted/20 border-b border-red-600/10"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2"
          >
            What You Can Secure
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-6"
          >
            Register Any Property With a Serial ID
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {deviceTypes.map(({ icon: Icon, label }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-red-600/20 bg-card hover:border-red-600/40 hover:shadow-md cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-foreground/80">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Generators, power tools, musical instruments, and any item with a unique serial number.
          </motion.p>
        </div>
      </motion.section>

      {/* How It Works - Red Theme */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 container mx-auto px-4"
      >
        <div className="text-center mb-10">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2"
          >
            Simple Process
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold"
          >
            How It Works
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="relative cursor-pointer"
            >
              <div className="rounded-xl border border-red-600/20 bg-card p-4 h-full space-y-2 hover:shadow-md hover:border-red-600/40 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-2xl font-black text-red-600/20">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-6 -right-2 z-10">
                  <ArrowRight className="h-4 w-4 text-red-600/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Grid - Red Theme */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 bg-muted/20 border-y border-red-600/10"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2"
            >
              Platform Features
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold"
            >
              Everything You Need to Stay Protected
            </motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, color, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="rounded-xl border border-red-600/20 bg-card p-4 space-y-2 hover:shadow-md hover:border-red-600/40 cursor-pointer"
              >
                <div className={`p-2 rounded-lg w-fit ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA - Red Theme */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-red-600 to-rose-600 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
            animate={{
              y: [0, -150, 0],
              x: [0, (Math.random() - 0.5) * 80, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        <div className="container mx-auto px-4 text-center relative z-10 max-w-2xl">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ShieldCheck className="h-10 w-10 mx-auto mb-4 opacity-80" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold mb-3"
          >
            Register Your Properties Today
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/80 mb-6 text-base"
          >
            Join thousands of Nigerians protecting their assets on FindMaster.
            It takes less than 2 minutes.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Button
              asChild
              size="default"
              className="rounded-full px-6 bg-white text-red-600 hover:bg-white/90 font-bold shadow-lg group relative overflow-hidden"
            >
              <Link href="/auth/signup">
                <span className="relative z-10 flex items-center text-sm">
                  Get Started Free 
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </motion.div>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="rounded-full px-6 border-white/30 text-red-500 hover:text-white hover:bg-white/10 text-sm"
            >
              <Link href="/registry/search">Search Registry</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}