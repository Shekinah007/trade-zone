import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { v2 as cloudinary } from "cloudinary";

import Category from "@/models/Category";
import User from "@/models/User";
import SystemSettings from "@/models/SystemSettings";
import Notification from "@/models/Notification";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    // Basic Filtering
    const category = searchParams.get("category");
    const query: any = { isListed: true, "listing.status": "active" };

    if (category) {
      query["listing.category"] = category;
    }

    // const items = await Item.find(query)
    //   .populate("seller", "name image")
    //   .populate("listing.category", "name slug")
    //   .sort({ "listing.boostStatus": 1, "listing.featuredStatus": 1, "listing.boostedAt": -1, "listing.featuredAt": -1, createdAt: -1 });

    const now = new Date();

    // expire old boosts
    await Item.updateMany(
      {
        "listing.boostStatus": "active",
        "listing.boostExpiry": { $lte: now },
      },
      {
        $set: {
          "listing.boostStatus": "none",
        },
      },
    );

    // expire old featured listings
    await Item.updateMany(
      {
        "listing.featuredStatus": "active",
        "listing.featuredExpiry": { $lte: now },
      },
      {
        $set: {
          "listing.featuredStatus": "none",
        },
      },
    );

    const items = await Item.aggregate([
      {
        $match: query,
      },

      // boost priority
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

          featuredPriority: {
            $cond: [
              {
                $and: [
                  { $eq: ["$listing.featuredStatus", "active"] },
                  { $gt: ["$listing.featuredExpiry", now] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },

      // sorting
      {
        $sort: {
          boostPriority: -1,
          featuredPriority: -1,
          "listing.boostedAt": -1,
          "listing.featuredAt": -1,
          createdAt: -1,
        },
      },

      // populate seller
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },

      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },

      // populate category
      {
        $lookup: {
          from: "categories",
          localField: "listing.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // reshape populated fields
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
          },
        },
      },
    ]);

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching listings" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const condition = formData.get("condition") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    const uniqueIdentifier = formData.get("uniqueIdentifier") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;

    const imageFiles = formData.getAll("images") as File[];
    const existingImages = formData.getAll("existingImages") as string[];
    const imageUrls: string[] = [];

    // Upload images to Cloudinary
    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles
        .filter((file) => file instanceof File && file.size > 0)
        .map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "trade-zone" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
              })
              .end(buffer);
          });
          return uploadResult.secure_url;
        });

      const uploadedUrls = await Promise.all(uploadPromises);
      imageUrls.push(...uploadedUrls);
    }

    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const settings =
      (await SystemSettings.findOne()) || (await SystemSettings.create({}));

    // Apply free quota for existing users if undefined
    if (dbUser.listingQuota === undefined) {
      dbUser.listingQuota = settings.freeListingQuota;
    }

    // Check listing quota
    if (dbUser.listingQuota <= 0) {
      return NextResponse.json(
        { message: "Listing quota exhausted. Please purchase a listing pack." },
        { status: 403 },
      );
    }

    // Decrement quota
    // dbUser.listingQuota -= 1;
    // await dbUser.save();

    if (dbUser.listingQuota === 1) {
      await Notification.create({
        userId: dbUser._id,
        title: "Listing Quota Low",
        message:
          "You have 1 listing quota remaining. Purchase a listing pack to continue posting.",
        type: "system",
        link: "/dashboard/tokens",
      });
    }

    let existingItem: any = null;

    if (uniqueIdentifier) {
      existingItem = await Item.findOne({
        $or: [
          { "registry.serialNumber": uniqueIdentifier },
          { "registry.imei": uniqueIdentifier },
          { "registry.chassisNumber": uniqueIdentifier },
          { uniqueIdentifier: uniqueIdentifier },
        ],
      });
    }

    const expiresAt = new Date(
      Date.now() + settings.globalListingExpiryDays * 24 * 60 * 60 * 1000,
    );

    const listingData = {
      title,
      price,
      category: category as any,
      condition,
      location: { city, state, country },
      status: "active" as const,
      featured: false,
      views: 0,
      listedAt: new Date(),
      expiresAt,
      isGrandfathered: false,
    };

    if (existingItem) {
      if (
        existingItem.owner &&
        existingItem.owner.toString() !== session.user.id
      ) {
        return NextResponse.json(
          { message: "You do not have permission to list this item." },
          { status: 403 },
        );
      }

      existingItem.isListed = true;
      existingItem.seller = session.user.id;
      existingItem.listing = listingData;
      if (!existingItem.brand || existingItem.brand === "Unknown")
        existingItem.brand = brand || "Unknown";
      if (!existingItem.model || existingItem.model === "Unknown")
        existingItem.model = model || title;

      const combinedImages = [...existingImages, ...imageUrls];
      if (combinedImages.length > 0) {
        existingItem.images = combinedImages;
      }

      await existingItem.save();
      return NextResponse.json(existingItem, { status: 201 });
    }

    // New item creation
    let isRegistered = false;
    let registryData: any = undefined;
    let itemTypeData = "other";

    if (uniqueIdentifier && dbUser && dbUser.unlimitedRegistrations) {
      isRegistered = true;
      const categoryDoc = await Category.findById(category).lean();
      const catName = categoryDoc?.name?.toLowerCase() || "";

      if (catName.includes("phone") || catName.includes("mobile"))
        itemTypeData = "phone";
      else if (catName.includes("laptop") || catName.includes("mac"))
        itemTypeData = "laptop";
      else if (catName.includes("tablet") || catName.includes("ipad"))
        itemTypeData = "tablet";
      else if (catName.includes("car") || catName.includes("vehicle"))
        itemTypeData = "vehicle";
      else if (catName.includes("motorcycle") || catName.includes("bike"))
        itemTypeData = "motorcycle";
      else if (catName.includes("generator")) itemTypeData = "generator";
      else if (catName.includes("electronic")) itemTypeData = "electronics";

      registryData = {
        serialNumber: uniqueIdentifier,
      };
    }

    const newItem = await Item.create({
      owner: session.user.id,
      brand: brand || "Unknown",
      model: model || title,
      description,
      images: [...existingImages, ...imageUrls],
      uniqueIdentifier,
      itemType: isRegistered ? itemTypeData : undefined,

      isRegistered,
      registeredAt: isRegistered ? new Date() : undefined,
      registry: registryData,
      ownershipStatus: isRegistered ? "owned" : undefined,

      isListed: true,
      seller: session.user.id,
      listing: listingData,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Listing creation error:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
