import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import User from "@/models/User";
import Notification from "@/models/Notification";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import SystemSettings from "@/models/SystemSettings";
import { sendFeaturedExpiryEmail, sendFeaturedWaitlistEmail } from "@/lib/mail";

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
    const expiredWaitlist = await FeaturedWaitlist.find({
      status: 'notified',
      notifiedAt: { $lt: yesterday }
    });

    for (const waitlist of expiredWaitlist) {
      waitlist.status = 'expired';
      await waitlist.save();
    }

    // 4. Fill available slots from waitlist
    const activeSlotsCount = await Item.countDocuments({ 'listing.featuredStatus': 'active' });
    const notifiedWaitlistCount = await FeaturedWaitlist.countDocuments({ status: 'notified' });
    
    let availableSlots = maxSlots - (activeSlotsCount + notifiedWaitlistCount);

    let newlyNotifiedCount = 0;
    if (availableSlots > 0) {
      // Find the top N waiting users
      const waitingList = await FeaturedWaitlist.find({ status: 'waiting' })
        .sort({ createdAt: 1 })
        .limit(availableSlots)
        .populate('user', 'name email')
        .populate('item', 'listing.title');

      const notificationsToInsert = [];
      for (const waitlist of waitingList) {
        waitlist.status = 'notified';
        waitlist.notifiedAt = now;
        await waitlist.save();
        newlyNotifiedCount++;

        const user = waitlist.user as any;
        const item = waitlist.item as any;

        notificationsToInsert.push({
          userId: user._id,
          title: "Featured Slot Available!",
          message: `A featured slot is now available for your listing "${item.listing?.title}". You have 24 hours to confirm.`,
          type: "system",
          link: `/dashboard/featured/checkout?waitlistId=${waitlist._id}`,
        });

        if (user.email) {
          await sendFeaturedWaitlistEmail(
            user.email,
            user.name || "User",
            item.listing?.title || "your item",
            waitlist._id.toString()
          );
        }
      }

      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }
    }

    return NextResponse.json({ 
        message: "Successfully processed featured slots", 
        expiringNotifiedCount: expiringFeatured.length,
        expiredCount: expiredFeatured.length,
        waitlistExpiredCount: expiredWaitlist.length,
        waitlistNewlyNotifiedCount: newlyNotifiedCount
    });
  } catch (error: any) {
    console.error("Featured expiry cron error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
