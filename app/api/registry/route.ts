import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import SearchLog from "@/models/SearchLog";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import { longFormatters } from "date-fns";

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

// POST /api/registry

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // =========================
    // CHECK USER
    // =========================

    const dbUser = await User.findById(session.user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // =========================
    // REGISTRATION LIMIT
    // =========================

    if (!dbUser.unlimitedRegistrations) {
      const propertyCount = await Item.countDocuments({
        owner: dbUser._id,
        isRegistered: true,
      });

      const limit = dbUser.registrationLimit || 1;

      if (propertyCount >= limit) {
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

    // =========================
    // FORM DATA
    // =========================

    const formData = await req.formData();

    const normalize = (value: FormDataEntryValue | null) => {
      if (!value || typeof value !== "string") return undefined;

      const trimmed = value.trim();

      return trimmed.length ? trimmed : undefined;
    };

    const itemType = normalize(formData.get("itemType"));
    const brand = normalize(formData.get("brand"));
    const model = normalize(formData.get("model"));
    const description = normalize(formData.get("description"));
    const serialNumber = normalize(formData.get("serialNumber"))?.toUpperCase();
    const imei = normalize(formData.get("imei"));
    const chassisNumber = normalize(
      formData.get("chassisNumber"),
    )?.toUpperCase();
    const color = normalize(formData.get("color"));
    const itemId = normalize(formData.get("itemId"));

    const yearOfPurchaseRaw = normalize(formData.get("yearOfPurchase"));

    const yearOfPurchase = yearOfPurchaseRaw
      ? Number(yearOfPurchaseRaw)
      : undefined;

    // =========================
    // VALIDATION
    // =========================

    if (!itemType || !brand || !model) {
      return NextResponse.json(
        {
          error: "itemType, brand, and model are required.",
        },
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

    if (
      yearOfPurchase &&
      (isNaN(yearOfPurchase) ||
        yearOfPurchase < 1900 ||
        yearOfPurchase > new Date().getFullYear())
    ) {
      return NextResponse.json(
        {
          error: "Invalid year of purchase.",
        },
        { status: 400 },
      );
    }

    // =========================
    // DUPLICATE CHECK
    // =========================

    const orConditions = [];

    if (serialNumber) {
      orConditions.push({
        "registry.serialNumber": serialNumber,
      });
    }

    if (imei) {
      orConditions.push({
        "registry.imei": imei,
      });
    }

    if (chassisNumber) {
      orConditions.push({
        "registry.chassisNumber": chassisNumber,
      });
    }

    const duplicate = await Item.findOne({
      isRegistered: true,
      $or: orConditions,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error: "A property with this identifier is already registered.",
        },
        { status: 409 },
      );
    }

    // =========================
    // IMAGE UPLOADS
    // =========================

    const imageFiles = formData.getAll("images");

    const uploadPromises = imageFiles
      .filter(
        (file) =>
          file &&
          typeof file !== "string" &&
          "arrayBuffer" in file &&
          file.size > 0,
      )
      .map(async (file: any) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "trade-zone",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              },
            )
            .end(buffer);
        });

        return uploadResult.secure_url;
      });

    const imageUrls = await Promise.all(uploadPromises);

    // =========================
    // CREATE OR UPDATE ITEM
    // =========================

    const uniqueIdentifier = serialNumber || imei || chassisNumber;

    let property;
    let existingItem = null;

    if (itemId) {
      // Find the existing item by explicitly provided ID
      existingItem = await Item.findOne({ _id: itemId, owner: dbUser._id });

      if (!existingItem) {
        return NextResponse.json(
          {
            error:
              "Item not found or you do not have permission to register it.",
          },
          { status: 404 },
        );
      }
    } else if (uniqueIdentifier) {
      // Try to auto-link by identifier if it exists and is owned by the user
      existingItem = await Item.findOne({
        owner: dbUser._id,
        isRegistered: false,
        $or: [
          { "registry.serialNumber": uniqueIdentifier },
          { "registry.imei": uniqueIdentifier },
          { "registry.chassisNumber": uniqueIdentifier },
          { uniqueIdentifier: uniqueIdentifier },
        ],
      });
    }

    if (existingItem) {
      if (existingItem.isRegistered) {
        return NextResponse.json(
          { error: "This item is already registered." },
          { status: 400 },
        );
      }

      // Append any new images to existing ones
      const combinedImages = [...(existingItem.images || [])];
      if (imageUrls && imageUrls.length > 0) {
        combinedImages.push(...imageUrls);
      }

      // Update the existing item
      existingItem.brand = brand || existingItem.brand;
      (existingItem as any).model = model ?? existingItem.model;
      if (description) existingItem.description = description;
      if (color) existingItem.color = color;
      existingItem.images = combinedImages;
      existingItem.uniqueIdentifier = uniqueIdentifier;

      // Registry fields
      existingItem.isRegistered = true;
      existingItem.registeredAt = new Date();
      existingItem.itemType = itemType as any;
      existingItem.ownershipStatus = "owned";

      existingItem.registry = {
        serialNumber,
        imei,
        chassisNumber,
        yearOfPurchase,
        color,
      };

      await existingItem.save();
      property = existingItem;
    } else {
      property = await Item.create({
        owner: dbUser._id,

        brand,
        model,
        description,
        color,

        images: imageUrls,

        uniqueIdentifier,

        // Registry
        isRegistered: true,
        registeredAt: new Date(),

        itemType,

        ownershipStatus: "owned",

        registry: {
          serialNumber,
          imei,
          chassisNumber,
          yearOfPurchase,
          color,
        },

        // Marketplace
        isListed: false,
      });
    }

    return NextResponse.json(
      {
        property,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Property creation error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 },
    );
  }
}
