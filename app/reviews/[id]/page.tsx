import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import { formatDistanceToNow } from "date-fns";

async function getSellerReviews(id: string) {
  await dbConnect();

  const [seller, reviews] = await Promise.all([
    User.findById(id).lean(),
    Review.find({ reviewee: id })
      .populate("reviewer", "name image")
      .populate("listing", "title")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!seller) return null;

  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
    : 0;

  // Rating breakdown (how many 1★, 2★, etc.)
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    percent: totalReviews
      ? Math.round((reviews.filter((r: any) => r.rating === star).length / totalReviews) * 100)
      : 0,
  }));

  return JSON.parse(JSON.stringify({ seller, reviews, totalReviews, averageRating, breakdown }));
}

function StarRow({ rating, filled }: { rating: number; filled: boolean }) {
  return (
    <Star
      className={`h-4 w-4 ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
    />
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarRow key={s} rating={s} filled={rating >= s} />
      ))}
    </div>
  );
}

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSellerReviews(id);
  if (!data) notFound();

  const { seller, reviews, totalReviews, averageRating, breakdown } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-12 border-b overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4">
          <Link
            href={`/store/${id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Store
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-16 w-16 ring-4 ring-primary/10">
              <AvatarImage src={seller.image} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {seller.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {seller.name}'s Reviews
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average score */}
          <Card>
            <CardContent className="p-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-6xl font-extrabold text-primary">
                  {totalReviews > 0 ? averageRating.toFixed(1) : "—"}
                </p>
                <StarDisplay rating={Math.round(averageRating)} />
                <p className="text-xs text-muted-foreground mt-1">
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
              <Separator orientation="vertical" className="h-24" />
              {/* Breakdown bars */}
              <div className="flex-1 space-y-2">
                {breakdown.map(({ star, count, percent }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-muted-foreground text-right">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-green-500">
                  {breakdown.find((b) => b.star === 5)?.count ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">5-Star Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold">
                  {totalReviews > 0
                    ? `${Math.round(
                        ((breakdown.find((b) => b.star >= 4)?.count ?? 0) +
                          (breakdown.find((b) => b.star === 5)?.count ?? 0)) /
                          totalReviews *
                          100
                      )}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Positive (4★+)</p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold">{totalReviews}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Reviews</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review list */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">All Reviews</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-3xl">
              <Star className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No reviews yet</p>
              <p className="text-muted-foreground">
                This seller hasn't received any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review._id}>
                  <CardContent className="p-5 space-y-3">
                    {/* Reviewer + rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={review.reviewer?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {review.reviewer?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{review.reviewer?.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StarDisplay rating={review.rating} />
                        <Badge variant="outline" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>
                    </div>

                    {/* Listing reference */}
                    {review.listing && (
                      <Link
                        href={`/listings/${review.listing._id}`}
                        className="inline-flex items-center text-xs text-primary hover:underline"
                      >
                        Re: {review.listing.title}
                      </Link>
                    )}

                    {/* Comment */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Seller response */}
                    {review.response && (
                      <div className="mt-2 pl-3 border-l-2 border-primary/30 bg-muted/30 rounded-r-lg p-3">
                        <p className="text-xs font-semibold text-primary mb-1">Seller's Response</p>
                        <p className="text-xs text-muted-foreground">{review.response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}