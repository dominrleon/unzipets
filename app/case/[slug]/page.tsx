import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedCaseBySlug } from '@/lib/cases';

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const investigationCase = await getPublishedCaseBySlug(slug);

  if (!investigationCase || !investigationCase.startNode) {
    notFound();
  }

  const node = investigationCase.startNode;

  return (
    <main className="page">
      <div className="container">
        <div className="mobile-frame">
          <div className="mobile-screen">
            <div>
              <span className="badge">{investigationCase.introTitle || 'Police Case'}</span>
              <p className="muted">{investigationCase.plush.name}</p>
              <h1 style={{ fontSize: '2rem' }}>{node.title}</h1>
              {node.body ? <p className="muted">{node.body}</p> : null}
            </div>

            <div className="answer-list">
              {node.answers.map((answer) => (
                <div className="card" key={answer.id}>
                  <strong>{answer.label}</strong>
                  <p className="muted" style={{ marginBottom: 16 }}>
                    Demo link to: {answer.nextNode.title}
                  </p>
                  <Link href="#" className="button" style={{ width: '100%' }}>
                    Continue
                  </Link>
                </div>
              ))}
            </div>

            <div>
              <p className="muted" style={{ fontSize: 12 }}>
                This is the initial visual base. Next step: real answer navigation with persistent state.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
