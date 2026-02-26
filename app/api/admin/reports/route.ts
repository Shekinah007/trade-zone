import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .populate("reporter", "name email")
    .lean();

  return NextResponse.json(JSON.parse(JSON.stringify(reports)));
}