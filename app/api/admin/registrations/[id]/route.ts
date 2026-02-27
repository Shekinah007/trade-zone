import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json(); // "approve" | "reject"

  await dbConnect();

  if (action === "approve") {
    await User.findByIdAndUpdate(id, { status: "active" });
    return NextResponse.json({ message: "User approved" });
  }

  if (action === "reject") {
    await User.findByIdAndUpdate(id, { status: "banned" });
    return NextResponse.json({ message: "User rejected" });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}