import Item from "@/models/Item";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import SystemSettings from "@/models/SystemSettings";
import Notification from "@/models/Notification";
import Purchase from "@/models/Purchase";
import { sendFeaturedWaitlistEmail } from "@/lib/mail";

export async function processFeaturedWaitlist() {
  const now = new Date();
  const settings = await SystemSettings.findOne();
  const maxSlots = settings?.maxFeaturedSlots || 5;

  const activeSlotsCount = await Item.countDocuments({ "listing.featuredStatus": "active" });

  let availableSlots = maxSlots - activeSlotsCount;

  let newlyFeaturedCount = 0;
  if (availableSlots > 0) {
    // Find the top N waiting users
    const waitingList = await FeaturedWaitlist.find({ status: { $in: ["waiting", "notified"] } })
      .sort({ createdAt: 1 })
      .limit(availableSlots)
      .populate("user", "name email")
      .populate("item")
      .populate("tier");

    const notificationsToInsert = [];
    for (const waitlist of waitingList) {
      const user = waitlist.user as any;
      const item = waitlist.item as any;
      const tier = waitlist.tier as any;

      if (!item || !item.isListed || item.listing?.status !== "active") {
        waitlist.status = "expired";
        await waitlist.save();
        continue;
      }

      const expiry = new Date(now.getTime() + (tier?.durationInDays || 7) * 24 * 60 * 60 * 1000);

      if (!item.listing) item.listing = {};
      item.listing.featuredStatus = "active";
      item.listing.featuredAt = now;
      item.listing.featuredExpiry = expiry;
      await item.save();

      waitlist.status = "fulfilled";
      waitlist.notifiedAt = now;
      await waitlist.save();

      // await Purchase.create({
      //   user: user._id,
      //   tierModel: "FeaturedTier",
      //   tier: tier?._id,
      //   type: "featured",
      //   item: item._id,
      //   paymentMethod: "waitlist_claim",
      //   amountPaid: 0,
      //   status: "success",
      //   reference: `waitlist_${waitlist._id}`,
      //   startDate: now,
      //   endDate: expiry,
      // });

      newlyFeaturedCount++;

      notificationsToInsert.push({
        userId: user._id,
        title: "Item Promoted to Featured!",
        message: `Great news! Your waitlisted item "${item.listing?.title}" is now featured. No payment required.`,
        type: "system",
        link: `/dashboard/featured`,
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

  return newlyFeaturedCount;
}
