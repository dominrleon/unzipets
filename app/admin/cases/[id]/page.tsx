import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminCaseById } from '@/lib/cases';

export const dynamic = 'force-dynamic';

export default async function AdminCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseItem = await getAdminCaseById(id);

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Admin / Cases</p>
            <h1 className="text-3xl font-bold">{caseItem.title}</h1>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            Tornar
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
            <p><strong>ID:</strong> {caseItem.id}</p>
            <p><strong>Slug:</strong> {caseItem.slug}</p>
            <p><strong>Plush:</strong> {caseItem.plush.name}</p>
            <p><strong>Language:</strong> {caseItem.language}</p>
            <p><strong>Status:</strong> {caseItem.status}</p>
            <p><strong>Scans:</strong> {caseItem._count.scans}</p>
            <p><strong>Start node:</strong> {caseItem.startNode?.internalKey ?? '—'}</p>
            <p><strong>Total nodes:</strong> {caseItem.nodes.length}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Nodes</h2>

          <div className="space-y-4">
            {caseItem.nodes.map((node) => (
              <article
                key={node.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">
                    {node.type}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">
                    {node.internalKey}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">
                    order: {node.sortOrder}
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-semibold">
                  {node.title ?? 'Sense títol'}
                </h3>

                <p className="mb-3 whitespace-pre-line text-zinc-300">
                  {node.content ?? 'Sense contingut'}
                </p>

                {node.videoUrl ? (
                  <p className="mb-3 break-all text-sm text-zinc-400">
                    <strong>Vídeo:</strong> {node.videoUrl}
                  </p>
                ) : null}

                {node.answers.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Respostes
                    </h4>

                    {node.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                      >
                        <p className="text-white">{answer.label}</p>
                        <p className="text-zinc-400">
                          → {answer.nextNode.internalKey}
                          {answer.nextNode.title ? ` (${answer.nextNode.title})` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Este node no té respostes.</p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}