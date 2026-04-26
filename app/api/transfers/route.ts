import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import dbConnect from '@/lib/mongoose';
import Property from "@/models/Property";
import User from "@/models/User";
import TransferRequest from "@/models/TransferRequest";
import Notification from "@/models/Notification";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { sendTransferRequestEmail, sendTransferClaimEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, receiverEmail, salePrice, notes } = body;

    if (!propertyId || !receiverEmail) {
      return NextResponse.json(
        { error: "Property ID and Receiver Email are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    if (property.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You do not own this property" },
        { status: 403 },
      );
    }

    if (property.status === "transfer_pending") {
      return NextResponse.json(
        { error: "Property is already in a transfer pending state" },
        { status: 400 },
      );
    }

    // Check if receiver exists
    const receiver = await User.findOne({ email: receiverEmail.toLowerCase() });

    // Create transfer request
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const token = receiver ? undefined : crypto.randomBytes(32).toString("hex");

    const transferRequest = new TransferRequest({
      propertyId,
      fromUser: session.user.id,
      toUser: receiver ? receiver._id : undefined,
      receiverEmail: receiverEmail.toLowerCase(),
      status: "pending",
      token,
      salePrice,
      notes,
      expiresAt,
    });

    await transferRequest.save();

    // Update Property status
    property.status = "transfer_pending";
    await property.save();

    // Create Notification or Send Email (Simulated)
    if (receiver) {
      const notification = new Notification({
        userId: receiver._id,
        title: "New Property Transfer Request",
        message: `${session.user.name || "A user"} wants to transfer ownership of ${property.brand} ${property.model} to you.`,
        type: "transfer_request",
        link: "/dashboard?tab=transfers",
      });
      await notification.save();

      // Send email
      await sendTransferRequestEmail(receiverEmail, session.user.name || "A user", `${property.brand} ${property.model}`);
    } else {
      await sendTransferClaimEmail(receiverEmail, session.user.name || "A user", `${property.brand} ${property.model}`, token as string);
    }

    return NextResponse.json(
      { message: "Transfer request created successfully", transferRequest },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Transfer initiation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const incoming = await TransferRequest.find({
      toUser: session.user.id,
      status: "pending",
    })
      .populate("fromUser", "name email")
      .populate("propertyId", "brand model images itemType")
      .sort({ createdAt: -1 });

    const outgoing = await TransferRequest.find({
      fromUser: session.user.id,
      status: "pending",
    })
      .populate("toUser", "name email")
      .populate("propertyId", "brand model images itemType")
      .sort({ createdAt: -1 });

    return NextResponse.json({ incoming, outgoing }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch transfers error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
