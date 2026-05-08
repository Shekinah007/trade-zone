import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Item from "@/models/Item";
import FeaturedTier from "@/models/FeaturedTier";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import Purchase from "@/models/Purchase";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { waitlistId, paymentMethod, reference } = await req.json();

    if (!waitlistId || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    const waitlist = await FeaturedWaitlist.findById(waitlistId).populate('tier');

    if (!user || !waitlist) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }

    if (waitlist.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to waitlist" }, { status: 401 });
    }

    if (waitlist.status !== 'notified') {
      return NextResponse.json({ error: "Waitlist entry is not ready for payment" }, { status: 400 });
    }

    const tier = waitlist.tier as any; // populated
    const item = await Item.findById(waitlist.item);

    if (!item || !item.isListed || item.listing?.status !== 'active') {
      return NextResponse.json({ error: "Listing is no longer active" }, { status: 400 });
    }

    // Process payment
    if (paymentMethod === 'credit') {
      if (user.creditBalance < tier.creditCost) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
      }
      user.creditBalance -= tier.creditCost;
      await user.save();
    } else if (paymentMethod === 'naira') {
      if (!reference) return NextResponse.json({ error: "Reference required for paystack payment" }, { status: 400 });
      
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
         headers: { Authorization: `Bearer ${paystackSecret}` },
      });
      const data = await response.json();
      
      if (!data.status || data.data.status !== "success") {
         if (process.env.NODE_ENV !== "development" || data.status) {
           return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
         }
      }
      
      const amountPaidKobo = data.data ? data.data.amount : 0;
      const amountPaidNGN = amountPaidKobo / 100;
      
      if (process.env.NODE_ENV !== "development" && amountPaidNGN < tier.priceNGN) {
         return NextResponse.json({ error: "Amount paid is less than featured tier price" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Activate featured
    const now = new Date();
    const expiry = new Date(now.getTime() + tier.durationInDays * 24 * 60 * 60 * 1000);

    if (!item.listing) item.listing = {};
    item.listing.featuredStatus = 'active';
    item.listing.featuredAt = now;
    item.listing.featuredExpiry = expiry;
    await item.save();

    // Fulfill waitlist
    waitlist.status = 'fulfilled';
    await waitlist.save();

    // Create purchase record
    await Purchase.create({
      user: user._id,
      tierModel: 'FeaturedTier',
      tier: tier._id,
      type: 'featured',
      item: item._id,
      paymentMethod,
      amountPaid: paymentMethod === 'credit' ? tier.creditCost : tier.priceNGN,
      status: 'success',
      reference,
      startDate: now,
      endDate: expiry
    });

    return NextResponse.json({ success: true, message: "Checkout complete. Listing is now featured." });

  } catch (error: any) {
    console.error("Featured waitlist checkout error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
