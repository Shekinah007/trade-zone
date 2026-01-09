import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { rating, comment, listingId, revieweeId } = body;

    const review = await Review.create({
      reviewer: session.user.id,
      reviewee: revieweeId,
      listing: listingId,
      rating,
      comment
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
