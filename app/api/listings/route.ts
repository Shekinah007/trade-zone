import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Listing from "@/models/Listing";
import { v2 as cloudinary } from 'cloudinary';

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
    const query = {};
    
    if (category) {
      Object.assign(query, { category });
    }
    
    Object.assign(query, { status: "active" });

    const listings = await Listing.find(query)
      .populate("seller", "name image")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return NextResponse.json(listings);
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
    
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    // Upload images to Cloudinary
    if (imageFiles && imageFiles.length > 0) {
       for (const file of imageFiles) {
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

    const newListing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      location: { city, state, country },
      images: imageUrls,
      seller: session.user.id,
      status: "active",
      featured: false,
      views: 0
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error: any) {
    console.error("Listing creation error:", error);
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
