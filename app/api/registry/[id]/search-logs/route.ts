import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import SearchLog from '@/models/SearchLog';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const property = await Property.findById(id).lean();

  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
  }

  const isOwner = property.owner.toString() === session.user.id;
  const isAdmin = session.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const logs = await SearchLog.find({ propertyId: id })
      .populate('user', 'name email image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching search logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
