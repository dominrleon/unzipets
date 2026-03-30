import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page">
      <div className="container grid">
        <section className="hero card">
          <div>
            <span className="badge">Interactive QR investigations</span>
            <h1>They are not normal plushies. They are UNZIPETS.</h1>
            <p className="muted">
              Landing base for the public website. Each plush has its own QR, its own investigation,
              and 7 possible endings with video.
            </p>
            <div className="actions">
              <Link href="/case/flash" className="button">
                Open demo case
              </Link>
              <Link href="/admin" className="button secondary">
                Admin area
              </Link>
            </div>
          </div>
          <div className="card">
            <h2>Initial scope</h2>
            <ul className="muted">
              <li>8 plushies initially</li>
              <li>1 QR per plush</li>
              <li>1 decision tree per case</li>
              <li>7 possible endings</li>
              <li>Cloudflare video integration</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
