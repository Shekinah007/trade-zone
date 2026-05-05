import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RechargeToken from '@/models/RechargeToken';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // Get user details for current limit and redeemed array
    const user = await User.findById(session.user.id).select('creditBalance unlimitedRegistrations totalTokensRedeemed');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch full token data for the user's previously redeemed ones
    const tokens = await RechargeToken.find({ usedBy: user._id })
      .sort({ usedAt: -1 })
      .select('code tokenType value usedAt batchId');

    return NextResponse.json({ 
      success: true, 
      limitInfo: {
        creditBalance: user.creditBalance,
        unlimitedRegistrations: user.unlimitedRegistrations,
        totalTokensRedeemed: user.totalTokensRedeemed
      },
      tokens 
    });

  } catch (error: any) {
    console.error("Token fetch error:", error);
    return NextResponse.json({ error: error.message || 'Error fetching user tokens' }, { status: 500 });
  }
}
