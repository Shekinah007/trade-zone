import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to view full property details." },
      { status: 401 },
    );
  }
  await dbConnect();
  const { id } = await params;

  const report = await Report.findById(id)
    .populate("reporter", "name email phone image")
    .populate("reportedItem")
    .lean();

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  const body = await req.json();

  const user = await User.findById(session.user.id);
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await Report.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}
