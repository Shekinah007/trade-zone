import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TransferRequest from "@/models/TransferRequest";
import Property from "@/models/Property"; // Needed for population

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();

    const [incoming, outgoing] = await Promise.all([
      // Incoming: where the current user is the target via email or userId
      TransferRequest.find({
        $or: [
          { targetEmail: session.user.email.toLowerCase() },
          { targetUserId: session.user.id }
        ],
        status: "pending",
        expiresAt: { $gt: now },
      }).populate("propertyId", "brand model itemType images").lean(),

      // Outgoing: where the current user is the initiator
      TransferRequest.find({
        initiator: session.user.id,
        status: "pending",
        // Even if expired, let's include it so they can cancel or it shows as expired, 
        // but for simplicity let's stick to active pending requests
        expiresAt: { $gt: now },
      }).populate("propertyId", "brand model itemType images").lean(),
    ]);

    return NextResponse.json({ incoming, outgoing }, { status: 200 });
  } catch (error: any) {
    console.error("Pending transfers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
