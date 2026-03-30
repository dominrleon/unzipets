export const dynamic = 'force-dynamic';

import { getAdminCaseList } from '@/lib/cases';

export default async function AdminPage() {
  const cases = await getAdminCaseList();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="mb-2 text-3xl font-bold">Admin area</h1>
          <p className="text-zinc-300">
            Base dashboard. Here we will add authentication, CRUD for plushies,
            cases, decision trees, final videos and QR generation.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Cases</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-zinc-400">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Plush</th>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Nodes</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2">{item.plush.name}</td>
                    <td className="px-3 py-2">{item.language}</td>
                    <td className="px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2">{item.nodes.length}</td>
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