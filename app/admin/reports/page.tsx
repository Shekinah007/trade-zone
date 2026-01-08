import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

async function getReports() {
  await dbConnect();
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .populate("reporter", "name email")
    .lean();
  return JSON.parse(JSON.stringify(reports));
}

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
           <p className="text-muted-foreground">Review and resolve user reports.</p>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell>
                   <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'}>
                     {report.status}
                   </Badge>
                </TableCell>
                <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                      <DropdownMenuItem>Dismiss Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
               <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                     No reports found. Good job!
                  </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
