import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
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
import { MoreHorizontal, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

async function getListings() {
  await dbConnect();
  const listings = await Listing.find()
    .sort({ createdAt: -1 })
    .populate("seller", "name email")
    .lean();
  return JSON.parse(JSON.stringify(listings));
}

export default async function AdminListingsPage() {
  const listings = await getListings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Listings</h2>
           <p className="text-muted-foreground">Moderate and manage platform listings.</p>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing: any) => (
              <TableRow key={listing._id}>
                <TableCell className="font-medium max-w-[200px] truncate" title={listing.title}>
                   {listing.title}
                </TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <span className="text-sm">{listing.seller?.name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{listing.seller?.email}</span>
                   </div>
                </TableCell>
                <TableCell>${listing.price}</TableCell>
                <TableCell>{listing.category?.name || "N/A"}</TableCell>
                <TableCell>
                   <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                     {listing.status}
                   </Badge>
                </TableCell>
                <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem asChild>
                         <Link href={`/listings/${listing._id}`} target="_blank">
                           <ExternalLink className="mr-2 h-4 w-4" /> View Listing
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Listing</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
