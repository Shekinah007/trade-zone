import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Item from "@/models/Item";
import User from "@/models/User";
import TransferRequest from "@/models/TransferRequest";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { sendTransferRequestEmail, sendTransferClaimEmail } from "@/lib/mail";

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
    const body = await req.json();
    const { buyerEmail, salePrice } = body;

    await dbConnect();

    const item = await Item.findById(id);
    if (!item || !item.isListed) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (item.seller?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!item.listing) item.listing = {};
    item.listing.status = "sold";
    
    let receiver = null;
    if (buyerEmail) {
      receiver = await User.findOne({ email: buyerEmail.toLowerCase() });
      if (receiver) {
        item.listing.buyerId = receiver._id;
      }
    }
    
    let transferRequestId = undefined;

    // Trigger Transfer logic if Item is registered
    if (item.isRegistered && buyerEmail) {
      if (item.ownershipStatus !== "transfer_pending") {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const token = receiver
          ? undefined
          : crypto.randomBytes(32).toString("hex");

        const transferRequest = new TransferRequest({
          itemId: item._id,
          fromUser: session.user.id,
          toUser: receiver ? receiver._id : undefined,
          receiverEmail: buyerEmail.toLowerCase(),
          status: "pending",
          token,
          salePrice: salePrice || item.listing.price,
          expiresAt,
        });
        await transferRequest.save();
        transferRequestId = transferRequest._id;

        item.ownershipStatus = "transfer_pending";

        if (receiver) {
          const notification = new Notification({
            userId: receiver._id,
            title: "New Property Transfer Request",
            message: `${session.user.name} wants to transfer ownership of ${item.brand} ${item.model} to you after your purchase.`,
            type: "transfer_request",
            link: "/dashboard?tab=transfers",
          });
          await notification.save();

          await sendTransferRequestEmail(buyerEmail, session.user.name || "A user", `${item.brand} ${item.model}`);
        } else {
          await sendTransferClaimEmail(buyerEmail, session.user.name || "A user", `${item.brand} ${item.model}`, token as string);
        }
      }
    } else if (!item.isRegistered && receiver) {
      // Upsell Notification for standard items
      const notification = new Notification({
        userId: receiver._id,
        title: "Secure your new purchase!",
        message: `Congratulations on your new ${item.listing.title}! Did you know this item is currently unregistered? Secure your new asset in the Global Registry for free.`,
        type: "upsell",
        link: `/registry/register?itemId=${item._id}`,
      });
      await notification.save();
    }

    await item.save();

    // Create Transaction Record
    if (receiver) {
      const transaction = new Transaction({
        buyer: receiver._id,
        seller: session.user.id,
        item: item._id,
        price: salePrice || item.listing.price,
        status: "seller_confirmed",
        transferRequestId,
      });
      await transaction.save();
    }

    return NextResponse.json(
      { message: "Listing marked as sold successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Mark as sold error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
