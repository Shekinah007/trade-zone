import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';

// GET /api/registry?q=<serial|imei|chassis> — public search
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: 'Search query must be at least 3 characters.' },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

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

  return NextResponse.json({ results });
}

// POST /api/registry — register a new property (auth required)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("SessionDetails",session);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  const {
    itemType,
    brand,
    model,
    description,
    serialNumber,
    imei,
    chassisNumber,
    color,
    yearOfPurchase,
    images,
  } = body;

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
  const duplicate = await Property.findOne({
    $or: [
      serialNumber ? { serialNumber } : null,
      imei ? { imei } : null,
      chassisNumber ? { chassisNumber } : null,
    ].filter(Boolean),
  });

  if (duplicate) {
    return NextResponse.json(
      { error: 'A property with this identifier is already registered.' },
      { status: 409 }
    );
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
    images: images || [],
  });

  return NextResponse.json({ property }, { status: 201 });
}
