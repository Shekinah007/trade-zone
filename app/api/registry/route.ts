import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import SearchLog from '@/models/SearchLog';

// GET /api/registry?q=<serial|imei|chassis> — public search
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: 'Search query must be at least 3 characters.' },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  // Extract IP
  const ipInfo = req.headers.get('x-forwarded-for');
  const ipAddress = ipInfo ? ipInfo.split(',')[0] : (req.ip || 'Unknown');

  const properties = await Property.find({
    $or: [
      { serialNumber: { $regex: q, $options: 'i' } },
      { imei: { $regex: q, $options: 'i' } },
      { chassisNumber: { $regex: q, $options: 'i' } },
    ],
  })
    .limit(10)
    .populate(session ? 'owner' : '', session ? 'name email phone' : '')
    .lean();

  // Non-members: strip owner details
  const results = properties.map((p) => ({
    _id: p._id,
    itemType: p.itemType,
    brand: p.brand,
    model: p.model,
    color: p.color,
    status: p.status,
    serialNumber: p.serialNumber,
    imei: p.imei,
    chassisNumber: p.chassisNumber,
    registeredAt: p.registeredAt,
    // Owner details only for authenticated users
    ...(session
      ? { owner: p.owner }
      : { owner: null }),
  }));

  // Asynchronous Logging
  if (results.length > 0) {
    SearchLog.create({
      query: q,
      propertyIds: results.map(r => r._id),
      ipAddress,
      location: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : undefined,
      user: session?.user?.id || undefined,
    }).catch((err) => console.error("Search Audit Log Failed:", err));
  }

  return NextResponse.json({ results });
}

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/registry — register a new property (auth required)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("SessionDetails",session);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
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
    const yearOfPurchase = yearOfPurchaseStr ? Number(yearOfPurchaseStr) : undefined;

    if (!itemType || !brand || !model) {
      return NextResponse.json(
        { error: 'itemType, brand, and model are required.' },
        { status: 400 }
      );
    }

    if (!serialNumber && !imei && !chassisNumber) {
      return NextResponse.json(
        { error: 'At least one identifier (serial number, IMEI, or chassis number) is required.' },
        { status: 400 }
      );
    }

    // Check for duplicate identifier
    const orConditions = [];
    if (serialNumber) orConditions.push({ serialNumber });
    if (imei) orConditions.push({ imei });
    if (chassisNumber) orConditions.push({ chassisNumber });

    if (orConditions.length > 0) {
      const duplicate = await Property.findOne({ $or: orConditions });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A property with this identifier is already registered.' },
          { status: 409 }
        );
      }
    }

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

    const property = await Property.create({
      owner: session.user.id,
      itemType,
      brand,
      model,
      description,
      serialNumber: serialNumber || undefined,
      imei: imei || undefined,
      chassisNumber: chassisNumber || undefined,
      color,
      yearOfPurchase,
      images: imageUrls,
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error: any) {
    console.error("Property creation error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
