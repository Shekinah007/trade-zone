import { NextResponse } from "next/server";
import Item from "@/models/Item";
import dbConnect from "@/lib/db";

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

    console.log(
      `Cron job: expired ${boostResult.modifiedCount} boosts, ${featuredResult.modifiedCount} featured listings`,
    );

    return NextResponse.json({
      success: true,
      boostsExpired: boostResult.modifiedCount,
      featuredExpired: featuredResult.modifiedCount,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
