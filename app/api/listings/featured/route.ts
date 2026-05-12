import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { Types } from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const now = new Date();

    // Expire stale featured listings
    await Item.updateMany(
      {
        "listing.featuredStatus": "active",
        "listing.featuredExpiry": { $lte: now },
      },
      { $set: { "listing.featuredStatus": "none" } },
    );

    const match: any = {
      isListed: true,
      "listing.status": "active",
      "listing.featuredStatus": "active",
      "listing.featuredExpiry": { $gt: now },
    };

    if (category) {
      try {
        match["listing.category"] = new Types.ObjectId(category);
      } catch {
        // invalid id format — return empty result rather than crash
        return NextResponse.json({ items: [], total: 0, page, pages: 0 });
      }
    }

    const [items, total] = await Promise.all([
      Item.aggregate([
        { $match: match },

        // Boosted items bubble up within featured
        {
          $addFields: {
            boostPriority: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$listing.boostStatus", "active"] },
                    { $gt: ["$listing.boostExpiry", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },

        {
          $sort: { boostPriority: -1, "listing.featuredAt": -1, createdAt: -1 },
        },
        { $skip: skip },
        { $limit: limit },

        // Populate seller
        {
          $lookup: {
            from: "users",
            localField: "seller",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },

        // Populate category
        {
          $lookup: {
            from: "categories",
            localField: "listing.category",
            foreignField: "_id",
            as: "categoryData",
          },
        },
        {
          $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true },
        },

        {
          $addFields: {
            seller: {
              _id: "$seller._id",
              name: "$seller.name",
              image: "$seller.image",
            },
            "listing.category": {
              _id: "$categoryData._id",
              name: "$categoryData.name",
              slug: "$categoryData.slug",
              icon: "$categoryData.icon",
            },
          },
        },

        { $project: { categoryData: 0, boostPriority: 0 } },
      ]),

      Item.countDocuments(match),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Featured listings error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch featured listings" },
      { status: 500 },
    );
  }
}
