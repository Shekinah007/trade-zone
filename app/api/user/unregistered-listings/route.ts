import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const listings = await Listing.find({
      seller: session.user.id,
      $or: [{ propertyId: { $exists: false } }, { propertyId: null }]
    })
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json(listings, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching unregistered listings:", error);
    return NextResponse.json(
      { message: "Error fetching listings", error: error.message },
      { status: 500 }
    );
  }
}
