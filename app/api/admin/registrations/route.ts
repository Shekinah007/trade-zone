import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const pending = await User.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(JSON.parse(JSON.stringify(pending)));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Must be logged in
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Only allow status change to pending from rejected or inactive states
  const allowedStatuses = ["rejected", "inactive"];
  if (!allowedStatuses.includes(user.status)) {
    return NextResponse.json(
      {
        message: `Cannot change status from '${user.status}' to 'pending'`,
      },
      { status: 400 },
    );
  }

  await User.findByIdAndUpdate(session.user.id, {
    status: "pending",
    $unset: { rejectionReason: "" },
  });

  return NextResponse.json({
    message: "Account status set to pending successfully",
  });
}
