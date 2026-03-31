export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminCaseList } from '@/lib/cases';

export default async function AdminPage() {
  const cases = await getAdminCaseList();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="mb-2 text-3xl font-bold">Admin area</h1>
          <p className="text-zinc-300">
            Gestió de casos, nodes, finals i QR.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Cases</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-zinc-400">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Plush</th>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Nodes</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="px-3 py-2 font-medium text-white">{item.title}</td>
                    <td className="px-3 py-2 text-zinc-300">{item.slug}</td>
                    <td className="px-3 py-2">{item.plush.name}</td>
                    <td className="px-3 py-2">{item.language}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border border-white/10 px-2 py-1 text-xs">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      {item.startNode?.internalKey ?? '—'}
                    </td>
                    <td className="px-3 py-2">{item.nodes.length}</td>
                    <td className="px-3 py-2">{item._count.scans}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        Editar
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        Veure
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}