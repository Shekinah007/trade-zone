"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldOff, ShieldAlert, ShieldCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function UserStatusManager({ user }: { user: any }) {
  const router = useRouter();
  const [pending, setPending] = useState<"suspended" | "banned" | "active" | null>(null);

  const apply = async () => {
    if (!pending) return;
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pending }),
      });
      if (!res.ok) throw new Error();
      toast.success(`User ${pending === "active" ? "reactivated" : pending}`);
      router.refresh();
    } catch {
      toast.error("Action failed.");
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="shrink-0">
            Manage User <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user.status !== "active" && (
            <DropdownMenuItem onClick={() => setPending("active")}>
              <ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> Reactivate
            </DropdownMenuItem>
          )}
          {user.status !== "suspended" && (
            <DropdownMenuItem onClick={() => setPending("suspended")}>
              <ShieldOff className="mr-2 h-4 w-4 text-yellow-500" /> Suspend
            </DropdownMenuItem>
          )}
          {user.status !== "banned" && (
            <DropdownMenuItem onClick={() => setPending("banned")} className="text-destructive focus:text-destructive">
              <ShieldAlert className="mr-2 h-4 w-4" /> Ban User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending === "banned" ? "Ban User" : pending === "suspended" ? "Suspend User" : "Reactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending === "banned" && "This will permanently ban "}
              {pending === "suspended" && "This will temporarily suspend "}
              {pending === "active" && "This will restore access for "}
              <span className="font-semibold text-foreground">{user.name}</span>.
              {pending !== "active" && " They will lose access to the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={apply}
              className={
                pending === "banned" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" :
                pending === "active" ? "bg-green-500 hover:bg-green-600 text-white" : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}