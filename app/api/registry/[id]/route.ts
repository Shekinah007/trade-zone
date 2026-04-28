import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";

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

  const property = await Property.findById(id)
    .populate("owner", "name email phone image")
    .lean();

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json({ property });
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

  const property = await Property.findById(id);
  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const isOwner = property.owner.toString() === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = ["registered", "missing", "found"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (status === "missing") property.reportedMissingAt = new Date();
  if (status === "found") property.reportedFoundAt = new Date();

  property.status = status;
  await property.save();

  return NextResponse.json({ property });
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

  const property = await Property.findById(id);
  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const isOwner = property.owner.toString() === session.user.id;
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
    if (serialNumber && serialNumber !== property.serialNumber)
      orConditions.push({ serialNumber });
    if (imei && imei !== property.imei) orConditions.push({ imei });
    if (chassisNumber && chassisNumber !== property.chassisNumber)
      orConditions.push({ chassisNumber });

    if (orConditions.length > 0) {
      const duplicate = await Property.findOne({
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

    property.itemType = itemType as any;
    property.brand = brand as any;
    property.model = model as any;
    property.description = description || undefined;
    property.serialNumber = serialNumber || undefined;
    property.imei = imei || undefined;
    property.chassisNumber = chassisNumber || undefined;
    property.color = color || undefined;
    property.yearOfPurchase = yearOfPurchase;

    await property.save();

    return NextResponse.json({ property });
  } catch (error: any) {
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
