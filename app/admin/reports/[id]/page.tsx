"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  XCircle,
  RefreshCw,
  ExternalLink,
  User,
  Package,
  Flag,
} from "lucide-react";

interface Report {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
  };
  reportedItem: {
    _id: string;
    owner: string;
    brand: string;
    model: string;
    description: string;
    images: string[];
    uniqueIdentifier: string;
    isRegistered: boolean;
    isListed: boolean;
    seller: string;
    listing: {
      title: string;
      price: number;
      category: string;
      condition: string;
      location: any;
      status: "active" | "sold" | "expired" | "inactive";
      featured: boolean;
      views: number;
      listedAt: string;
    };
    previousOwners: any[];
    createdAt: string;
    updatedAt: string;
  };
  itemType: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  report: {
    pending: {
      label: "Pending",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    reviewed: {
      label: "Reviewed",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    resolved: {
      label: "Resolved",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    dismissed: {
      label: "Dismissed",
      icon: XCircle,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  },
  item: {
    active: {
      label: "Active",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    sold: {
      label: "Sold",
      icon: CheckCircle2,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    expired: {
      label: "Expired",
      icon: Clock,
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    inactive: {
      label: "Inactive",
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200",
    },
  },
};

const ReportDetails = () => {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingReportStatus, setUpdatingReportStatus] = useState(false);
  const [updatingItemStatus, setUpdatingItemStatus] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      setReport(data);
      setError(null);
    } catch (err) {
      setError("Unable to load report details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (params.id) fetchReport();
  }, [params.id]);

  const updateReportStatus = async (newStatus: Report["status"]) => {
    if (!report) return;
    setUpdatingReportStatus(true);
    try {
      const response = await fetch(`/api/admin/reports/${report._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update report status");
      await fetchReport();
    } catch (err) {
      setError("Failed to update report status");
    } finally {
      setUpdatingReportStatus(false);
    }
  };

  const updateItemStatus = async (
    newStatus: "active" | "sold" | "expired" | "inactive",
  ) => {
    if (!report) return;
    setUpdatingItemStatus(true);
    try {
      const response = await fetch(`/api/listings/${report.reportedItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update item status");
      await fetchReport();
    } catch (err) {
      setError("Failed to update item status");
    } finally {
      setUpdatingItemStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReport}
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6 text-center text-muted-foreground">
        Report not found
      </div>
    );
  }

  const reportStatus = statusConfig.report[report.status];
  const ReportIcon = reportStatus.icon;
  const itemCurrentStatus = report?.reportedItem?.listing?.status;
  const itemStatus = statusConfig.item[itemCurrentStatus];
  const ItemIcon = itemStatus?.icon;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Details</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage the reported content
          </p>
        </div>
        <Button variant="outline" onClick={fetchReport}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Report Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Report Information
            </CardTitle>
            <CardDescription>
              ID: {report._id} • Created {formatDate(report.createdAt)}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={reportStatus.color}>
                <ReportIcon className="h-3 w-3 mr-1" />
                {reportStatus.label}
              </Badge>
            </div>
            <Select
              value={report.status}
              onValueChange={(val) =>
                updateReportStatus(val as Report["status"])
              }
              disabled={updatingReportStatus}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            {updatingReportStatus && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Updating...
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Report Description</h4>
            <p className="text-sm whitespace-pre-wrap">{report.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="font-medium">Item Type:</span>{" "}
              <span className="capitalize">{report.itemType}</span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {formatDate(report.updatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Reporter Details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={report.reporter.image}
              alt={report.reporter.name}
            />
            <AvatarFallback>
              {report.reporter.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-lg">{report.reporter.name}</p>
            <p className="text-sm text-muted-foreground">
              {report.reporter.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {report.reporter.phone}
            </p>
            <Button variant="link" asChild className="px-0 h-auto">
              <Link href={`/admin/users/${report.reporter._id}`}>
                View full profile <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reported Item Card */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Reported Item
            </CardTitle>
            <CardDescription>
              Item ID: {report.reportedItem._id}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className={itemStatus.color}>
              <ItemIcon className="h-3 w-3 mr-1" />
              {itemStatus.label}
            </Badge>
            <Select
              value={itemCurrentStatus}
              onValueChange={(val) => updateItemStatus(val as any)}
              disabled={updatingItemStatus}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {updatingItemStatus && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Updating...
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images */}
          {report.reportedItem.images &&
            report.reportedItem.images.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Images</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {report.reportedItem.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Item ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-md border shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column: basic info */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Listing Title</h4>
                <p className="text-sm">{report.reportedItem.listing.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-medium text-sm">Brand</h4>
                  <p className="text-sm">{report.reportedItem.brand}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Model</h4>
                  <p className="text-sm">{report.reportedItem.model}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm">Price</h4>
                <p className="text-sm font-semibold">
                  ${report.reportedItem.listing.price.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Condition</h4>
                <p className="text-sm capitalize">
                  {report.reportedItem.listing.condition}
                </p>
              </div>
            </div>

            {/* Right column: extra details */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Unique Identifier</h4>
                <p className="text-sm font-mono">
                  {report.reportedItem.uniqueIdentifier}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-medium text-sm">Registered</h4>
                  <Badge
                    variant={
                      report.reportedItem.isRegistered ? "default" : "secondary"
                    }
                  >
                    {report.reportedItem.isRegistered ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Listed</h4>
                  <Badge
                    variant={
                      report.reportedItem.isListed ? "default" : "secondary"
                    }
                  >
                    {report.reportedItem.isListed ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm">Listed At</h4>
                <p className="text-sm">
                  {formatDate(report.reportedItem.listing.listedAt)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Views</h4>
                <p className="text-sm">{report.reportedItem.listing.views}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-sm mb-1">Item Description</h4>
            <p className="text-sm text-muted-foreground">
              {report.reportedItem.description}
            </p>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href={`/admin/users/${report.reportedItem.owner}`}>
                View Item Owner Profile
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetails;
