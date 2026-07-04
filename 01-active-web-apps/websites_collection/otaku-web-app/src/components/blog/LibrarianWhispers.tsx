'use client';

import React, { useMemo } from 'react';
import {
  generateLibrarianPrompts,
  LIBRARIAN_PERSONA,
  type LibrarianAnimeContext,
} from '@/shared/librarian';
import '@/shared/librarian/librarianWhispers.css';

type Props = {
  context: LibrarianAnimeContext;
  maxPrompts?: number;
  className?: string;
};

/** Transparent ghost questions Kana asks about the anime being posted. */
export default function LibrarianWhispers({ context, maxPrompts = 4, className = '' }: Props) {
  const prompts = useMemo(
    () => generateLibrarianPrompts(context).slice(0, maxPrompts),
    [context, maxPrompts],
  );

  if (!context.title?.trim()) return null;

  return (
    <div className={`blog ${className}`}>
      <div className="blog-librarian-header">
        <span>{LIBRARIAN_PERSONA.emoji}</span>
        <span>
          {LIBRARIAN_PERSONA.name} — topics to write about
        </span>
      </div>
      <div className="blog-librarian-whispers" aria-hidden="true">
        {prompts.map((p) => (
          <p key={p.id} className="blog-librarian-whisper">
            {p.text}
          </p>
        ))}
      </div>
    </div>
  );
}
