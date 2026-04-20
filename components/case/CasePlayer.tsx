'use client';

import { useEffect, useState } from 'react';

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
  imageUrl: string | null;
  age: number | null;
  birthDate: string | null;
  race: string | null;
  origin: string | null;
  identificationNumber: string | null;
};

type CaseMeta = {
  title: string;
  fileNumber: string | null;
  caseDate: string | null;
  deathDate: string | null;
  deathPlace: string | null;
  causeOfDeath: string | null;
  investigationText: string | null;
};

export default function CasePlayer({
  slug,
  initialNode,
  plush,
  caseMeta,
}: {
  slug: string;
  initialNode: NodeData;
  plush: PlushData;
  caseMeta: CaseMeta;
}) {
  const [node, setNode] = useState<NodeData>(initialNode);
  const [loading, setLoading] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

const isEnding = node.type === 'ENDING';

useEffect(() => {
  if (!isEnding) {
    setIsVideoOpen(false);
  }
}, [isEnding]);

  const plushImage = plush.imageUrl || '/unzipets/animals/fallback.png';
  const plushAge =
    plush.age !== null && plush.age !== undefined
      ? `${plush.age} YEARS`
      : 'UNKNOWN';
  const plushRace = plush.race ? plush.race.toUpperCase() : 'UNKNOWN';
  const plushOrigin = plush.origin ? plush.origin.toUpperCase() : 'UNKNOWN';

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
            <span>FILE: {caseMeta.fileNumber || 'UNKNOWN'}</span>
            <span>DATE: {caseMeta.caseDate || 'UNKNOWN'}</span>
          </div>

          <div className="unz-file-info">
            <div className="unz-file-animal">
              <img src={plushImage} alt={plush.name} />
            </div>

            <div className="unz-file-meta">
              <p><strong>NAME:</strong> {plush.name.toUpperCase()}</p>
              <p><strong>AGE:</strong> {plushAge}</p>
              <p><strong>RACE:</strong> {plushRace}</p>
              <p><strong>ORIGIN:</strong> {plushOrigin}</p>
            </div>
          </div>

          <div className="unz-file-copy">
            {caseMeta.investigationText || 'INVESTIGATE THE CAUSE OF DEATH, DISCOVER THE TRUTH!'}
          </div>

          {isEnding ? (
  <>
    <div className="unz-ending-title">
      YOU FOUND A VIDEO EVIDENCE!
      <br />
      CHECK IT OUT!
    </div>

    {node.videoUrl ? (
      <>
        <button
          type="button"
          className="unz-watch-video-button"
          onClick={() => setIsVideoOpen(true)}
        >
          WATCH VIDEO
        </button>

        {isVideoOpen && (
          <div
            className="unz-video-modal-overlay"
            onClick={() => setIsVideoOpen(false)}
          >
            <div
              className="unz-video-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="unz-video-modal-close"
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close video"
              >
                ×
              </button>

              <div className="unz-video-modal-title">
                YOU FOUND A VIDEO EVIDENCE!
                <br />
                CHECK IT OUT!
              </div>

              <div className="unz-video-modal-box">
                <video
                  controls
                  autoPlay
                  playsInline
                  className="unz-video-modal-player"
                >
                  <source src={node.videoUrl} />
                </video>
              </div>

              <button
                type="button"
                className="unz-explore-button unz-explore-button--modal"
                onClick={() => setIsVideoOpen(false)}
              >
              </button>
            </div>
          </div>
        )}
      </>
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
        <button
          className="unz-explore-button"
          type="button"
          onClick={() => {
            if (isVideoOpen) {
              setIsVideoOpen(false);
            }
          }}
        >
        </button>
      </div>
    </div>
  );
}