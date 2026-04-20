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

    // Stats aggregations
    const totalTokens = await RechargeToken.countDocuments();
    const activeTokens = await RechargeToken.countDocuments({ status: 'active' });
    const usedTokens = await RechargeToken.countDocuments({ status: 'used' });
    const expiredTokens = await RechargeToken.countDocuments({ status: 'expired' });
    const revokedTokens = await RechargeToken.countDocuments({ status: 'revoked' });

    const basicTokens = await RechargeToken.countDocuments({ tokenType: 'basic' });
    const unlimitedTokens = await RechargeToken.countDocuments({ tokenType: 'unlimited' });

    // Recent 10 redemptions
    const recentActivity = await RechargeToken.find({ status: 'used' })
      .sort({ usedAt: -1 })
      .limit(10)
      .populate('usedBy', 'name email image')
      .populate('generatedBy', 'name email');

    // Top users by redemption
    const topUsersResult = await User.find({ totalTokensRedeemed: { $gt: 0 } })
      .sort({ totalTokensRedeemed: -1 })
      .limit(5)
      .select('name email totalTokensRedeemed image');

    // Tokens used over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Aggregation for daily chart
    const dailyUsage = await RechargeToken.aggregate([
      { $match: { status: 'used', usedAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$usedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      summary: {
        total: totalTokens,
        active: activeTokens,
        used: usedTokens,
        expired: expiredTokens,
        revoked: revokedTokens,
        basic: basicTokens,
        unlimited: unlimitedTokens
      },
      recentActivity,
      topUsers: topUsersResult,
      dailyUsage
    });
  } catch (error: any) {
    console.error("Token stats error:", error);
    return NextResponse.json({ error: error.message || 'Error fetching stats' }, { status: 500 });
  }
}
