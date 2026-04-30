import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
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

  const item = await Item.findById(id).lean();

  if (!item || !item.isRegistered) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
  }

  const isOwner = item.owner.toString() === session.user.id;
  const isAdmin = session.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const logs = await SearchLog.find({ itemId: id })
      .populate('user', 'name email image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching search logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
