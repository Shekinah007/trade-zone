"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Loader2, Eye, ShieldOff, ShieldAlert, Mail, MessageCircle, TrendingUp, Search, X } from "lucide-react";
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
import IncreaseQuotaDialog from "@/components/admin/IncreaseQuotaDialog";
import { toast } from "sonner";

type StatusAction = "suspended" | "banned" | "active" | null;

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ user: any; status: StatusAction }>({
    user: null, status: null,
  });
  const [quotaTarget, setQuotaTarget] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  const providers = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.provider && set.add(u.provider));
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Provider filter
    if (providerFilter !== "all") {
      result = result.filter((u) => u.provider === providerFilter);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "email-asc":
        result.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        break;
      case "email-desc":
        result.sort((a, b) => (b.email || "").localeCompare(a.email || ""));
        break;
    }

    return result;
  }, [users, search, statusFilter, roleFilter, providerFilter, sortBy]);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all" || roleFilter !== "all" || providerFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
    setProviderFilter("all");
    setSortBy("newest");
  };

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

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            {hasActiveFilters ? "No users match your filters." : "No users found."}
          </div>
        )}
        {filteredUsers.map((user: any) => (
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
              <div className="flex items-center gap-1 shrink-0">
                {/* Mobile contact buttons */}
                {user.email && (
                  <a
                    href={`mailto:${user.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                    title={`Email ${user.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {user.phone && (
                  <a
                    href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    title={`WhatsApp ${user.name}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
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
                    <DropdownMenuItem onClick={() => setQuotaTarget(user)}>
                      <TrendingUp className="mr-2 h-4 w-4 text-green-500" /> Increase Quota
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
      <div className="hidden md:block rounded-xl border  pt-0 p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead className="w-1/3">User</TableHead>
              <TableHead className="w-1/6">Role</TableHead>
              <TableHead className="w-1/6">Provider</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/6">Joined</TableHead>
              <TableHead className="w-1/6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {hasActiveFilters ? "No users match your filters." : "No users found."}
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((user: any) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    {/* Desktop contact buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      {user.email && (
                        <a
                          href={`mailto:${user.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                          title={`Email ${user.name}`}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {user.phone && (
                        <a
                          href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title={`WhatsApp ${user.name}`}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
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
                      <DropdownMenuItem onClick={() => setQuotaTarget(user)}>
                        <TrendingUp className="mr-2 h-4 w-4 text-green-500" /> Increase Quota
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

      {/* Increase Quota dialog */}
      <IncreaseQuotaDialog
        user={quotaTarget}
        open={!!quotaTarget}
        onOpenChange={(open) => !open && setQuotaTarget(null)}
        onSuccess={() => {
          // Refresh users list to show updated quota
          fetch("/api/admin/users")
            .then((r) => r.json())
            .then((data) => setUsers(data));
        }}
      />
    </div>
  );
}