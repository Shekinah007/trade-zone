"use client";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const Logout = () => {
  return (
    <div
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-4 p-4 hover:bg-destructive/10 transition-colors group"
    >
      <div className="p-2.5 rounded-xl shrink-0 bg-destructive/10 text-destructive">
        <LogOut className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm text-destructive">Sign Out</p>
        <p className="text-xs text-muted-foreground">
          Sign out of your account
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-destructive/50 shrink-0 group-hover:translate-x-0.5 transition-all" />
    </div>
  );
};

export default Logout;
