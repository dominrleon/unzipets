import { NextResponse } from 'next/server';
import { getStartNodeByCaseSlug } from '@/lib/cases';
import { serializeNode } from '@/lib/serializers';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;

  const startNode = await getStartNodeByCaseSlug(slug);

  if (!startNode) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  return NextResponse.json({
    node: serializeNode(startNode),
  });
}