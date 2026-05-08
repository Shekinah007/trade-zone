import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Get active featured items
    const activeFeatured = await Item.find({
      isListed: true,
      'listing.featuredStatus': 'active'
    })
      .populate('seller', 'name email')
      .sort({ 'listing.featuredExpiry': 1 });

    // Get waitlist
    const waitlist = await FeaturedWaitlist.find()
      .populate('user', 'name email')
      .populate('item', 'listing.title')
      .populate('tier', 'name durationInDays priceNGN creditCost')
      .sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      activeFeatured: activeFeatured.map((item: any) => ({
        id: item._id,
        title: item.listing?.title,
        seller: item.seller,
        featuredAt: item.listing?.featuredAt,
        featuredExpiry: item.listing?.featuredExpiry,
      })),
      waitlist
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
