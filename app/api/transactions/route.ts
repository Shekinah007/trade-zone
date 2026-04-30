import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import Item from "@/models/Item";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { itemId, listingId, price } = body;
    const actualItemId = itemId || listingId;

    const item = await Item.findById(actualItemId);
    if (!item) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    // prevent buying own item
    if (item.owner.toString() === session.user.id) {
        return NextResponse.json({ message: "Cannot buy your own item" }, { status: 400 });
    }

    const transaction = await Transaction.create({
      buyer: session.user.id,
      seller: item.owner,
      item: actualItemId,
      price: price,
      status: 'pending'
    });
    
    // Optionally update listing status to sold?
    // listing.status = 'sold';
    // await listing.save(); 
    // User requested "history", so maybe the item can be resold? Or just track previous owners. 
    // For now, let's keep it simple and just record history. The "sold" status logic might block future sales if we do that strict check.
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
