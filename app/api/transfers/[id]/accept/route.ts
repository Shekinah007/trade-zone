import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import dbConnect from '@/lib/mongoose';
import TransferRequest from "@/models/TransferRequest";
import Property from "@/models/Property";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();

    const transferRequest =
      await TransferRequest.findById(id).populate("propertyId");
    if (!transferRequest) {
      return NextResponse.json(
        { error: "Transfer request not found" },
        { status: 404 },
      );
    }

    if (transferRequest.status !== "pending") {
      return NextResponse.json(
        { error: `Transfer request is already ${transferRequest.status}` },
        { status: 400 },
      );
    }

    if (transferRequest.toUser?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You are not the receiver of this transfer" },
        { status: 403 },
      );
    }

    const property = await Property.findById(transferRequest.propertyId);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Accept logic
    transferRequest.status = "accepted";
    await transferRequest.save();

    // Log the transfer in previousOwners
    property.previousOwners.push({
      fromUser: transferRequest.fromUser,
      toUser: session.user.id as any,
      dateSold: new Date(),
      salePrice: transferRequest.salePrice,
      notes: transferRequest.notes,
      transferredAt: new Date(),
    });

    // Update Property ownership
    property.owner = session.user.id as any;
    property.status = "registered";
    await property.save();

    // Notify Sender
    const notification = new Notification({
      userId: transferRequest.fromUser,
      title: "Transfer Accepted",
      message: `${session.user.name} accepted the transfer of ${property.brand} ${property.model}.`,
      type: "system",
      link: `/registry/${property._id}`,
    });
    await notification.save();

    return NextResponse.json(
      { message: "Transfer accepted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Accept transfer error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
