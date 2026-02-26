import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import UserStatusManager from "@/components/admin/UserStatusManager";

async function getUserData(id: string) {
  await dbConnect();
  const [user, listings] = await Promise.all([
    User.findById(id).lean(),
    Listing.find({ seller: id }).sort({ createdAt: -1 }).lean(),
  ]);
  if (!user) return null;
  return JSON.parse(JSON.stringify({ user, listings }));
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUserData(id);
  if (!data) notFound();

  const { user, listings } = data;
  const activeListings = listings.filter((l: any) => l.status === "active");

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-green-500 hover:bg-green-500">Active</Badge>;
    if (status === "suspended") return <Badge variant="secondary">Suspended</Badge>;
    return <Badge variant="destructive">Banned</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
      </Link>

      {/* Profile Card */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-primary/10">
            <AvatarImage src={user.image} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              {statusBadge(user.status)}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{user.phone}</span>}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Status manager — client component */}
          <UserStatusManager user={user} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{listings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Listings</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{activeListings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Listings</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold capitalize">{user.provider}</p>
          <p className="text-xs text-muted-foreground mt-1">Auth Provider</p>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Listings</h2>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            This user has no listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing: any) => (
              <ListingCard
                key={listing._id}
                id={listing._id}
                title={listing.title}
                price={listing.price}
                image={listing.images?.[0]}
                category={listing.category}
                condition={listing.condition}
                location={listing.location}
                createdAt={listing.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}