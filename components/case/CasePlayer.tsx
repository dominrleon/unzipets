'use client';

import { useState } from 'react';

type Answer = {
  id: string;
  label: string;
};

type NodeData = {
  id: string;
  type: 'QUESTION' | 'ENDING';
  title: string | null;
  content: string | null;
  videoUrl?: string | null;
  answers?: Answer[];
};

export default function CasePlayer({
  slug,
  initialNode,
}: {
  slug: string;
  initialNode: NodeData;
}) {
  const [node, setNode] = useState<NodeData>(initialNode);
  const [loading, setLoading] = useState(false);

  async function handleAnswer(answerId: string) {
    try {
      setLoading(true);

      const response = await fetch(`/api/cases/${slug}/next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to load next node');
      }

      const data = await response.json();
      setNode(data.node);
    } catch (error) {
      console.error(error);
      alert('There was an error loading the next step.');
    } finally {
      setLoading(false);
    }
  }

  if (node.type === 'ENDING') {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-400">Final result</p>
        <h1 className="mb-4 text-3xl font-bold text-white">{node.title}</h1>
        <p className="mb-6 text-zinc-300">{node.content}</p>

        {node.videoUrl ? (
          <video controls className="w-full rounded-xl">
            <source src={node.videoUrl} />
          </video>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-400">Investigation</p>
      <h1 className="mb-4 text-3xl font-bold text-white">{node.title}</h1>
      <p className="mb-6 text-zinc-300">{node.content}</p>

      <div className="space-y-3">
        {node.answers?.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleAnswer(answer.id)}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {answer.label}
          </button>
        ))}
      </div>
    </div>
  );
}