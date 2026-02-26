import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const condition = searchParams.get("condition");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const filter: any = { status: "active" };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (condition) {
    filter.condition = condition;
  }

  const total = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    listings: JSON.parse(JSON.stringify(listings)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}