import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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