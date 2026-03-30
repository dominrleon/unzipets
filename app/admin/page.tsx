export const dynamic = 'force-dynamic';
import { getAdminCaseList } from '@/lib/cases';

export default async function AdminPage() {
  const cases = await getAdminCaseList();

  return (
    <main className="page">
      <div className="container grid">
        <section className="card">
          <h1>Admin area</h1>
          <p className="muted">
            Initial dashboard base. Here we will add authentication, CRUD for plushies, decision trees,
            final videos and QR generation.
          </p>
        </section>

        <section className="card">
          <h2>Cases</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Plush</th>
                <th>Locale</th>
                <th>Status</th>
                <th>Nodes</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.plush.name}</td>
                  <td>{item.locale}</td>
                  <td>{item.status}</td>
                  <td>{item.nodes.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="card">
            <h3>Next feature</h3>
            <p className="muted">Authentication with protected admin session.</p>
          </div>
          <div className="card">
            <h3>Next feature</h3>
            <p className="muted">Decision tree editor for questions and endings.</p>
          </div>
          <div className="card">
            <h3>Next feature</h3>
            <p className="muted">Cloudflare Stream upload and video assignment.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
