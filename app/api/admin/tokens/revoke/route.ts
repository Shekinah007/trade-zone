import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RechargeToken from '@/models/RechargeToken';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { tokenId, reason } = body;

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID required' }, { status: 400 });
    }

    const token = await RechargeToken.findById(tokenId);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (token.status === 'used') {
      return NextResponse.json({ error: 'Cannot revoke an already used token' }, { status: 400 });
    }

    token.status = 'revoked';
    token.notes = token.notes ? `${token.notes} | Revoked: ${reason || 'No reason provided'}` : `Revoked: ${reason || 'No reason provided'}`;
    await token.save();

    return NextResponse.json({ success: true, token });

  } catch (error: any) {
    console.error("Token revoke error:", error);
    return NextResponse.json({ error: error.message || 'Error revoking token' }, { status: 500 });
  }
}
