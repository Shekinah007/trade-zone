import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Notification from "@/models/Notification";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";

export async function PUT(
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

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json(
      { message: "Notification marked as read" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
