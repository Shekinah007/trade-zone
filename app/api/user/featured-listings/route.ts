import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Item from "@/models/Item";
import FeaturedTier from "@/models/FeaturedTier";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import SystemSettings from "@/models/SystemSettings";
import Purchase from "@/models/Purchase";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingId, featuredTierId, paymentMethod, reference } =
      await req.json();

    if (!listingId || !featuredTierId || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    const tier = await FeaturedTier.findById(featuredTierId);
    const settings = await SystemSettings.findOne();

    if (!user || !tier || !settings) {
      return NextResponse.json(
        { error: "User, Tier, or Settings not found" },
        { status: 404 },
      );
    }

    // Verify listing belongs to user and is active
    const item = await Item.findOne({
      _id: listingId,
      $or: [{ seller: session.user.id }, { owner: session.user.id }],
      isListed: true,
      "listing.status": "active",
    });

    if (!item) {
      return NextResponse.json(
        { error: "Listing not found, invalid, or not active." },
        { status: 400 },
      );
    }

    if (item.listing?.featuredStatus === "active") {
      return NextResponse.json(
        { error: "Listing is already featured." },
        { status: 400 },
      );
    }

    // 1. Check if already on waitlist to prevent double charging
    const existingWaitlist = await FeaturedWaitlist.findOne({
      item: item._id,
      status: { $in: ["waiting", "notified"] },
    });
    if (existingWaitlist) {
      return NextResponse.json(
        { error: "Already on waitlist." },
        { status: 400 },
      );
    }

    // 2. Process payment FIRST
    if (paymentMethod === "credit") {
      if (user.creditBalance < tier.creditCost) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 400 },
        );
      }
      user.creditBalance -= tier.creditCost;
      await user.save();
    } else if (paymentMethod === "naira") {
      if (!reference)
        return NextResponse.json(
          { error: "Reference required for paystack payment" },
          { status: 400 },
        );

      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        },
      );
      const data = await response.json();

      if (!data.status || data.data.status !== "success") {
        if (process.env.NODE_ENV !== "development" || data.status) {
          return NextResponse.json(
            { error: "Transaction verification failed" },
            { status: 400 },
          );
        }
      }

      const amountPaidKobo = data.data ? data.data.amount : 0;
      const amountPaidNGN = amountPaidKobo / 100;

      if (
        process.env.NODE_ENV !== "development" &&
        amountPaidNGN < tier.priceNGN
      ) {
        return NextResponse.json(
          { error: "Amount paid is less than featured tier price" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    // 3. Check availability
    const activeSlots = await Item.countDocuments({
      "listing.featuredStatus": "active",
    });
    const maxSlots = settings.maxFeaturedSlots || 5;
    const now = new Date();

    if (activeSlots >= maxSlots) {
      // Add to waitlist
      await FeaturedWaitlist.create({
        user: user._id,
        item: item._id,
        tier: tier._id,
        status: "waiting",
      });

      // Create purchase record for the waitlist entry
      await Purchase.create({
        user: user._id,
        tierModel: "FeaturedTier",
        tier: tier._id,
        type: "featured",
        item: item._id,
        paymentMethod,
        amountPaid: paymentMethod === "credit" ? tier.creditCost : tier.priceNGN,
        status: "success",
        reference: reference || `waitlist_credit_${Date.now()}`,
        startDate: now,
        // No endDate since it's not active yet
      });

      return NextResponse.json({
        success: true,
        status: "waitlist",
        message:
          "Payment successful. All featured slots are currently taken. You have been added to the waitlist.",
      });
    }

    // 4. Activate featured
    const expiry = new Date(
      now.getTime() + tier.durationInDays * 24 * 60 * 60 * 1000,
    );

    if (!item.listing) item.listing = {};
    item.listing.featuredStatus = "active";
    item.listing.featuredAt = now;
    item.listing.featuredExpiry = expiry;
    await item.save();

    // Create purchase record
    await Purchase.create({
      user: user._id,
      tierModel: "FeaturedTier",
      tier: tier._id,
      type: "featured",
      item: item._id,
      paymentMethod,
      amountPaid: paymentMethod === "credit" ? tier.creditCost : tier.priceNGN,
      status: "success",
      reference: reference || `featured_credit_${Date.now()}`,
      startDate: now,
      endDate: expiry,
    });

    return NextResponse.json({
      success: true,
      status: "active",
      message: "Listing is now featured.",
    });
  } catch (error: any) {
    console.error("Featured listings error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
