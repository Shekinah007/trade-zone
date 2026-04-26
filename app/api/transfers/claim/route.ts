import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import dbConnect from '@/lib/mongoose';
import TransferRequest from "@/models/TransferRequest";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await dbConnect();

    const transferRequest = await TransferRequest.findOne({
      token,
      status: "pending",
    });
    if (!transferRequest) {
      return NextResponse.json(
        { error: "Invalid or expired transfer token" },
        { status: 404 },
      );
    }

    // Associate the transfer with the user
    transferRequest.toUser = session.user.id as any;
    // Clear the token so it can't be used again
    transferRequest.token = undefined;
    await transferRequest.save();

    return NextResponse.json(
      {
        message:
          "Transfer request claimed successfully. It now appears in your dashboard.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Claim transfer error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
