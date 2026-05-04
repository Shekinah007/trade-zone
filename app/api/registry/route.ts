import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import SearchLog from "@/models/SearchLog";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/registry?q=<serial|imei|chassis> — public search
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: "Search query must be at least 3 characters." },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);

  // Extract IP
  const ipInfo = req.headers.get("x-forwarded-for");
  const ipAddress = ipInfo
    ? ipInfo.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "Unknown";

  const items = await Item.find({
    isRegistered: true,
    $or: [
      { "registry.serialNumber": { $regex: q, $options: "i" } },
      { "registry.imei": { $regex: q, $options: "i" } },
      { "registry.chassisNumber": { $regex: q, $options: "i" } },
      { uniqueIdentifier: { $regex: q, $options: "i" } },
    ],
  })
    .limit(10)
    .populate(session ? "owner" : "", session ? "name email phone" : "")
    .lean();

  // Non-members: strip owner details
  const results = items.map((p: any) => ({
    _id: p._id,
    itemType: p.itemType,
    brand: p.brand,
    model: p.model,
    color: p.color,
    status: p.ownershipStatus,
    serialNumber: p.registry?.serialNumber || p.uniqueIdentifier,
    imei: p.registry?.imei,
    chassisNumber: p.registry?.chassisNumber,
    registeredAt: p.registeredAt,
    // Owner details only for authenticated users
    ...(session ? { owner: p.owner } : { owner: null }),
  }));

  // Asynchronous Logging
  if (results.length > 0) {
    let resolvedLat = lat ? Number(lat) : undefined;
    let resolvedLng = lng ? Number(lng) : undefined;

    // IP-based Geolocation Fallback
    if (
      (!resolvedLat || !resolvedLng) &&
      ipAddress &&
      ipAddress !== "Unknown" &&
      ipAddress !== "::1" &&
      ipAddress !== "127.0.0.1"
    ) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.status === "success") {
          resolvedLat = geoData.lat;
          resolvedLng = geoData.lon;
        }
        if (geoData && geoData.status !== "success") {
          resolvedLat = 8.978799828054317;
          resolvedLng = 7.4409076812946855;
        }
      } catch (err) {
        console.error("IP Geolocation fallback failed:", err);
      }
    }

    // if (ipAddress && (ipAddress == "::1" || ipAddress == "127.0.0.1")) {
    //   resolvedLat = 8.978799828054317;
    //   resolvedLng = 7.4409076812946855;
    // }

    SearchLog.create({
      query: q,
      itemId: results[0]._id,
      ipAddress,
      location:
        resolvedLat && resolvedLng
          ? { lat: resolvedLat, lng: resolvedLng }
          : undefined,
      user: session?.user?.id || undefined,
    }).catch((err) => console.error("Search Audit Log Failed:", err));
  }

  return NextResponse.json({ results });
}

// POST /api/registry — register a new property (auth required)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("SessionDetails", session);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Check user registration limits
    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!dbUser.unlimitedRegistrations) {
      const propertyCount = await Item.countDocuments({
        owner: dbUser._id,
        isRegistered: true,
      });
      if (propertyCount >= (dbUser.registrationLimit || 1)) {
        return NextResponse.json(
          {
            error:
              "Registration limit reached. Please purchase a token to register more properties.",
            code: "LIMIT_EXCEEDED",
          },
          { status: 403 },
        );
      }
    }

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
    const listingId = formData.get("listingId") as string; // in the new world, this would be an Item ID where isListed=true but isRegistered=false
    const itemId = formData.get("itemId") as string;

    const actualItemId = itemId || listingId;

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

    // Check for duplicate identifier
    const orConditions = [];
    if (serialNumber)
      orConditions.push({ "registry.serialNumber": serialNumber });
    if (imei) orConditions.push({ "registry.imei": imei });
    if (chassisNumber)
      orConditions.push({ "registry.chassisNumber": chassisNumber });

    if (orConditions.length > 0) {
      const duplicate = await Item.findOne({
        isRegistered: true,
        $or: orConditions,
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "A property with this identifier is already registered." },
          { status: 409 },
        );
      }
    }

    let existingItemImages: string[] = [];
    let existingItem: any = null;

    if (actualItemId) {
      existingItem = await Item.findById(actualItemId);
      if (existingItem && Array.isArray(existingItem.images)) {
        existingItemImages = existingItem.images;
      }
    }

    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [...existingItemImages];

    // Upload images to Cloudinary
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file instanceof File && file.size > 0) {
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

          imageUrls.push(uploadResult.secure_url);
        }
      }
    }

    if (existingItem) {
      // Convert existing listed-only item to a registered item
      existingItem.isRegistered = true;
      existingItem.registeredAt = new Date();
      existingItem.ownershipStatus = "owned";

      existingItem.itemType = itemType;
      existingItem.brand = brand;
      existingItem.model = model;
      if (description) existingItem.description = description;
      if (color) existingItem.color = color;
      existingItem.images = imageUrls;

      existingItem.registry = {
        serialNumber: serialNumber || undefined,
        imei: imei || undefined,
        chassisNumber: chassisNumber || undefined,
        yearOfPurchase,
      };

      if (serialNumber) existingItem.uniqueIdentifier = serialNumber;

      await existingItem.save();
      return NextResponse.json({ property: existingItem }, { status: 201 });
    } else {
      // Create entirely new item
      const newItem = await Item.create({
        owner: session.user.id,
        itemType,
        brand,
        model,
        description,
        color,
        images: imageUrls,
        uniqueIdentifier: serialNumber || undefined,

        isRegistered: true,
        registeredAt: new Date(),
        ownershipStatus: "owned",
        registry: {
          serialNumber: serialNumber || undefined,
          imei: imei || undefined,
          chassisNumber: chassisNumber || undefined,
          yearOfPurchase,
        },

        isListed: false,
      });

      return NextResponse.json({ property: newItem }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
