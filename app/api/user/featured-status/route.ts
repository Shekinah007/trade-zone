import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import FeaturedTier from "@/models/FeaturedTier";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import SystemSettings from "@/models/SystemSettings";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const settings = (await SystemSettings.findOne()) || {
      maxFeaturedSlots: 5,
    };

    const totalActiveFeatured = await Item.countDocuments({
      isListed: true,
      "listing.featuredStatus": "active",
    });

    const userActiveFeatured = await Item.find({
      owner: session.user.id,
      isListed: true,
      "listing.featuredStatus": "active",
    }).select(
      "model brand images listing.title listing.price listing.featuredExpiry listing.featuredAt",
    );

    const userWaitlist = await FeaturedWaitlist.find({ user: session.user.id })
      .populate("item", "model brand images listing.title listing.price")
      .populate("tier")
      .sort({ createdAt: -1 });

    const featuredTiers = await FeaturedTier.find().sort({ priceNGN: 1 });

    // Also need user's active listings to show in the dropdown for featuring
    const userListings = await Item.find({
      owner: session.user.id,
      isListed: true,
      "listing.status": "active",
      "listing.featuredStatus": { $ne: "active" },
    }).select("model brand images listing.title listing.price");

    return NextResponse.json({
      success: true,
      totalActiveFeatured,
      maxFeaturedSlots: settings.maxFeaturedSlots,
      userActiveFeatured,
      userWaitlist,
      featuredTiers,
      userListings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
