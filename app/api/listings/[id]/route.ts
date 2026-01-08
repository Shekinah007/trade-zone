import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const listing = await Listing.findById(params.id)
      .populate("seller", "name image email createdAt")
      .populate("category", "name slug");

    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    // Increment view count
    listing.views += 1;
    await listing.save();

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching listing" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const listing = await Listing.findById(params.id);

    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    if (listing.seller.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Listing.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting listing" }, { status: 500 });
  }
}
