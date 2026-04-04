import { notFound } from 'next/navigation';
import CasePlayer from '@/components/case/CasePlayer';
import { getCasePlayerData } from '@/lib/cases';

export const dynamic = 'force-dynamic';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CasePage({ params }: Params) {
  const { slug } = await params;

  const data = await getCasePlayerData(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="unz-case-page">
      <div className="unz-case-overlay" />
      <div className="unz-case-shell">
        <CasePlayer
          slug={data.slug}
          initialNode={data.node}
          plush={data.plush}
        />
      </div>
    </main>
  );
}