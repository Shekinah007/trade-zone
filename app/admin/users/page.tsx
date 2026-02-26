"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, Eye, ShieldOff, ShieldAlert } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type StatusAction = "suspended" | "banned" | "active" | null;

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ user: any; status: StatusAction }>({
    user: null, status: null,
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  const handleStatusChange = async () => {
    const { user, status } = actionTarget;
    if (!user || !status) return;
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, status } : u)
      );
      toast.success(`User ${status === "active" ? "reactivated" : status}`);
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionTarget({ user: null, status: null });
    }
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Active</Badge>;
    if (status === "suspended") return <Badge variant="secondary">Suspended</Badge>;
    return <Badge variant="destructive">Banned</Badge>;
  };

  const actionLabel = () => {
    if (actionTarget.status === "banned") return { title: "Ban User", desc: "This will permanently ban the user from the platform.", btn: "Ban User", cls: "bg-destructive text-destructive-foreground hover:bg-destructive/90" };
    if (actionTarget.status === "suspended") return { title: "Suspend User", desc: "This will temporarily suspend the user's account.", btn: "Suspend", cls: "" };
    return { title: "Reactivate User", desc: "This will restore the user's access to the platform.", btn: "Reactivate", cls: "bg-green-500 hover:bg-green-600 text-white" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage user accounts and permissions · {users.length} total
        </p>
      </div>

      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {users.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            No users found.
          </div>
        )}
        {users.map((user: any) => (
          <div key={user._id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push(`/admin/users/${user._id}`)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.status === "active" ? (
                    <>
                      <DropdownMenuItem onClick={() => setActionTarget({ user, status: "suspended" })}>
                        <ShieldOff className="mr-2 h-4 w-4 text-yellow-500" /> Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActionTarget({ user, status: "banned" })} className="text-destructive">
                        <ShieldAlert className="mr-2 h-4 w-4" /> Ban User
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => setActionTarget({ user, status: "active" })}>
                      Reactivate User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              <Badge variant="outline" className="capitalize text-xs">{user.provider}</Badge>
              {statusBadge(user.status)}
              <span className="text-xs text-muted-foreground ml-auto">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user: any) => (
              <TableRow key={user._id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                </TableCell>
                <TableCell className="capitalize">{user.provider}</TableCell>
                <TableCell>{statusBadge(user.status)}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/admin/users/${user._id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "active" ? (
                        <>
                          <DropdownMenuItem onClick={() => setActionTarget({ user, status: "suspended" })}>
                            <ShieldOff className="mr-2 h-4 w-4 text-yellow-500" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setActionTarget({ user, status: "banned" })} className="text-destructive focus:text-destructive">
                            <ShieldAlert className="mr-2 h-4 w-4" /> Ban User
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={() => setActionTarget({ user, status: "active" })}>
                          Reactivate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!actionTarget.status}
        onOpenChange={(open) => !open && setActionTarget({ user: null, status: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabel().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionLabel().desc}{" "}
              <span className="font-semibold text-foreground">
                {actionTarget.user?.name}
              </span>{" "}
              ({actionTarget.user?.email})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} className={actionLabel().cls}>
              {actionLabel().btn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}