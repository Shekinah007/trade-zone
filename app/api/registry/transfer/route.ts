import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import User from '@/models/User';

// POST /api/registry/transfer
// Body: { itemId, toEmail, dateSold?, salePrice?, location?, notes? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { propertyId, itemId, toEmail, dateSold, salePrice, location, notes } = body;
  const actualItemId = itemId || propertyId;

  if (!actualItemId || !toEmail) {
    return NextResponse.json(
      { error: 'itemId and toEmail are required.' },
      { status: 400 }
    );
  }

  const item = await Item.findById(actualItemId);
  if (!item || !item.isRegistered) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
  }

  if (item.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: 'You do not own this property.' }, { status: 403 });
  }

  if (item.ownershipStatus === 'missing') {
    return NextResponse.json(
      { error: 'Cannot transfer a property that is reported missing.' },
      { status: 400 }
    );
  }

  // Find new owner by email
  const newOwner = await User.findOne({ email: toEmail });
  if (!newOwner) {
    return NextResponse.json(
      { error: 'No FindMaster account found with that email address.' },
      { status: 404 }
    );
  }

  if (newOwner._id.toString() === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot transfer ownership to yourself.' },
      { status: 400 }
    );
  }

  if (!item.previousOwners) item.previousOwners = [];

  // Record the transfer
  item.previousOwners.push({
    fromUser: item.owner,
    toUser: newOwner._id,
    dateSold: dateSold ? new Date(dateSold) : undefined,
    salePrice: salePrice ?? undefined,
    location: location || undefined,
    notes: notes || undefined,
    transferredAt: new Date(),
  });

  item.owner = newOwner._id;
  item.ownershipStatus = 'transferred';
  
  // If it was listed by the old owner, we might want to end the listing
  if (item.isListed && item.seller?.toString() === session.user.id) {
      if (!item.listing) item.listing = {};
      item.listing.status = 'sold';
  }

  await item.save();

  return NextResponse.json({
    message: `Ownership successfully transferred to ${newOwner.name}.`,
    property: item,
  });
}
