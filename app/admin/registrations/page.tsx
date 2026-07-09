"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Loader2, UserCheck, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type ActionType = "approve" | "reject" | "restore" | null;
type TabValue = "pending" | "rejected";

export default function RegistrationsPage() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("pending");
  const [actionTarget, setActionTarget] = useState<{
    user: any;
    action: ActionType;
  }>({
    user: null,
    action: null,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations");
      const data = await res.json();
      setAllUsers(data);
    } catch {
      toast.error("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Adjust the status check below to match your schema
  // (e.g. user.status === "rejected" vs a separate user.rejected boolean)
  const pendingUsers = useMemo(
    () => allUsers.filter((u) => u.status === "pending" || !u.status),
    [allUsers],
  );
  const rejectedUsers = useMemo(
    () => allUsers.filter((u) => u.status === "rejected"),
    [allUsers],
  );

  const handleAction = async () => {
    const { user, action } = actionTarget;
    if (!user || !action) return;

    console.log("action", action);

    const nextStatus =
      action === "approve" ? "approved" : action === "reject" ? "rejected" : "restore";

    try {
      const res = await fetch(`/api/admin/registrations/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: nextStatus,
          email: user.email,
          userName: user.name,
        }),
      });


      if (!res.ok) throw new Error();

      // Update local state to reflect new status instead of removing outright
      setAllUsers((prev) =>
        action === "approve"
          ? prev.filter((u) => u._id !== user._id) // approved users leave this view entirely
          : prev.map((u) =>
            u._id === user._id ? { ...u, status: nextStatus } : u,
          ),
      );

      const messages: Record<string, string> = {
        approve: `${user.name} approved!`,
        reject: `${user.name} rejected`,
        restore: `${user.name} moved back to pending`,
      };
      toast.success(messages[action]);
      window.location.reload(); 
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionTarget({ user: null, action: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  const renderUserCardsMobile = (list: any[], tab: TabValue) => (
    <div className="space-y-3 md:hidden">
      {list.map((user: any) => (
        <div key={user._id} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {user.provider}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {tab === "pending" ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setActionTarget({ user, action: "approve" })}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setActionTarget({ user, action: "reject" })}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setActionTarget({ user, action: "restore" })}
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Restore to Pending
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  const renderUserTableDesktop = (list: any[], tab: TabValue) => (
    <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">
              User
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Provider
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Registered
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {list.map((user: any) => (
            <tr key={user._id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="capitalize">
                  {user.provider}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {tab === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white h-8"
                        onClick={() =>
                          setActionTarget({ user, action: "approve" })
                        }
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8"
                        onClick={() =>
                          setActionTarget({ user, action: "reject" })
                        }
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() =>
                        setActionTarget({ user, action: "restore" })
                      }
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEmptyState = (tab: TabValue) => (
    <div className="text-center py-20 border-2 border-dashed rounded-3xl">
      <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-lg font-medium">
        {tab === "pending" ? "All caught up!" : "No rejected requests"}
      </p>
      <p className="text-muted-foreground">
        {tab === "pending"
          ? "No pending registration requests."
          : "Rejected registrations will show up here."}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Registration Requests
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve new user registrations
          </p>
        </div>
        {pendingUsers.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pendingUsers.length} pending
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejectedUsers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {rejectedUsers.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingUsers.length === 0 ? (
            renderEmptyState("pending")
          ) : (
            <>
              {renderUserCardsMobile(pendingUsers, "pending")}
              {renderUserTableDesktop(pendingUsers, "pending")}
            </>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedUsers.length === 0 ? (
            renderEmptyState("rejected")
          ) : (
            <>
              {renderUserCardsMobile(rejectedUsers, "rejected")}
              {renderUserTableDesktop(rejectedUsers, "rejected")}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!actionTarget.action}
        onOpenChange={(open) =>
          !open && setActionTarget({ user: null, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget.action === "approve" && "Approve Registration"}
              {actionTarget.action === "reject" && "Reject Registration"}
              {actionTarget.action === "restore" && "Restore Registration"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget.action === "approve" &&
                "This will grant full access to "}
              {actionTarget.action === "reject" &&
                "This will permanently reject the registration for "}
              {actionTarget.action === "restore" &&
                "This will move the registration for "}
              <span className="font-semibold text-foreground">
                {actionTarget.user?.name}
              </span>{" "}
              ({actionTarget.user?.email})
              {actionTarget.action === "reject" &&
                " and they will not be able to sign in."}
              {actionTarget.action === "restore" && " back to pending review."}
              {actionTarget.action === "approve" && "."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                actionTarget.action === "approve"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : actionTarget.action === "reject"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
              }
            >
              {actionTarget.action === "approve" && "Approve"}
              {actionTarget.action === "reject" && "Reject"}
              {actionTarget.action === "restore" && "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}