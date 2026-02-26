import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SavedListing from "@/models/SavedListing";

// GET — check if a listing is saved, or get all saved listings
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");

  await dbConnect();

  if (listingId) {
    const saved = await SavedListing.findOne({ user: session.user.id, listing: listingId });
    return NextResponse.json({ saved: !!saved });
  }

  const saved = await SavedListing.find({ user: session.user.id })
    .populate("listing")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(JSON.parse(JSON.stringify(saved)));
}

// POST — save a listing
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();
  await dbConnect();

  try {
    await SavedListing.create({ user: session.user.id, listing: listingId });
    return NextResponse.json({ saved: true });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ message: "Already saved" }, { status: 409 });
    }
    return NextResponse.json({ message: "Error saving listing" }, { status: 500 });
  }
}

// DELETE — unsave a listing
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();
  await dbConnect();

  await SavedListing.findOneAndDelete({ user: session.user.id, listing: listingId });
  return NextResponse.json({ saved: false });
}