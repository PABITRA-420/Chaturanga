import { NextResponse } from 'next/server';
import { verifyPlayerAccount } from '@/lib/playerVerification';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();
  const platform = searchParams.get('platform')?.trim().toLowerCase();

  const result = await verifyPlayerAccount(platform, username);
  const { status, ...body } = result;
  return NextResponse.json(body, { status });
}
