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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, propertyId } = await req.json();

    if (!requestId && !propertyId) {
      return NextResponse.json(
        { error: "Must provide requestId or propertyId" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Find the pending transfer request
    const query = requestId 
        ? { _id: requestId, status: "pending" } 
        : { propertyId, status: "pending" };
        
    const transferReq = await TransferRequest.findOne(query);

    if (!transferReq) {
      return NextResponse.json(
        { error: "No pending transfer found." },
        { status: 404 }
      );
    }

    // 2. Security validation: Ensure logged-in user is the initiator (current owner)
    if (session.user.id !== transferReq.initiator.toString()) {
      return NextResponse.json(
        { error: "You are not authorized to cancel this transfer." },
        { status: 403 }
      );
    }

    // 3. Mark as cancelled
    transferReq.status = "cancelled";
    await transferReq.save();

    // 4. Unlock Property
    await Property.findByIdAndUpdate(transferReq.propertyId, { status: "registered" });

    return NextResponse.json(
      { message: "Transfer request cancelled successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transfer cancel error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
