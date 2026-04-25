import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import Property from "@/models/Property";
import User from "@/models/User";
import TransferRequest from "@/models/TransferRequest";
import { sendTransferRequestEmail, sendRegistryUpsellEmail } from "@/lib/mail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { buyerEmail, salePrice } = await req.json();

    if (!buyerEmail) {
      return NextResponse.json(
        { error: "Buyer email is required." },
        { status: 400 },
      );
    }

    await dbConnect();

    // 1. Validate the Listing
    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 },
      );
    }

    if (listing.seller.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to sell this listing." },
        { status: 403 },
      );
    }

    if (listing.status === "sold") {
      return NextResponse.json(
        { error: "Listing is already marked as sold." },
        { status: 400 },
      );
    }

    const itemName =
      `${listing.brand || ""} ${listing.model || listing.title}`.trim();

    // 2. Scenario 1: Unregistered Listing (Upsell Phase)
    if (!listing.propertyId) {
      listing.status = "sold";
      await listing.save();

      try {
        await sendRegistryUpsellEmail(
          buyerEmail,
          itemName,
          listing._id.toString(),
        );
      } catch (err) {
        console.error("Failed to send upsell email, but proceeding with sale.");
      }

      return NextResponse.json(
        {
          message: "Item marked as sold. Buyer notified for Upsell.",
          type: "unregistered",
        },
        { status: 200 },
      );
    }

    // 3. Scenario 2: Registered Listing (Formal Transfer Handshake)
    const property = await Property.findById(listing.propertyId);
    if (!property) {
      return NextResponse.json(
        { error: "Linked property not found in registry." },
        { status: 404 },
      );
    }

    if (property.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Ownership mismatch on linked property." },
        { status: 403 },
      );
    }

    if (property.status === "transfer_pending") {
      return NextResponse.json(
        { error: "This property is already pending transfer." },
        { status: 400 },
      );
    }

    // Process Handshake logic
    const targetUser = await User.findOne({ email: buyerEmail.toLowerCase() });
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const transferReq = await TransferRequest.create({
      propertyId: property._id,
      listingId: listing._id,
      initiator: session.user.id,
      targetEmail: buyerEmail.toLowerCase(),
      targetUserId: targetUser ? targetUser._id : undefined,
      salePrice,
      status: "pending",
      token,
      expiresAt,
    });

    property.status = "transfer_pending";
    await property.save();

    // Update listing to sold
    listing.status = "sold";
    await listing.save();

    // Dispatch Email
    const sender = await User.findById(session.user.id);
    const senderName = sender?.name || "A user";

    await sendTransferRequestEmail(
      buyerEmail,
      token,
      itemName,
      senderName,
      !targetUser,
    );

    return NextResponse.json(
      {
        message: "Item marked as sold and transfer initiated.",
        type: "registered",
        transferRequestId: transferReq._id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Listing sell error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
