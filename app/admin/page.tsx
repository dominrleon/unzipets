export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminCaseList } from '@/lib/cases';
import { createCase } from './actions';

export default async function AdminPage() {
  const cases = await getAdminCaseList();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Admin area</h1>
              <p className="text-zinc-300">
                Cases, nodes, endings and QR codes.
              </p>
            </div>

            <a
              href="#create-case"
              className="inline-flex rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Create new case
            </a>
          </div>
        </section>

        <section id="create-case" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Create new case</h2>
            <p className="mt-1 text-sm text-zinc-400">
              This creates a draft case with its plush and an initial start node.
            </p>
          </div>

          <form action={createCase} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Case title</label>
                <input
                  name="title"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Milo's mystery"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Case slug</label>
                <input
                  name="slug"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="milos-mystery"
                />
                <p className="mt-1 text-xs text-zinc-500">Leave it empty to generate it from the title.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Plush name</label>
                <input
                  name="plushName"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Milo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Plush slug</label>
                <input
                  name="plushSlug"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="milo"
                />
                <p className="mt-1 text-xs text-zinc-500">Leave it empty to generate it from the plush name.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Language</label>
                <input
                  name="language"
                  defaultValue="en"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Create case
            </button>
          </form>
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
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Plush</th>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Start node</th>
                  <th className="px-3 py-2">Nodes</th>
                  <th className="px-3 py-2">Scans</th>
                  <th className="px-3 py-2">Edit</th>
                  <th className="px-3 py-2">View</th>
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
                        Edit
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/case/${item.slug}`}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        View
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