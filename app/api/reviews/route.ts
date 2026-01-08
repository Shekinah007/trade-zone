import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rating, comment, listingId, revieweeId } = body;

    if (!rating || !comment || !listingId || !revieweeId) {
       return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Verify listing and transaction logic here (omitted for brevity)
    
    const review = await Review.create({
      reviewer: session.user.id,
      reviewee: revieweeId,
      listing: listingId,
      rating,
      comment,
    });

    // Update User Rating Logic
    const reviews = await Review.find({ reviewee: revieweeId });
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      $set: { rating: avgRating },
      $inc: { reviewCount: 1 }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating review" }, { status: 500 });
  }
}
