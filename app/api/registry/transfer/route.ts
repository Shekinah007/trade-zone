import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import User from '@/models/User';

// POST /api/registry/transfer
// Body: { propertyId, toEmail, dateSold?, salePrice?, location?, notes? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { propertyId, toEmail, dateSold, salePrice, location, notes } = body;

  if (!propertyId || !toEmail) {
    return NextResponse.json(
      { error: 'propertyId and toEmail are required.' },
      { status: 400 }
    );
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
  }

  if (property.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: 'You do not own this property.' }, { status: 403 });
  }

  if (property.status === 'missing') {
    return NextResponse.json(
      { error: 'Cannot transfer a property that is reported missing.' },
      { status: 400 }
    );
  }

  // Find new owner by email
  const newOwner = await User.findOne({ email: toEmail });
  if (!newOwner) {
    return NextResponse.json(
      { error: 'No FindMasters account found with that email address.' },
      { status: 404 }
    );
  }

  if (newOwner._id.toString() === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot transfer ownership to yourself.' },
      { status: 400 }
    );
  }

  // Record the transfer
  property.previousOwners.push({
    fromUser: property.owner,
    toUser: newOwner._id,
    dateSold: dateSold ? new Date(dateSold) : undefined,
    salePrice: salePrice ?? undefined,
    location: location || undefined,
    notes: notes || undefined,
    transferredAt: new Date(),
  });

  property.owner = newOwner._id;
  property.status = 'transferred';
  await property.save();

  return NextResponse.json({
    message: `Ownership successfully transferred to ${newOwner.name}.`,
    property,
  });
}
