import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RechargeToken from '@/models/RechargeToken';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.tokenType = type;
    
    if (search) {
      // Search by code or user email
      const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { usedBy: { $in: userIds } },
        { batchId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const tokens = await RechargeToken.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('generatedBy', 'name email')
      .populate('usedBy', 'name email');

    const total = await RechargeToken.countDocuments(query);

    return NextResponse.json({
      tokens,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("Token list error:", error);
    return NextResponse.json({ error: error.message || 'Error fetching tokens' }, { status: 500 });
  }
}
