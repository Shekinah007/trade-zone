import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Notification from "@/models/Notification";
import { sendItemUnfeaturedEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, reason } = body;

    if (!itemId || !reason) {
      return NextResponse.json(
        { error: "Item ID and reason are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await Item.findOne({
      _id: itemId,
      "listing.featuredStatus": "active",
    }).populate("seller owner");

    if (!item) {
      return NextResponse.json(
        { error: "Featured item not found" },
        { status: 404 }
      );
    }

    // Unfeature
    item.listing.featuredStatus = "none";
    item.listing.featured = false;
    item.listing.featuredExpiry = undefined;
    item.listing.featuredAt = undefined;

    await item.save();

    const targetUser = item.seller || item.owner;

    // Send notification
    if (targetUser) {
      await Notification.create({
        userId: targetUser._id,
        title: "Item Unfeatured by Admin",
        message: `Your item '${
          item.listing.title || item.model
        }' has been removed from featured listings. Reason: ${reason}`,
        type: "system",
        link: `/market/${item._id}`,
      });

      // Send Email
      if (targetUser.email) {
        await sendItemUnfeaturedEmail(
          targetUser.email,
          targetUser.name || "User",
          item.listing.title || item.model,
          reason
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Item successfully unfeatured.",
    });
  } catch (error: any) {
    console.error("Admin unfeature error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
