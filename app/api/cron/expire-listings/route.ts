import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Notification from "@/models/Notification";

// Use GET for simple cron trigger, though POST might be safer. Cron jobs usually hit GET.
export async function GET() {
  try {
    await dbConnect();
    const now = new Date();
    
    // Find all items where listing has expired and is not grandfathered
    const expiredItems = await Item.find({
      isListed: true,
      'listing.status': 'active',
      'listing.isGrandfathered': { $ne: true },
      'listing.expiresAt': { $lt: now }
    });

    if (expiredItems.length === 0) {
      return NextResponse.json({ message: "No expired listings found", count: 0 });
    }

    const updates = expiredItems.map(item => {
      item.listing!.status = 'expired';
      return item.save();
    });

    await Promise.all(updates);

    const notifications = expiredItems.map(item => ({
      userId: item.seller,
      title: "Listing Expired",
      message: `Your listing "${item.listing!.title}" has expired.`,
      type: "system",
      link: `/dashboard/listings`,
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ message: "Successfully expired listings", count: expiredItems.length });
  } catch (error: any) {
    console.error("Expire listings cron error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
