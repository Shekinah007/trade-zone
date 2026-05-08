import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  await dbConnect();
  await Report.findByIdAndUpdate(id, { status });

  return NextResponse.json({ success: true });
}

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
