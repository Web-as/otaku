'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, Send, Star, MessageSquare, CheckCircle, Megaphone } from 'lucide-react';
import type { AnimeItem } from '@/types/types';
import { buildMagicSyncInput, type MagicSyncPreset } from '@/shared/trackerBlog/sync';
import { useTrackerBlogSync } from '@/hooks/useTrackerBlogSync';
import LibrarianWhispers from '../blog/LibrarianWhispers';

interface TrackerBlogSyncModalProps {
  anime: AnimeItem | null;
  onClose: () => void;
}

const PRESETS: { id: MagicSyncPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'status', label: 'Status', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'rating', label: 'Rating', icon: <Star className="w-4 h-4" /> },
  { id: 'review', label: 'Quick review', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'recommend', label: 'Recommend', icon: <Megaphone className="w-4 h-4" /> },
];

export default function TrackerBlogSyncModal({ anime, onClose }: TrackerBlogSyncModalProps) {
  const { syncToBlog, suggestPreset } = useTrackerBlogSync();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [preset, setPreset] = useState<MagicSyncPreset>('status');
  const [content, setContent] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!anime) return;
    const p = suggestPreset(anime);
    setPreset(p);
    setContent(buildMagicSyncInput(anime, p).content);
    setStep(1);
    setError('');
  }, [anime, suggestPreset]);

  if (!anime) return null;

  const finalContent = thoughts.trim() ? `${content}\n\n### Thoughts / Review:\n${thoughts.trim()}` : content;
  const preview = buildMagicSyncInput(anime, preset, { content: finalContent });

  const validateAntiCheat = (): boolean => {
    if (preset === 'status' && anime.status === 'Completed') {
      const ep = anime.episodes ?? 0;
      const prog = anime.progress ?? anime.watched ?? 0;
      if (ep > 0 && prog < ep) {
        setError(`❌ Cannot sync as Completed: You haven't watched all the episodes yet! (${prog}/${ep})`);
        return false;
      }
    }
    return true;
  };

  const handleMagicOneClick = async () => {
    if (!validateAntiCheat()) return;
    setBusy(true);
    setError('');
    try {
      await syncToBlog(anime, { preset: suggestPreset(anime), publish: false, navigate: true });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!validateAntiCheat()) return;
    setBusy(true);
    setError('');
    try {
      await syncToBlog(anime, { preset, content: finalContent, publish: true, navigate: true });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateAntiCheat()) return;
    setBusy(true);
    setError('');
    try {
      await syncToBlog(anime, { preset, content: finalContent, publish: false, navigate: true });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#1a1a2e] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
              Tracker → Blog · Step {step}/3
            </p>
            <h2 className="text-lg font-bold text-white truncate">{anime.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {step === 1 && (
            <>
              <p className="text-sm text-gray-400">
                One tap syncs your tracker entry to the blog as a draft. Customize to see Kana&apos;s
                faint anime-specific questions behind the editor.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={handleMagicOneClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-violet-600 text-black font-bold text-sm hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                Magic sync (1 click → blog draft)
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2 text-sm text-violet-300 hover:text-white border border-white/10 rounded-lg"
              >
                Customize → then publish
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-400">Pick how this appears on the gazette.</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPreset(p.id);
                      setContent(buildMagicSyncInput(anime, p.id).content);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition ${
                      preset === p.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-100'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
              <LibrarianWhispers
                context={{
                  animeId: anime.id,
                  title: anime.title,
                  status: anime.status,
                  episodesWatched: anime.progress ?? anime.watched,
                  totalEpisodes: anime.episodes,
                  postType:
                    preset === 'review'
                      ? 'quick_review'
                      : preset === 'rating'
                        ? 'rating'
                        : preset === 'recommend'
                          ? 'recommendation'
                          : 'status_update',
                }}
              />
              <div className="blog relative space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Base Content</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:border-violet-500 outline-none"
                    placeholder="System generated content..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-amber-400/80 mb-2 uppercase tracking-widest">Add your thoughts/review (Optional)</label>
                  <textarea
                    value={thoughts}
                    onChange={e => setThoughts(e.target.value)}
                    maxLength={1500}
                    rows={4}
                    className="w-full bg-black border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-white resize-none focus:border-amber-500 outline-none transition"
                    placeholder="Write your review or thoughts — faint questions above are from Kana (Anime Librarian)"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold"
              >
                Next: publish or save draft
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-700 text-sm text-gray-300">
                {preview.content}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSaveDraft}
                  className="flex-1 py-2.5 rounded-lg border border-gray-600 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  Save draft on blog
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handlePublish}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Publish now
                </button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
