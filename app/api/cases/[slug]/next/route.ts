import { NextResponse } from 'next/server';
import { getNextNodeFromAnswer, getPublishedCaseBySlug } from '@/lib/cases';
import { serializeNode } from '@/lib/serializers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const answerId = String(body?.answerId ?? '').trim();

    if (!answerId) {
      return NextResponse.json(
        { error: 'answerId is required' },
        { status: 400 }
      );
    }

    const foundCase = await getPublishedCaseBySlug(slug);

    if (!foundCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const nextNode = await getNextNodeFromAnswer(answerId);

    if (!nextNode) {
      return NextResponse.json(
        { error: 'Next node not found' },
        { status: 404 }
      );
    }

    if (nextNode.caseId !== foundCase.id) {
      return NextResponse.json(
        { error: 'Answer does not belong to this case' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      node: serializeNode(nextNode),
    });
  } catch (error) {
    console.error('[POST /api/cases/[slug]/next]', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}