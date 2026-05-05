import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Item from "@/models/Item";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // Find active listings belonging to the current user
    const listings = await Item.find({
      $or: [{ owner: session.user.id }, { seller: session.user.id }],
      isListed: true,
      'listing.status': 'active'
    }).sort({ 'listing.listedAt': -1 });

    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    console.error("Error fetching active listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
