import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";

export async function GET(
  req: Request,
    context: { params: Promise<{ id: string }> }

) {
  try {
    await dbConnect();
    const {id} =  await context.params
    
    const stats = await Review.aggregate([
      { $match: { reviewee: id } }, // Match strictly by string ID if stored that way, or ObjectId if casted. Mongoose aggregate usually needs ObjectId if stored as such.
      // However, params.id is string. Let's cast it securely.
    ]);
    
    // Simpler find first to avoid aggregation complexity issues blindly
    const reviews = await Review.find({ reviewee: id })
      .populate("reviewer", "name image")
      .sort({ createdAt: -1 });

    const totalRatings = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
