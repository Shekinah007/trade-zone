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
    const { receiverEmail } = body;

    if (!receiverEmail) {
      return NextResponse.json(
        { error: "Receiver Email are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if receiver exists
    const receiver = await User.findOne({ email: receiverEmail.toLowerCase() });

    if (receiver) {
      return NextResponse.json({ receiver }, { status: 200 });
    } else {
      return NextResponse.json(
        {
          message:
            "No FindMaster account is associated with this email. Upon transfer, the recipient will be sent a secure claim link. Please ensure the email provided is correct.",
        },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("Transfer initiation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
