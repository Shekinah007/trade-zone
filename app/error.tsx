"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center relative overflow-hidden"
      >
        {/* Soft Background Glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Oops! Something went wrong
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            We apologize for the inconvenience. An unexpected error has occurred on our end. Please try refreshing the page.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-left overflow-auto text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
              <p className="font-mono font-bold mb-1 text-red-500">Error Details (Dev Only):</p>
              <p className="font-mono text-xs">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => reset()}
              className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all shadow-md"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="rounded-full px-6 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
