import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SearchLog from "@/models/SearchLog";

// Models must be registered
import "@/models/User";
import "@/models/Property";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all logs ordered by newest first
    // Limit to 500 for performance
    const logs = await SearchLog.find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("user", "name email image")
      .populate("propertyId", "itemType brand model serialNumber")
      .lean();

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Admin Search Logs Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search logs" },
      { status: 500 }
    );
  }
}
