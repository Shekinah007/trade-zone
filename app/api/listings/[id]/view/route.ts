import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await dbConnect();

  // Don't count if the seller is viewing their own listing
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const listing = await Listing.findById(id).select("seller").lean() as any;
    if (listing?.seller?.toString() === session.user.id) {
      return NextResponse.json({ skipped: true });
    }
  }

  const cookieStore = await cookies();
  const cookieKey = `viewed_${id}`;

  if (cookieStore.get(cookieKey)) {
    return NextResponse.json({ skipped: true });
  }

  await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } });

  const res = NextResponse.json({ success: true });
  res.cookies.set(cookieKey, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return res;
}