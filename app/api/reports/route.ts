import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reportedItem, itemType, description } = body;

    await dbConnect();

    const report = await Report.create({
      reporter: session.user.id,
      reportedItem,
      itemType,
      description,
      status: "pending",
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating report" }, { status: 500 });
  }
}
