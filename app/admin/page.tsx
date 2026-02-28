import dbConnect from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Report from "@/models/Report";
import Transaction from "@/models/Transaction";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import {
  Users, ShoppingBag, AlertTriangle, TrendingUp,
  ArrowRight, UserCheck, Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AdminCharts } from "@/components/admin/AdminCharts";

async function getDashboardData() {
  await dbConnect();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const pendingApprovals = await User.countDocuments({ status: "pending" });

  // Build monthly buckets for the last 6 months
  const monthlyUsers = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 }
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthlyListings = await Listing.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 }
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthlyTransactions = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 },
      revenue: { $sum: "$price" }
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Listing status breakdown
  const listingStatusBreakdown = await Listing.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // Fill in all 6 months (even empty ones)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      label: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    };
  });

  const chartData = months.map(({ label, year, month }) => ({
    month: label,
    users: monthlyUsers.find(u => u._id.year === year && u._id.month === month)?.count || 0,
    listings: monthlyListings.find(l => l._id.year === year && l._id.month === month)?.count || 0,
    transactions: monthlyTransactions.find(t => t._id.year === year && t._id.month === month)?.count || 0,
    revenue: monthlyTransactions.find(t => t._id.year === year && t._id.month === month)?.revenue || 0,
  }));

  const statusData = ["active", "sold", "expired", "inactive"].map(status => ({
    name: status,
    value: listingStatusBreakdown.find(s => s._id === status)?.count || 0,
  }));

  const [
    userCount, pendingUsers, listingCount,
    activeListings, soldListings, pendingReports,
    totalTransactions, recentListings, recentUsers, recentReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "pending" }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: "active" }),
    Listing.countDocuments({ status: "sold" }),
    Report.countDocuments({ status: "pending" }),
    Transaction.countDocuments(),
    Listing.find().sort({ createdAt: -1 }).limit(5)
      .populate("seller", "name image").populate("category", "name").lean(),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    Report.find({ status: "pending" }).sort({ createdAt: -1 }).limit(4)
      .populate("reporter", "name image").lean(),
  ]);

  return {
    userCount, pendingUsers, listingCount, activeListings,
    soldListings, pendingReports, totalTransactions,
    chartData, statusData,
    recentListings: JSON.parse(JSON.stringify(recentListings)),
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    recentReports: JSON.parse(JSON.stringify(recentReports)), pendingApprovals
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData();

  const listingStatusColor: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    sold: "bg-blue-500/10 text-blue-600",
    expired: "bg-orange-500/10 text-orange-600",
    inactive: "bg-muted text-muted-foreground",
  };

  const stats = [
    {
      label: "Total Users",
      value: data.userCount,
      sub: `${data.pendingUsers} pending`,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Listings",
      value: data.listingCount,
      sub: `${data.activeListings} active`,
      icon: ShoppingBag,
      href: "/admin/listings",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Pending Approvals",
      value: data.pendingApprovals,
      sub: `Users awaiting approval`,
      icon: UserCheck,
      href: "/admin/registrations",
      color: "text-yellow-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Pending Reports",
      value: data.pendingReports,
      sub: "Need review",
      icon: AlertTriangle,
      href: "/admin/reports",
      color: data.pendingReports > 0 ? "text-destructive" : "text-muted-foreground",
      bg: data.pendingReports > 0 ? "bg-destructive/10" : "bg-muted",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {session?.user?.name?.split(" ")[0]}.
          </p>
        </div>
        <Badge variant="outline" className="text-xs flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Compact stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon, href, color, bg }) => {
          const card = (
            <div className={`rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow ${href ? "cursor-pointer" : ""}`}>
              <div className={`p-2 rounded-lg shrink-0 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className="text-xl font-bold leading-tight">{value}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          );
          return href
            ? <Link key={label} href={href}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

      {/* Pending approval banner */}
      {data.pendingUsers > 0 && (
        <Link href="/admin/registrations">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <UserCheck className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {data.pendingUsers} user{data.pendingUsers !== 1 ? "s" : ""} awaiting approval
                </p>
                <p className="text-xs text-muted-foreground">Review registration requests</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-yellow-600 shrink-0" />
          </div>
        </Link>
      )}

      {/* Charts — client component */}
      <AdminCharts chartData={data.chartData} statusData={data.statusData} />

      {/* Bottom grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Recent Listings */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-5">
            <CardTitle className="text-sm font-semibold">Recent Listings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/listings" className="text-xs text-muted-foreground">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 pb-3">
            {data.recentListings.map((listing: any) => (
              <Link
                key={listing._id}
                href={`/listings/${listing._id}`}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center"><Package className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{listing.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {listing.seller?.name} · {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${listingStatusColor[listing.status] || ""}`}>
                    {listing.status}
                  </span>
                  <span className="text-sm font-bold text-primary">₦{listing.price?.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3 px-5">
              <CardTitle className="text-sm font-semibold">New Users</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users" className="text-xs text-muted-foreground">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 pb-3">
              {data.recentUsers.map((user: any) => (
                <Link
                  key={user._id}
                  href={`/admin/users/${user._id}`}
                  className="flex items-center gap-3 px-5 py-2 hover:bg-muted/40 transition-colors"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                    user.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-600"
                      : "bg-green-500/10 text-green-600"
                  }`}>
                    {user.status}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Pending Reports */}
          {data.recentReports.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  Pending Reports
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/reports" className="text-xs text-muted-foreground">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0 pb-3">
                {data.recentReports.map((report: any) => (
                  <div key={report._id} className="flex items-center gap-3 px-5 py-2">
                    <div className="p-1.5 rounded-lg bg-destructive/10 shrink-0">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize truncate">{report.reason || report.itemType}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.reporter?.name} · {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="px-5 pt-2">
                  <Button size="sm" variant="outline" className="w-full text-xs text-destructive border-destructive/20 hover:bg-destructive/10" asChild>
                    <Link href="/admin/reports">Review All</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}