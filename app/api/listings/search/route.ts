import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";

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

  const filter: any = { isListed: true, "listing.status": "active" };

  if (q) {
    filter.$or = [
      { "listing.title": { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } },
      { model: { $regex: q, $options: "i" } },
    ];
  }

  if (category) {
    filter["listing.category"] = category;
  }

  if (minPrice || maxPrice) {
    filter["listing.price"] = {};
    if (minPrice) filter["listing.price"].$gte = Number(minPrice);
    if (maxPrice) filter["listing.price"].$lte = Number(maxPrice);
  }

  if (condition) {
    filter["listing.condition"] = condition;
  }

  const total = await Item.countDocuments(filter);
  const listings = await Item.find(filter)
    .sort({ "listing.boostStatus": 1, createdAt: -1 })
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