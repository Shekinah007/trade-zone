import { NextResponse } from "next/server";
import Item from "@/models/Item";
import dbConnect from "@/lib/db";
import { processFeaturedWaitlist } from "@/lib/featured";

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();

    // 1. Expire boosts
    const boostResult = await Item.updateMany(
      {
        "listing.boostStatus": "active",
        "listing.boostExpiry": { $lt: now },
      },
      {
        $set: { "listing.boostStatus": "none" },
      },
    );

    // 2. Expire featured listings
    const featuredResult = await Item.updateMany(
      {
        "listing.featuredStatus": "active",
        "listing.featuredExpiry": { $lt: now },
      },
      {
        $set: {
          "listing.featuredStatus": "none",
          "listing.featured": false,
        },
      },
    );

    // 3. Process waitlist to fill any available slots
    let waitlistNewlyFeaturedCount = 0;
    if (featuredResult.modifiedCount > 0) {
      waitlistNewlyFeaturedCount = await processFeaturedWaitlist();
    }

    console.log(
      `Cron job: expired ${boostResult.modifiedCount} boosts, ${featuredResult.modifiedCount} featured listings, featured ${waitlistNewlyFeaturedCount} from waitlist`,
    );

    return NextResponse.json({
      success: true,
      boostsExpired: boostResult.modifiedCount,
      featuredExpired: featuredResult.modifiedCount,
      waitlistNewlyFeatured: waitlistNewlyFeaturedCount,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
