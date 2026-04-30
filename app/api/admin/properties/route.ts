import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const properties = await Item.find({ isRegistered: true })
      .populate("owner", "name email image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Fetch properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
