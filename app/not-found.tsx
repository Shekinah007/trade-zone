"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-10 text-center relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <FileQuestion className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            404
          </h1>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              asChild
              className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md w-full"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="rounded-full px-6 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full text-slate-700 dark:text-slate-300"
            >
              <Link href="/browse">
                <Search className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
