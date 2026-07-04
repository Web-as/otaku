'use client';

import React, { useEffect, useState } from 'react';
import { getLibrarianComments, type LibrarianComment } from '@/shared/librarian';

function renderBody(body: string) {
  const parts = body.split(/\*\*(.*?)\*\*/g);
  return parts.map((bit, i) =>
    i % 2 === 1 ? (
      <strong key={`b-${i}-${bit.slice(0, 8)}`}>{bit}</strong>
    ) : (
      <span key={`t-${i}-${bit.slice(0, 8)}`}>{bit}</span>
    ),
  );
}

export default function LibrarianCommentThread({ postId }: { postId: string }) {
  const [comments, setComments] = useState<LibrarianComment[]>([]);

  const reload = () => setComments(getLibrarianComments(postId));

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener('librarian-comments-updated', onUpdate);
    return () => window.removeEventListener('librarian-comments-updated', onUpdate);
  }, [postId]);

  if (comments.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="blog-librarian-comment">
          {renderBody(c.body)}
        </div>
      ))}
    </div>
  );
}
