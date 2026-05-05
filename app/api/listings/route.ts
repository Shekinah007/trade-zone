import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import { v2 as cloudinary } from 'cloudinary';

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

    const items = await Item.find(query)
      .populate("seller", "name image")
      .populate("listing.category", "name slug")
      .sort({ createdAt: -1 });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching listings" }, { status: 500 });
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
    const imageUrls: string[] = [];

    // Upload images to Cloudinary
    if (imageFiles && imageFiles.length > 0) {
       for (const file of imageFiles) {
          if (file instanceof File && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const uploadResult: any = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { folder: "trade-zone" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(buffer);
            });
            
            imageUrls.push(uploadResult.secure_url);
          }
       }
    }

    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const settings = await SystemSettings.findOne() || await SystemSettings.create({});

    // Apply free quota for existing users if undefined
    if (dbUser.listingQuota === undefined) {
      dbUser.listingQuota = settings.freeListingQuota;
    }

    // Check listing quota
    if (dbUser.listingQuota <= 0) {
      return NextResponse.json({ message: "Listing quota exhausted. Please purchase a listing pack." }, { status: 403 });
    }

    // Decrement quota
    dbUser.listingQuota -= 1;
    await dbUser.save();

    if (dbUser.listingQuota === 1) {
      await Notification.create({
        userId: dbUser._id,
        title: "Listing Quota Low",
        message: "You have 1 listing quota remaining. Purchase a listing pack to continue posting.",
        type: "system",
        link: "/dashboard/tokens",
      });
    }

    let existingItem: any = null;

    if (uniqueIdentifier) {
      existingItem = await Item.findOne({
        $or: [
          { 'registry.serialNumber': uniqueIdentifier },
          { 'registry.imei': uniqueIdentifier },
          { 'registry.chassisNumber': uniqueIdentifier },
          { uniqueIdentifier: uniqueIdentifier }
        ]
      });
    }

    const expiresAt = new Date(Date.now() + settings.globalListingExpiryDays * 24 * 60 * 60 * 1000);

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
      existingItem.isListed = true;
      existingItem.seller = session.user.id;
      existingItem.listing = listingData;
      if (!existingItem.brand || existingItem.brand === 'Unknown') existingItem.brand = brand || 'Unknown';
      if (!existingItem.model || existingItem.model === 'Unknown') existingItem.model = model || title;
      if (!existingItem.images || existingItem.images.length === 0) existingItem.images = imageUrls;
      
      await existingItem.save();
      return NextResponse.json(existingItem, { status: 201 });
    }

    // New item creation
    let isRegistered = false;
    let registryData: any = undefined;
    let itemTypeData = 'other';
    
    if (uniqueIdentifier && dbUser && dbUser.unlimitedRegistrations) {
      isRegistered = true;
      const categoryDoc = await Category.findById(category).lean();
      const catName = categoryDoc?.name?.toLowerCase() || "";
      
      if (catName.includes('phone') || catName.includes('mobile')) itemTypeData = 'phone';
      else if (catName.includes('laptop') || catName.includes('mac')) itemTypeData = 'laptop';
      else if (catName.includes('tablet') || catName.includes('ipad')) itemTypeData = 'tablet';
      else if (catName.includes('car') || catName.includes('vehicle')) itemTypeData = 'vehicle';
      else if (catName.includes('motorcycle') || catName.includes('bike')) itemTypeData = 'motorcycle';
      else if (catName.includes('generator')) itemTypeData = 'generator';
      else if (catName.includes('electronic')) itemTypeData = 'electronics';

      registryData = {
        serialNumber: uniqueIdentifier,
      };
    }

    const newItem = await Item.create({
      owner: session.user.id,
      brand: brand || 'Unknown',
      model: model || title,
      description,
      images: imageUrls,
      uniqueIdentifier,
      itemType: isRegistered ? itemTypeData : undefined,
      
      isRegistered,
      registeredAt: isRegistered ? new Date() : undefined,
      registry: registryData,
      ownershipStatus: isRegistered ? 'owned' : undefined,
      
      isListed: true,
      seller: session.user.id,
      listing: listingData
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Listing creation error:", error);
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
