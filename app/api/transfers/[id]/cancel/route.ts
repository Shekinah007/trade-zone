import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import TransferRequest from "@/models/TransferRequest";
import Item from "@/models/Item";
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

    const transferRequest = await TransferRequest.findById(id);
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

    if (transferRequest.fromUser.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You are not the sender of this transfer" },
        { status: 403 },
      );
    }

    const item = await Item.findById(transferRequest.itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Cancel logic
    transferRequest.status = "cancelled";
    await transferRequest.save();

    // Revert Property status
    item.ownershipStatus = "owned";
    await item.save();

    // Notify Receiver if they exist
    if (transferRequest.toUser) {
      const notification = new Notification({
        userId: transferRequest.toUser,
        title: "Transfer Cancelled",
        message: `${session.user.name} cancelled the transfer of ${item.brand} ${item.model}.`,
        type: "system",
      });
      await notification.save();
    }

    return NextResponse.json(
      { message: "Transfer cancelled successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Cancel transfer error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
