import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import User from "@/models/User";
import TransferRequest from "@/models/TransferRequest";
import { sendTransferRequestEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, targetEmail, salePrice, listingId } = await req.json();

    if (!propertyId || !targetEmail) {
      return NextResponse.json(
        { error: "Property ID and target email are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Verify Property Ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to transfer this property." },
        { status: 403 }
      );
    }

    if (property.status === "transfer_pending") {
      return NextResponse.json(
        { error: "This property is already pending transfer." },
        { status: 400 }
      );
    }

    // 2. Look up the receiver
    const targetUser = await User.findOne({ email: targetEmail.toLowerCase() });
    
    // 3. Generate Secure Token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 4. Create Transfer Request
    const transferReq = await TransferRequest.create({
      propertyId,
      listingId: listingId || undefined,
      initiator: session.user.id,
      targetEmail: targetEmail.toLowerCase(),
      targetUserId: targetUser ? targetUser._id : undefined,
      salePrice,
      status: "pending",
      token,
      expiresAt,
    });

    // 5. Lock Property Status
    property.status = "transfer_pending";
    await property.save();

    // 6. Send Dispatch Email
    const itemName = `${property.brand} ${property.model}`;
    const sender = await User.findById(session.user.id);
    const senderName = sender?.name || "A user";
    
    await sendTransferRequestEmail(
      targetEmail,
      token,
      itemName,
      senderName,
      !targetUser // isNewUser if no targetUser
    );

    return NextResponse.json(
      { message: "Transfer initiated successfully", transferRequestId: transferReq._id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transfer initiation error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
