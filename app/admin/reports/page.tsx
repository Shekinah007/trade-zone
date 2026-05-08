"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  MoreHorizontal,
  Flag,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

// shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ActionType = "resolve" | "dismiss" | null;

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{
    report: any;
    type: ActionType;
  }>({ report: null, type: null });
  const [filter, setFilter] = useState<
    "all" | "pending" | "resolved" | "dismissed"
  >("all");

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load reports");
        setLoading(false);
      });
  }, []);

  const handleAction = async () => {
    const { report, type } = actionTarget;
    if (!report || !type) return;

    const newStatus = type === "resolve" ? "resolved" : "dismissed";

    try {
      const res = await fetch(`/api/admin/reports/${report._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setReports((prev) =>
        prev.map((r) =>
          r._id === report._id ? { ...r, status: newStatus } : r,
        ),
      );
      toast.success(`Report ${newStatus}`);
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionTarget({ report: null, type: null });
    }
  };

  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "destructive",
      icon: Flag,
      className: "",
    },
    resolved: {
      label: "Resolved",
      variant: "default",
      className: "bg-green-500 hover:bg-green-500",
      icon: CheckCircle,
    },
    dismissed: {
      label: "Dismissed",
      variant: "outline",
      icon: XCircle,
      className: "",
    },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-muted-foreground mt-2">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and moderate user reports
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs
        defaultValue="all"
        value={filter}
        onValueChange={(v) => setFilter(v as any)}
      >
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Empty state */}
      {filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-2xl bg-muted/10">
          <Flag className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No reports found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {filter === "all"
              ? "All clear! No reports have been filed yet."
              : `No ${filter} reports at the moment.`}
          </p>
        </div>
      )}

      {/* Reports Grid - Mobile first, responsive cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report: any) => {
          const reporter = report.reporter || {};
          const status = report.status;
          const isPending = status === "pending";

          return (
            <Card
              key={report._id}
              className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={reporter.image} alt={reporter.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {reporter.name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm leading-tight">
                      {reporter.name || "Unknown user"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reporter.email || "No email"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/reports/${report._id}`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" /> View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!isPending}
                        onClick={() =>
                          setActionTarget({ report, type: "resolve" })
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                        Mark as resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!isPending}
                        onClick={() =>
                          setActionTarget({ report, type: "dismiss" })
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                        Dismiss report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Flag className="h-3 w-3" />
                    <span className="font-medium">Item type:</span>
                    <span className="capitalize">{report.itemType}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span className="font-medium">Reason:</span>
                    <span className="line-clamp-1">
                      {report.reason || "No reason provided"}
                    </span>
                  </div>
                </div>

                {report.description && (
                  <div className="rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground border">
                    <p className="line-clamp-2">{report.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={report.createdAt}>
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => router.push(`/admin/reports/${report._id}`)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Inspect
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!actionTarget.type}
        onOpenChange={(open) =>
          !open && setActionTarget({ report: null, type: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget.type === "resolve"
                ? "Mark as Resolved"
                : "Dismiss Report"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget.type === "resolve"
                ? "This will mark the report as resolved. This action can't be undone."
                : "This will dismiss the report. This action can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                actionTarget.type === "resolve"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : ""
              }
            >
              {actionTarget.type === "resolve" ? "Resolve" : "Dismiss"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
