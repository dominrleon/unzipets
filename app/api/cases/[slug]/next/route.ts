import { NextResponse } from 'next/server';
import { getNextNodeFromAnswer } from '@/lib/cases';
import { serializeNode } from '@/lib/serializers';

type Body = {
  answerId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (!body.answerId) {
    return NextResponse.json({ error: 'answerId is required' }, { status: 400 });
  }

  const nextNode = await getNextNodeFromAnswer(body.answerId);

  if (!nextNode) {
    return NextResponse.json({ error: 'Next node not found' }, { status: 404 });
  }

  return NextResponse.json({
    node: serializeNode(nextNode),
  });
}