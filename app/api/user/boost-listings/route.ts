import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Item from "@/models/Item";
import BoostTier from "@/models/BoostTier";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingIds, boostTierId, paymentMethod, reference } = await req.json();

    if (!listingIds || !listingIds.length || !boostTierId || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    const tier = await BoostTier.findById(boostTierId);

    if (!user || !tier) {
      return NextResponse.json({ error: "User or Boost Tier not found" }, { status: 404 });
    }

    // Verify listings belong to user and are active
    const listings = await Item.find({
      _id: { $in: listingIds },
      $or: [{ seller: session.user.id }, { owner: session.user.id }],
      isListed: true,
      'listing.status': 'active'
    });

    if (listings.length !== listingIds.length) {
       return NextResponse.json({ error: "Some listings are invalid, not yours, or not active." }, { status: 400 });
    }

    const totalCreditCost = tier.creditCost * listingIds.length;
    const totalPriceNGN = tier.priceNGN * listingIds.length;

    if (paymentMethod === 'credit') {
      if (user.creditBalance < totalCreditCost) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
      }
      user.creditBalance -= totalCreditCost;
      await user.save();
    } else if (paymentMethod === 'paystack') {
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
       
       if (process.env.NODE_ENV !== "development" && amountPaidNGN < totalPriceNGN) {
          return NextResponse.json({ error: "Amount paid is less than total boost price" }, { status: 400 });
       }
    } else {
       return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Apply boosts
    const boostExpiry = new Date(Date.now() + tier.durationInDays * 24 * 60 * 60 * 1000);
    const updates = listings.map(item => {
        item.listing!.boostStatus = 'active';
        item.listing!.boostExpiry = boostExpiry;
        return item.save();
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: `Boosted ${listings.length} listings successfully.` });

  } catch (error: any) {
    console.error("Boost listings error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
