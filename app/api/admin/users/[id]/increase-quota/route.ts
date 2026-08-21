import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendQuotaIncreaseEmail } from "@/lib/mail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { amount, reason } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Reason must be at least 5 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Increase the listing quota
    const newQuota = (user.listingQuota || 0) + amount;
    user.listingQuota = newQuota;
    await user.save();

    // Create in-app notification
    await Notification.create({
      userId: user._id,
      title: "Listing Quota Increased",
      message: `Your listing quota has been increased by ${amount}. Your new quota is ${newQuota}. Reason: ${reason}`,
      type: "system",
      link: "/dashboard",
    });

    // Send email notification
    if (user.email) {
      await sendQuotaIncreaseEmail(
        user.email,
        user.name || "User",
        amount,
        newQuota,
        reason
      );
    }

    return NextResponse.json({
      success: true,
      message: `Quota increased by ${amount} for ${user.name}`,
      newQuota,
    });
  } catch (error: any) {
    console.error("Admin quota increase error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}