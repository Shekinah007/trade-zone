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
      orConditions.push({ 'registry.serialNumber': serialNumber });
    if (imei && imei !== item.registry?.imei) 
      orConditions.push({ 'registry.imei': imei });
    if (chassisNumber && chassisNumber !== item.registry?.chassisNumber)
      orConditions.push({ 'registry.chassisNumber': chassisNumber });

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
    
    if (serialNumber) {
        item.uniqueIdentifier = serialNumber;
    }

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
