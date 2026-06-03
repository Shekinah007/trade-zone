import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import User from "@/models/User";
import Notification from "@/models/Notification";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import SystemSettings from "@/models/SystemSettings";
import { sendFeaturedExpiryEmail, sendFeaturedWaitlistEmail } from "@/lib/mail";
import { processFeaturedWaitlist } from "@/lib/featured";

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const settings = await SystemSettings.findOne();
    const maxSlots = settings?.maxFeaturedSlots || 5;

    // 1. Find all featured items expiring within the next 24 hours
    const expiringFeatured = await Item.find({
      isListed: true,
      'listing.featuredStatus': 'active',
      'listing.featuredExpiry': { $gte: now, $lt: tomorrow }
    }).populate('seller', 'name email');

    // 2. Handle expired featured: if featuredExpiry < now, reset featuredStatus to 'none'
    const expiredFeatured = await Item.find({
      isListed: true,
      'listing.featuredStatus': 'active',
      'listing.featuredExpiry': { $lt: now }
    });

    const expireUpdates = expiredFeatured.map(item => {
      item.listing!.featuredStatus = 'none';
      item.listing!.featuredAt = undefined;
      return item.save();
    });

    await Promise.all(expireUpdates);

    // Notifications for expiring
    if (expiringFeatured.length > 0) {
      const notificationsToInsert = [];
      for (const item of expiringFeatured) {
        const sellerId = (item.seller as any)?._id || item.seller;
        notificationsToInsert.push({
          userId: sellerId,
          title: "Featured Slot Expiring Soon",
          message: `Your featured slot for "${item.listing!.title}" is expiring in less than 24 hours.`,
          type: "system",
          link: `/dashboard/featured`,
        });

        const sellerEmail = (item.seller as any)?.email;
        const sellerName = (item.seller as any)?.name;
        if (sellerEmail) {
          await sendFeaturedExpiryEmail(
            sellerEmail,
            sellerName || "User",
            item.listing!.title || "your item"
          );
        }
      }

      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }
    }

    // 3. Handle expired waitlist entries (notified > 24h ago but didn't pay)
    // const expiredWaitlist = await FeaturedWaitlist.find({
    //   status: 'notified',
    //   notifiedAt: { $lt: yesterday }
    // });

    // for (const waitlist of expiredWaitlist) {
    //   waitlist.status = 'expired';
    //   await waitlist.save();
    // }

    const newlyFeaturedCount = await processFeaturedWaitlist();

    return NextResponse.json({
      message: "Successfully processed featured slots",
      expiringNotifiedCount: expiringFeatured.length,
      expiredCount: expiredFeatured.length,
      // waitlistExpiredCount: expiredWaitlist.length,
      waitlistNewlyFeaturedCount: newlyFeaturedCount
    });
  } catch (error: any) {
    console.error("Featured expiry cron error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
