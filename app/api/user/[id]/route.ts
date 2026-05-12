import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Item from "@/models/Item";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const user = await User.findById(id).lean();

  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify(user)));
}
