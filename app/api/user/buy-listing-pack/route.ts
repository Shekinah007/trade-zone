import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import ListingPack from "@/models/ListingPack";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packId, paymentMethod, reference } = await req.json();

    if (!packId || !paymentMethod) {
      return NextResponse.json({ error: "Pack ID and Payment Method are required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    const pack = await ListingPack.findById(packId);

    if (!user || !pack) {
      return NextResponse.json({ error: "User or Pack not found" }, { status: 404 });
    }

    if (paymentMethod === 'credit') {
      if (user.creditBalance < pack.creditCost) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
      }
      user.creditBalance -= pack.creditCost;
      user.listingQuota += pack.slotCount;
      await user.save();
      return NextResponse.json({ success: true, message: "Pack purchased with credits", listingQuota: user.listingQuota });
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
       
       if (process.env.NODE_ENV !== "development" && amountPaidNGN < pack.priceNGN) {
          return NextResponse.json({ error: "Amount paid is less than pack price" }, { status: 400 });
       }

       user.listingQuota += pack.slotCount;
       await user.save();
       return NextResponse.json({ success: true, message: "Pack purchased via Paystack", listingQuota: user.listingQuota });
    } else {
       return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Buy listing pack error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
