import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';

// GET /api/registry/[id] — full details (members only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in to view full property details.' }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const property = await Property.findById(id)
    .populate('owner', 'name email phone image')
    .lean();

  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
  }

  return NextResponse.json({ property });
}

// PATCH /api/registry/[id] — update status (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const property = await Property.findById(id);
  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
  }

  const isOwner = property.owner.toString() === session.user.id;
  const isAdmin = session.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allowed = ['registered', 'missing', 'found'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  if (status === 'missing') property.reportedMissingAt = new Date();
  if (status === 'found') property.reportedFoundAt = new Date();

  property.status = status;
  await property.save();

  return NextResponse.json({ property });
}
