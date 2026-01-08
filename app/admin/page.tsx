import dbConnect from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Report from "@/models/Report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, AlertTriangle, Activity } from "lucide-react";

async function getStats() {
  await dbConnect();
  const [userCount, listingCount, reportCount, activeListings] = await Promise.all([
     User.countDocuments(),
     Listing.countDocuments(),
     Report.countDocuments({ status: "pending" }),
     Listing.countDocuments({ status: "active" }),
  ]);

  return { userCount, listingCount, reportCount, activeListings };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, verified admin.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Users</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{stats.userCount}</div>
               <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
               <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{stats.listingCount}</div>
               <p className="text-xs text-muted-foreground">{stats.activeListings} active now</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
               <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-destructive">{stats.reportCount}</div>
               <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
               <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">+573</div>
               <p className="text-xs text-muted-foreground">New events this hour</p>
            </CardContent>
         </Card>
      </div>
      
      {/* Recent Activity or detailed charts could go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <Card className="col-span-4">
            <CardHeader>
               <CardTitle>Recent Listings</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-muted-foreground">List of recent listings will appear here.</p>
            </CardContent>
         </Card>
         <Card className="col-span-3">
             <CardHeader>
               <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-muted-foreground">List of new joined users will appear here.</p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
