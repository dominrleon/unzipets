import { notFound } from 'next/navigation';
import CasePlayer from '@/components/case/CasePlayer';
import { getStartNodeByCaseSlug } from '@/lib/cases';
import { serializeNode } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CasePage({ params }: Params) {
  const { slug } = await params;

  const startNode = await getStartNodeByCaseSlug(slug);

  if (!startNode) {
    notFound();
  }

  const initialNode = serializeNode(startNode);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <CasePlayer slug={slug} initialNode={initialNode} />
    </main>
  );
}