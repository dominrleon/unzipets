import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminCaseById, validateCaseGraph } from '@/lib/cases';
import {
  createDecisionAnswer,
  createDecisionNode,
  deleteDecisionAnswer,
  deleteDecisionNode,
  updateDecisionAnswer,
  updateDecisionNode,
} from './actions';

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

const validation = await validateCaseGraph(id);

  const createNodeAction = createDecisionNode.bind(null, caseItem.id);
  const createAnswerAction = createDecisionAnswer.bind(null, caseItem.id);
  const updateNodeAction = updateDecisionNode.bind(null, caseItem.id);
  const updateAnswerAction = updateDecisionAnswer.bind(null, caseItem.id);
  const deleteNodeAction = deleteDecisionNode.bind(null, caseItem.id);
  const deleteAnswerAction = deleteDecisionAnswer.bind(null, caseItem.id);

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
          <h2 className="mb-4 text-2xl font-semibold">Crear node</h2>

          <form action={createNodeAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Internal key</label>
                <input
                  name="internalKey"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="start-question"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Type</label>
                <select
                  name="type"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  defaultValue="QUESTION"
                >
                  <option value="QUESTION">QUESTION</option>
                  <option value="ENDING">ENDING</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Title</label>
                <input
                  name="title"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Pregunta 1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Sort order</label>
                <input
                  name="sortOrder"
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Si ho deixes buit, va al final"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-300">Content</label>
              <textarea
                name="content"
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="Text del node"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-300">Video URL</label>
              <input
                name="videoUrl"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="https://..."
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="setAsStartNode"
                className="h-4 w-4 rounded border-white/20 bg-black/20"
              />
              Marcar este node com a start node
            </label>

            <div>
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Crear node
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Crear resposta</h2>

          <form action={createAnswerAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Node pregunta</label>
                <select
                  name="nodeId"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona un node QUESTION
                  </option>
                  {caseItem.nodes
                    .filter((node) => node.type === 'QUESTION')
                    .map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.internalKey}
                        {node.title ? ` — ${node.title}` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Node següent</label>
                <select
                  name="nextNodeId"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona el node destí
                  </option>
                  {caseItem.nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.internalKey}
                      {node.title ? ` — ${node.title}` : ''}
                      {` [${node.type}]`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Text de la resposta</label>
                <input
                  name="label"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Sí, continuar"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Sort order</label>
                <input
                  name="sortOrder"
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Si ho deixes buit, va al final"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Crear resposta
              </button>
            </div>
          </form>
        </section>

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
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Validació del graf</h2>
                <span
                className={`rounded-full px-3 py-1 text-sm ${
                    validation.isValid
                    ? 'border border-green-500/30 text-green-300'
                    : 'border border-yellow-500/30 text-yellow-300'
                }`}
                >
                {validation.isValid ? 'Vàlid' : 'Amb incidències'}
                </span>
            </div>

            <div className="mb-4 grid gap-3 text-sm text-zinc-300 md:grid-cols-4">
                <p><strong>Total nodes:</strong> {validation.stats.totalNodes}</p>
                <p><strong>Reachables:</strong> {validation.stats.reachableNodes}</p>
                <p><strong>Orfes:</strong> {validation.stats.orphanNodes}</p>
                <p><strong>Finals reachables:</strong> {validation.stats.reachableEndings}</p>
            </div>

            {validation.issues.length > 0 ? (
                <div className="space-y-2">
                {validation.issues.map((issue, index) => (
                    <div
                    key={`${index}-${issue}`}
                    className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-100"
                    >
                    {issue}
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-green-300">
                El case està ben connectat i no s’han detectat incidències estructurals.
                </p>
            )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Nodes</h2>

          <div className="space-y-4">
            {caseItem.nodes.map((node) => (
              <article
                key={node.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <form action={updateNodeAction} className="space-y-3">
                  <input type="hidden" name="nodeId" value={node.id} />

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span>{node.internalKey}</span>
                    <span>{node.type}</span>
                    <span>order: {node.sortOrder}</span>
                  </div>

                  <input
                    name="title"
                    defaultValue={node.title ?? ''}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                    placeholder="Títol"
                  />

                  <textarea
                    name="content"
                    defaultValue={node.content ?? ''}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                    placeholder="Contingut"
                  />

                  <input
                    name="videoUrl"
                    defaultValue={node.videoUrl ?? ''}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                    placeholder="Video URL"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="type"
                      defaultValue={node.type}
                      className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                    >
                      <option value="QUESTION">QUESTION</option>
                      <option value="ENDING">ENDING</option>
                    </select>

                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={node.sortOrder}
                      className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input type="checkbox" name="setAsStartNode" />
                    Marcar com start node
                  </label>

                  <button
                    type="submit"
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Guardar canvis
                  </button>
                </form>
                <form action={deleteNodeAction} className="mt-3">
                    <input type="hidden" name="nodeId" value={node.id} />
                    <button
                        type="submit"
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                    >
                        Eliminar node
                    </button>
                </form>
                {node.answers.length > 0 ? (
  <div className="mt-4 space-y-3">
    <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
      Respostes
    </h4>

   {node.answers.map((answer) => (
  <div
    key={answer.id}
    className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
  >
    <form action={updateAnswerAction} className="space-y-3">
      <input type="hidden" name="answerId" value={answer.id} />

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Text resposta</label>
        <input
          name="label"
          defaultValue={answer.label}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Node destí</label>
          <select
            name="nextNodeId"
            defaultValue={answer.nextNodeId}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
          >
            {caseItem.nodes.map((targetNode) => (
              <option key={targetNode.id} value={targetNode.id}>
                {targetNode.internalKey}
                {targetNode.title ? ` — ${targetNode.title}` : ''}
                {` [${targetNode.type}]`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-400">Sort order</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={answer.sortOrder}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Destí actual: {answer.nextNode.internalKey}
        {answer.nextNode.title ? ` (${answer.nextNode.title})` : ''}
      </p>

      <button
        type="submit"
        className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10"
      >
        Guardar resposta
      </button>
    </form>

    <form action={deleteAnswerAction}>
      <input type="hidden" name="answerId" value={answer.id} />
      <button
        type="submit"
        className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
      >
        Eliminar resposta
      </button>
    </form>
  </div>
))}
  </div>
) : (
  <p className="mt-4 text-sm text-zinc-500">Este node no té respostes.</p>
)}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}