import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import TransferRequest from "@/models/TransferRequest";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No transfer token provided." }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the pending transfer request
    const transferReq = await TransferRequest.findOne({
      token,
      status: "pending",
    });

    if (!transferReq) {
      return NextResponse.json(
        { error: "Invalid or expired transfer request." },
        { status: 404 }
      );
    }

    if (new Date() > new Date(transferReq.expiresAt)) {
      transferReq.status = "cancelled";
      await transferReq.save();
      
      // Unlock property
      await Property.findByIdAndUpdate(transferReq.propertyId, { status: "registered" });

      return NextResponse.json(
        { error: "This transfer request has expired." },
        { status: 400 }
      );
    }

    // 2. Security validation: Ensure logged-in user matches targetEmail
    // Ensure case match ignore
    if (session.user.email?.toLowerCase() !== transferReq.targetEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Your email does not match the transfer target." },
        { status: 403 }
      );
    }

    // 3. Process Transfer
    const property = await Property.findById(transferReq.propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property no longer exists." }, { status: 404 });
    }

    // Add previous owner record
    property.previousOwners.push({
      fromUser: property.owner,
      toUser: session.user.id,
      dateSold: new Date(),
      salePrice: transferReq.salePrice,
      transferredAt: new Date(),
    });

    // Update Property Ownership and Status
    property.owner = session.user.id;
    property.status = "registered";
    await property.save();

    // 4. Mark Request as Accepted
    transferReq.status = "accepted";
    transferReq.targetUserId = session.user.id;
    await transferReq.save();

    return NextResponse.json(
      { message: "Property transferred successfully!", propertyId: property._id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transfer accept error:", error);
    return NextResponse.json(
      { error: "Something went wrong during transfer." },
      { status: 500 }
    );
  }
}
