import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find all items where boost is active and expiring within the next 24 hours
    // To avoid spamming, we could add a field to check if notified, but for simplicity we'll just send it if it's within 24h and exactly > 23h (or handle it with a lastNotified timestamp if needed in the future).
    // Let's assume this runs daily, so any boost expiring between now and tomorrow gets notified.
    const expiringBoosts = await Item.find({
      isListed: true,
      'listing.boostStatus': 'active',
      'listing.boostExpiry': { $gte: now, $lt: tomorrow }
    });

    // Also, handle expired boosts: if boostExpiry < now, reset boostStatus to 'none'
    const expiredBoosts = await Item.find({
      isListed: true,
      'listing.boostStatus': 'active',
      'listing.boostExpiry': { $lt: now }
    });

    const expireUpdates = expiredBoosts.map(item => {
      item.listing!.boostStatus = 'none';
      return item.save();
    });

    await Promise.all(expireUpdates);

    if (expiringBoosts.length === 0 && expiredBoosts.length === 0) {
      return NextResponse.json({ message: "No boosts to process", count: 0 });
    }

    if (expiringBoosts.length > 0) {
      const notifications = expiringBoosts.map(item => ({
        userId: item.seller,
        title: "Boost Expiring Soon",
        message: `Your boost for "${item.listing!.title}" is expiring in less than 24 hours.`,
        type: "system",
        link: `/dashboard/listings`,
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ 
        message: "Successfully processed boosts", 
        notifiedCount: expiringBoosts.length,
        expiredCount: expiredBoosts.length 
    });
  } catch (error: any) {
    console.error("Boost expiry cron error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
