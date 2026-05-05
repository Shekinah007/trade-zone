import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendBoostExpiryEmail } from "@/lib/mail";

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
    }).populate('seller', 'name email');

    // Also, handle expired boosts: if boostExpiry < now, reset boostStatus to 'none'
    const expiredBoosts = await Item.find({
      isListed: true,
      'listing.boostStatus': 'active',
      'listing.boostExpiry': { $lt: now }
    });

    const expireUpdates = expiredBoosts.map(item => {
      const queue = item.listing?.boostQueue || [];
      if (queue.length > 0) {
        const nextBoost = queue.shift();
        item.listing!.boostStatus = 'active';
        item.listing!.boostedAt = now;
        item.listing!.boostExpiry = new Date(now.getTime() + (nextBoost?.durationInDays || 0) * 24 * 60 * 60 * 1000);
      } else {
        item.listing!.boostStatus = 'none';
        item.listing!.boostedAt = undefined;
      }
      return item.save();
    });

    await Promise.all(expireUpdates);

    if (expiringBoosts.length === 0 && expiredBoosts.length === 0) {
      return NextResponse.json({ message: "No boosts to process", count: 0 });
    }

    if (expiringBoosts.length > 0) {
      const notificationsToInsert = [];
      for (const item of expiringBoosts) {
        const queue = item.listing?.boostQueue || [];
        if (queue.length === 0) {
          const sellerId = (item.seller as any)?._id || item.seller;
          notificationsToInsert.push({
            userId: sellerId,
            title: "Boost Expiring Soon",
            message: `Your boost for "${item.listing!.title}" is expiring in less than 24 hours.`,
            type: "system",
            link: `/dashboard/boosts`,
          });

          const sellerEmail = (item.seller as any)?.email;
          const sellerName = (item.seller as any)?.name;
          if (sellerEmail) {
            await sendBoostExpiryEmail(
              sellerEmail,
              sellerName || "User",
              item.listing!.title || "your item"
            );
          }
        }
      }

      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }
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
