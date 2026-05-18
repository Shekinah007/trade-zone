import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";

// GET /api/registry/[id] — full details (members only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to view full property details." },
      { status: 401 },
    );
  }

  await dbConnect();
  const { id } = await params;

  const item = await Item.findById(id)
    .populate("owner", "name email phone image")
    .populate("previousOwners.fromUser", "name email image")
    .populate("previousOwners.toUser", "name email image")
    .lean();

  if (!item || !item.isRegistered) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json({ property: item });
}

// PATCH /api/registry/[id] — update status (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const item = await Item.findById(id);
  if (!item || !item.isRegistered) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const isOwner = item.owner.toString() === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = ["owned", "missing", "found"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (status === "missing") item.reportedMissingAt = new Date();
  if (status === "found") item.reportedFoundAt = new Date();

  item.ownershipStatus = status;
  await item.save();

  return NextResponse.json({ property: item });
}

// PUT /api/registry/[id] — edit property details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const item = await Item.findById(id);
  if (!item || !item.isRegistered) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const isOwner = item.owner.toString() === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const itemType = formData.get("itemType") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const description = formData.get("description") as string;
    const serialNumber = formData.get("serialNumber") as string;
    const imei = formData.get("imei") as string;
    const chassisNumber = formData.get("chassisNumber") as string;
    const color = formData.get("color") as string;
    const yearOfPurchaseStr = formData.get("yearOfPurchase") as string;
    const yearOfPurchase = yearOfPurchaseStr
      ? Number(yearOfPurchaseStr)
      : undefined;

    if (!itemType || !brand || !model) {
      return NextResponse.json(
        { error: "itemType, brand, and model are required." },
        { status: 400 },
      );
    }

    if (!serialNumber && !imei && !chassisNumber) {
      return NextResponse.json(
        {
          error:
            "At least one identifier (serial number, IMEI, or chassis number) is required.",
        },
        { status: 400 },
      );
    }

    // Check for duplicate identifier if they changed
    const orConditions = [];
    if (serialNumber && serialNumber !== item.registry?.serialNumber)
      orConditions.push({ "registry.serialNumber": serialNumber });
    if (imei && imei !== item.registry?.imei)
      orConditions.push({ "registry.imei": imei });
    if (chassisNumber && chassisNumber !== item.registry?.chassisNumber)
      orConditions.push({ "registry.chassisNumber": chassisNumber });

    if (orConditions.length > 0) {
      const duplicate = await Item.findOne({
        isRegistered: true,
        $or: orConditions,
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A property with this identifier is already registered." },
          { status: 409 },
        );
      }
    }

    item.itemType = itemType as any;
    item.brand = brand as any;
    item.model = model as any;
    item.description = description || undefined;

    if (!item.registry) item.registry = {};
    item.registry.serialNumber = serialNumber || undefined;
    item.registry.imei = imei || undefined;
    item.registry.chassisNumber = chassisNumber || undefined;
    item.registry.yearOfPurchase = yearOfPurchase;

    item.color = color || undefined;

    item.uniqueIdentifier = serialNumber || imei || chassisNumber;

    // Handle images
    let keptImages: string[] = [];
    const keptImagesRaw = formData.get("keptImages");
    if (keptImagesRaw && typeof keptImagesRaw === "string") {
      try {
        keptImages = JSON.parse(keptImagesRaw);
      } catch (e) {
        console.error("Failed to parse keptImages");
      }
    }

    const imageFiles = formData.getAll("images");
    const { v2: cloudinary } = require("cloudinary");
    
    // Make sure cloudinary is configured, we can configure it if not done already
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Delete removed images from Cloudinary
    const oldImages = item.images || [];
    const removedImages = oldImages.filter((img: string) => !keptImages.includes(img));
    
    if (removedImages.length > 0) {
      const extractPublicId = (url: string) => {
        try {
          const splitUrl = url.split("/upload/");
          if (splitUrl.length < 2) return null;
          let path = splitUrl[1];
          if (path.match(/^v\d+\//)) {
            path = path.replace(/^v\d+\//, "");
          }
          const lastDotIndex = path.lastIndexOf(".");
          if (lastDotIndex !== -1) {
            path = path.substring(0, lastDotIndex);
          }
          return path;
        } catch (e) {
          return null;
        }
      };

      const deletePromises = removedImages.map((url: string) => {
        const publicId = extractPublicId(url);
        if (publicId) {
          return new Promise((resolve) => {
            cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
              if (error) console.error("Cloudinary delete error:", error);
              resolve(result);
            });
          });
        }
        return Promise.resolve();
      });

      await Promise.all(deletePromises);
    }

    const uploadPromises = imageFiles
      .filter((file) => file && typeof file !== "string" && "arrayBuffer" in file && (file as File).size > 0)
      .map(async (file: any) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "trade-zone",
              },
              (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
              },
            )
            .end(buffer);
        });

        return uploadResult.secure_url;
      });

    const newImageUrls = await Promise.all(uploadPromises);

    item.images = [...keptImages, ...newImageUrls];

    await item.save();

    return NextResponse.json({ property: item });
  } catch (error: any) {
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
