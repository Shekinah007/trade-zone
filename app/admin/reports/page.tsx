// import dbConnect from "@/lib/db";
// import Report from "@/models/Report";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { MoreHorizontal } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// async function getReports() {
//   await dbConnect();
//   const reports = await Report.find()
//     .sort({ createdAt: -1 })
//     .populate("reporter", "name email")
//     .lean();
//   return JSON.parse(JSON.stringify(reports));
// }

// export default async function AdminReportsPage() {
//   const reports = await getReports();

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
//            <p className="text-muted-foreground">Review and resolve user reports.</p>
//         </div>
//       </div>
      
//       <div className="rounded-md border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Type</TableHead>
//               <TableHead>Reason</TableHead>
//               <TableHead>Reporter</TableHead>
//               <TableHead>Description</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {reports.map((report: any) => (
//               <TableRow key={report._id}>
//                 <TableCell className="capitalize">{report.itemType}</TableCell>
//                 <TableCell className="font-medium">{report.reason}</TableCell>
//                 <TableCell>
//                    <div className="flex flex-col">
//                       <span className="text-sm">{report.reporter?.name || "Unknown"}</span>
//                       <span className="text-xs text-muted-foreground">{report.reporter?.email}</span>
//                    </div>
//                 </TableCell>
//                 <TableCell className="max-w-[300px] truncate" title={report.description}>
//                    {report.description}
//                 </TableCell>
//                 <TableCell>
//                    <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'}>
//                      {report.status}
//                    </Badge>
//                 </TableCell>
//                 <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell className="text-right">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" className="h-8 w-8 p-0">
//                         <span className="sr-only">Open menu</span>
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                       <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
//                       <DropdownMenuItem>Dismiss Report</DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {reports.length === 0 && (
//                <TableRow>
//                   <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
//                      No reports found. Good job!
//                   </TableCell>
//                </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ActionType = "resolve" | "dismiss" | null;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ report: any; type: ActionType }>({ report: null, type: null });

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => { setReports(data); setLoading(false); });
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
        prev.map((r) => r._id === report._id ? { ...r, status: newStatus } : r)
      );
      toast.success(`Report ${newStatus}`);
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionTarget({ report: null, type: null });
    }
  };

  const statusBadge = (status: string) => {
    if (status === "pending") return <Badge variant="destructive">Pending</Badge>;
    if (status === "resolved") return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Resolved</Badge>;
    return <Badge variant="outline">Dismissed</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Review and resolve user reports.
          {pendingCount > 0 && (
            <span className="ml-2 text-destructive font-medium">{pendingCount} pending</span>
          )}
        </p>
      </div>

      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {reports.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            No reports found. Good job! 🎉
          </div>
        )}
        {reports.map((report: any) => (
          <div key={report._id} className="rounded-xl border bg-card p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize text-xs">{report.itemType}</Badge>
                {statusBadge(report.status)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={report.status !== "pending"}
                    onClick={() => setActionTarget({ report, type: "resolve" })}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={report.status !== "pending"}
                    onClick={() => setActionTarget({ report, type: "dismiss" })}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Dismiss Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reason */}
            <p className="font-semibold text-sm">{report.reason}</p>

            {/* Description */}
            {report.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
            )}

            {/* Reporter + date */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <span className="text-foreground font-medium">{report.reporter?.name || "Unknown"}</span>
                {report.reporter?.email && <span> · {report.reporter.email}</span>}
              </span>
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No reports found. Good job! 🎉
                </TableCell>
              </TableRow>
            )}
            {reports.map((report: any) => (
              <TableRow key={report._id}>
                <TableCell className="capitalize">{report.itemType}</TableCell>
                <TableCell className="font-medium">{report.reason}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{report.reporter?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{report.reporter?.email}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate" title={report.description}>
                  {report.description}
                </TableCell>
                <TableCell>{statusBadge(report.status)}</TableCell>
                <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={report.status !== "pending"}
                        onClick={() => setActionTarget({ report, type: "resolve" })}
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark as Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={report.status !== "pending"}
                        onClick={() => setActionTarget({ report, type: "dismiss" })}
                      >
                        <XCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Dismiss Report
                      </DropdownMenuItem>
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
        open={!!actionTarget.type}
        onOpenChange={(open) => !open && setActionTarget({ report: null, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget.type === "resolve" ? "Mark as Resolved" : "Dismiss Report"}
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
              className={actionTarget.type === "resolve"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : ""}
            >
              {actionTarget.type === "resolve" ? "Resolve" : "Dismiss"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}