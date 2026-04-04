import { NextResponse } from 'next/server';
import { getCasePlayerData } from '@/lib/cases';
import { serializeNode } from '@/lib/serializers';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;

  const startNode = await getCasePlayerData(slug);

  if (!startNode) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  return NextResponse.json(startNode);
}