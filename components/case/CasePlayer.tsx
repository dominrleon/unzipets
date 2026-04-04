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

type PlushData = {
  id: string;
  name: string;
  slug: string;
};

const plushVisualMap: Record<
  string,
  {
    imageUrl: string;
    race: string;
    age: string;
    origin: string;
  }
> = {
  flash: {
    imageUrl: '/unzipets/animals/flash.png',
    race: 'GREEN TURTLE',
    age: '23 YEARS',
    origin: 'AKUMAL',
  },
  luna: {
    imageUrl: '/unzipets/animals/luna.png',
    race: 'UNKNOWN',
    age: 'UNKNOWN',
    origin: 'UNKNOWN',
  },
  rocky: {
    imageUrl: '/unzipets/animals/rocky.png',
    race: 'UNKNOWN',
    age: 'UNKNOWN',
    origin: 'UNKNOWN',
  },
};

const defaultPlushVisual = {
  imageUrl: '/unzipets/animals/fallback.png',
  race: 'UNKNOWN',
  age: 'UNKNOWN',
  origin: 'UNKNOWN',
};

export default function CasePlayer({
  slug,
  initialNode,
  plush,
}: {
  slug: string;
  initialNode: NodeData;
  plush: PlushData;
}) {
  const [node, setNode] = useState<NodeData>(initialNode);
  const [loading, setLoading] = useState(false);

  const plushUi = plushVisualMap[plush.slug] ?? defaultPlushVisual;
  const isEnding = node.type === 'ENDING';

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

  return (
    <div className="unz-phone">
      <div className="unz-phone-notch" />

      <div className="unz-phone-header">
        <img
          src="/unzipets/ui/logo.png"
          alt="Unzipets"
          className="unz-phone-logo"
        />
        <div className="unz-phone-subtitle">POLICE CASE</div>
      </div>

      <div className="unz-phone-body">
        <div className="unz-file-card">
          <div className="unz-file-top-row">
            <span>FILE: 18100225AF</span>
            <span>DATE: 18/11/2025</span>
          </div>

          <div className="unz-file-info">
            <div className="unz-file-animal">
              <img src={plushUi.imageUrl} alt={plush.name} />
            </div>

            <div className="unz-file-meta">
              <p><strong>NAME:</strong> {plush.name.toUpperCase()}</p>
              <p><strong>AGE:</strong> {plushUi.age}</p>
              <p><strong>RACE:</strong> {plushUi.race}</p>
              <p><strong>ORIGIN:</strong> {plushUi.origin}</p>
            </div>
          </div>

          <div className="unz-file-copy">
            INVESTIGATE THE CAUSE OF DEATH,
            <br />
            DISCOVER THE TRUTH!
          </div>

          {isEnding ? (
            <>
              <div className="unz-ending-title">
                YOU FOUND A VIDEO EVIDENCE!
                <br />
                CHECK IT OUT!
              </div>

              {node.videoUrl ? (
                <div className="unz-video-box">
                  <video controls>
                    <source src={node.videoUrl} />
                  </video>
                </div>
              ) : (
                <div className="unz-video-box unz-video-box--empty">
                  No video available for this ending.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="unz-question-box">
                {node.content || 'WHAT HAPPENED?'}
              </div>

              <div className="unz-answer-row">
                {node.answers?.map((answer) => (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswer(answer.id)}
                    disabled={loading}
                    className="unz-answer-button"
                    type="button"
                  >
                    {answer.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="unz-phone-footer">
        <button className="unz-explore-button" type="button">
          EXPLORE MORE
        </button>
      </div>
    </div>
  );
}