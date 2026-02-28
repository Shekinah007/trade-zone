import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Business from "@/models/Business";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Building2,
  MapPin,
  Clock,
  Globe,
  CreditCard,
  Award,
  Link as LinkIcon,
  QrCode,
  AtSign,
} from "lucide-react";
import Link from "next/link";
import UserStatusManager from "@/components/admin/UserStatusManager";

async function getUserData(id: string) {
  await dbConnect();
  const [user, listings, business] = await Promise.all([
    User.findById(id).lean(),
    Listing.find({ seller: id }).sort({ createdAt: -1 }).lean(),
    Business.findOne({ owner: id }).lean(),
  ]);
  if (!user) return null;
  return JSON.parse(JSON.stringify({ user, listings, business }));
}

const statusBadge = (status: string) => {
  if (status === "active")
    return <Badge className="bg-green-500 hover:bg-green-500">Active</Badge>;
  if (status === "suspended")
    return <Badge variant="secondary">Suspended</Badge>;
  if (status === "pending")
    return <Badge className="bg-yellow-500 hover:bg-yellow-500">Pending</Badge>;
  return <Badge variant="destructive">Banned</Badge>;
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-muted shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUserData(id);
  if (!data) notFound();

  const { user, listings, business } = data;
  const activeListings = listings.filter((l: any) => l.status === "active");
  const soldListings = listings.filter((l: any) => l.status === "sold");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
      </Link>

      {/* Profile header */}
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
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              {statusBadge(user.status)}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <UserStatusManager user={user} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{listings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Listings</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {activeListings.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {soldListings.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Sold</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={AtSign} label="Provider" value={user.provider} />
            <InfoRow
              icon={Calendar}
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            />
            <InfoRow
              icon={Calendar}
              label="Last Updated"
              value={new Date(user.updatedAt).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            />
            {user.phone && (
              <InfoRow icon={Phone} label="Phone" value={user.phone} />
            )}
          </CardContent>
        </Card>

        {/* Business info */}
        {business ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Business
                  Profile
                </CardTitle>
                <Link
                  href={`/store/${user._id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View Store →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Business header */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                {business.image && (
                  <img
                    src={business.image}
                    alt={business.name}
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div>
                  <p className="font-semibold">{business.name}</p>
                  {business.type && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {business.type}
                    </p>
                  )}
                </div>
              </div>

              {business.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {business.description}
                </p>
              )}

              <Separator />

              <div className="space-y-3">
                {business.email && (
                  <InfoRow
                    icon={Mail}
                    label="Business Email"
                    value={business.email}
                  />
                )}
                {business.phone && (
                  <InfoRow
                    icon={Phone}
                    label="Business Phone"
                    value={business.phone}
                  />
                )}
                {business.address && (
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={business.address}
                  />
                )}
                {business.businessHours && (
                  <InfoRow
                    icon={Clock}
                    label="Business Hours"
                    value={business.businessHours}
                  />
                )}
              </div>

              {/* Categories */}
              {business.categories?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {business.categories.map((cat: string) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Socials */}
              {business.socials?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Social Links
                    </p>
                    <div className="space-y-2">
                      {business.socials.map((s: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium capitalize">
                            {s.name}:
                          </span>
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate text-xs"
                          >
                            {s.link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Bank Details */}
              {business.bankDetails?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Bank Details
                    </p>
                    <div className="space-y-2">
                      {business.bankDetails.map((b: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40"
                        >
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs font-medium">{b.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {b.account}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Certifications */}
              {business.certifications?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Certifications
                    </p>
                    <div className="space-y-1.5">
                      {business.certifications.map(
                        (cert: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Award className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                            <span>{cert}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* QR Code */}
              {business.qrCode && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      QR Code available
                    </span>
                    <a
                      href={business.qrCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline ml-auto"
                    >
                      View
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-sm">No Business Profile</p>
              <p className="text-xs text-muted-foreground mt-1">
                This user hasn't set up a business profile yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Listings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Listings</h2>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            This user has no listings yet.
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            {listings.map((listing: any, i: number) => (
              <div key={listing._id}>
                <Link
                  href={`/listings/${listing._id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {listing.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        listing.status === "active"
                          ? "bg-green-500/10 text-green-600"
                          : listing.status === "sold"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {listing.status}
                    </span>
                    <span className="font-bold text-sm text-primary">
                      ₦{listing.price?.toLocaleString()}
                    </span>
                  </div>
                </Link>
                {i < listings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
