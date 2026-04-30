import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const items = await Item.find({
      owner: session.user.id,
      isListed: true,
      isRegistered: false
    })
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching unregistered items:", error);
    return NextResponse.json(
      { message: "Error fetching items", error: error.message },
      { status: 500 }
    );
  }
}
