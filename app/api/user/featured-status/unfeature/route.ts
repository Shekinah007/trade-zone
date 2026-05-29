import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await dbConnect();

    // The user unfeaturing must be the owner or seller of the item
    const item = await Item.findOne({
      _id: itemId,
      $or: [{ owner: session.user.id }, { seller: session.user.id }],
      "listing.featuredStatus": "active"
    });

    if (!item) {
      return NextResponse.json(
        { error: "Featured item not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Unfeature
    item.listing.featuredStatus = "none";
    item.listing.featured = false;
    item.listing.featuredExpiry = undefined;
    item.listing.featuredAt = undefined;

    await item.save();

    return NextResponse.json({
      success: true,
      message: "Item successfully unfeatured.",
    });
  } catch (error: any) {
    console.error("User unfeature error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
