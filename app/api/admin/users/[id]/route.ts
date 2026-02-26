import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const [user, listings] = await Promise.all([
    User.findById(id).lean(),
    Listing.find({ seller: id }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify({ user, listings })));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await dbConnect();

  const updated = await User.findByIdAndUpdate(id, body, { new: true }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(updated)));
}