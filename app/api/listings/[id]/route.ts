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

export async function GET(
  req: Request,
    context: { params: Promise<{ id: string }> }

) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const listing = await Listing.findById(id)
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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }

) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await dbConnect();
    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    if (listing.seller.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();
    
    if (formData.has("title")) listing.title = formData.get("title") as string;
    if (formData.has("description")) listing.description = formData.get("description") as string;
    if (formData.has("price")) listing.price = parseFloat(formData.get("price") as string);
    if (formData.has("category")) listing.category = formData.get("category") as any;
    if (formData.has("condition")) listing.condition = formData.get("condition") as string;
    if (formData.has("uniqueIdentifier")) listing.uniqueIdentifier = formData.get("uniqueIdentifier") as string;
    
    // Location update
    if (formData.has("city") || formData.has("country")) {
         listing.location = {
            city: formData.get("city") as string || listing.location.city,
            state: formData.get("state") as string || listing.location.state,
            country: formData.get("country") as string || listing.location.country,
         };
    }

    // Status update
    if (formData.has("status")) {
        listing.status = formData.get("status") as 'active' | 'sold' | 'expired' | 'inactive';
    }
    
    // Handle Images
    // Only update images if we have explicit image data keys (even if empty, they would be present if form submitted them)
    // ListingForm appends 'existingImages' for kept images.
    // If we are just marking as sold, we don't send 'images' or 'existingImages'.
    const hasImageUpdates = formData.has("images") || formData.has("existingImages");

    if (hasImageUpdates) {
        const existingImages = formData.getAll("existingImages") as string[];
        const newFiles = formData.getAll("images") as File[];
        const newImageUrls: string[] = [];

        for (const file of newFiles) {
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

            newImageUrls.push(uploadResult.secure_url);
          }
        }

        listing.images = [...existingImages, ...newImageUrls];
    }

    await listing.save();

    return NextResponse.json(listing);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating listing" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
    context: { params: Promise<{ id: string }> }

) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await dbConnect();
    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    if (listing.seller.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Listing.findByIdAndDelete(id);

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting listing" }, { status: 500 });
  }
}
