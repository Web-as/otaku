import { useReducer, useMemo } from 'react';
import {
  Dice5,
  PartyPopper,
  Sparkles,
  ArrowRight,
  Heart,
  Swords,
} from 'lucide-react';
import { PREREGISTER_APPS, type PreregisterAppKey, persistPreregisterState } from '../preregister';
import { signUp, getReadableAuthError, getCurrentUser } from '../firebase';
import type { User } from 'firebase/auth';
import { isSupabaseConfigured } from '../supabase/config';
import type { HubUrls } from './landing/LandingSections';

const SUBMIT_COOLDOWN_MS = 6000;
const LAST_SUBMIT_KEY = 'otaku_preregister_last_submit_hub';
const HUB_QUEST_SEED_KEY = 'otaku_hub_quest_seed';
const HUB_ROLL_COUNTER_KEY = 'otaku_hub_quest_roll_n';

function getOrCreateHubSessionSeed(): string {
  try {
    let s = sessionStorage.getItem(HUB_QUEST_SEED_KEY);
    if (!s) {
      s =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(HUB_QUEST_SEED_KEY, s);
    }
    return s;
  } catch {
    return 'fallback-seed';
  }
}

function deterministicPickFromSeed(seed: string, counter: number, choices: string[]): string {
  let h = counter * 0x9e3779b9;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 0x85ebca6b);
    h ^= h >>> 13;
  }
  const idx = Math.abs(h) % choices.length;
  return choices[idx]!;
}

function VictoryConfetti() {
  const colors = ['#a78bfa', '#f472b6', '#22d3ee', '#fbbf24', '#34d399'];
  return (
    <div className="relative h-20 sm:h-24 overflow-visible pointer-events-none mb-1" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="landing-confetti-piece"
          style={{
            left: `${(i * 6.25) % 94}%`,
            top: 4,
            background: colors[i % colors.length]!,
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
    </div>
  );
}

type Step = 'welcome' | 'trial' | 'party' | 'signup' | 'victory';

type State = {
  step: Step;
  rollFlavor: string;
  trialMatched: boolean;
  trialSelections: number[];
  selectedApps: Record<PreregisterAppKey, boolean>;
  email: string;
  password: string;
  displayName: string;
  marketingOptIn: boolean;
  honeypot: string;
  error: string | null;
  submitting: boolean;
  supabaseWarning: string | null;
  userPostSignup: User | null;
};

const initialApps: Record<PreregisterAppKey, boolean> = {
  unified: true,
  blog: true,
  profiles: true,
  dmf_rpg: false,
};

const initialState: State = {
  step: 'welcome',
  rollFlavor: '',
  trialMatched: false,
  trialSelections: [],
  selectedApps: { ...initialApps },
  email: '',
  password: '',
  displayName: '',
  marketingOptIn: false,
  honeypot: '',
  error: null,
  submitting: false,
  supabaseWarning: null,
  userPostSignup: null,
};

type Action =
  | { type: 'next'; step?: Step }
  | { type: 'set_roll'; text: string }
  | { type: 'trial_toggle'; index: number }
  | { type: 'trial_reset' }
  | { type: 'toggle_app'; key: PreregisterAppKey }
  | { type: 'field'; field: keyof Pick<State, 'email' | 'password' | 'displayName' | 'honeypot'>; value: string }
  | { type: 'marketing'; value: boolean }
  | { type: 'error'; message: string | null }
  | { type: 'submit_start' }
  | { type: 'submit_done'; user: User; warning: string | null }
  | { type: 'victory_reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'next':
      return { ...state, step: action.step ?? state.step, error: null };
    case 'set_roll':
      return { ...state, rollFlavor: action.text };
    case 'trial_toggle': {
      const idx = action.index;
      let next = [...state.trialSelections];
      if (next.includes(idx)) next = next.filter((i) => i !== idx);
      else if (next.length < 2) next = [...next, idx];
      const matched = next.length === 2 && next[0] % 3 === next[1] % 3;
      return { ...state, trialSelections: next, trialMatched: matched };
    }
    case 'trial_reset':
      return { ...state, trialSelections: [], trialMatched: false };
    case 'toggle_app':
      return {
        ...state,
        selectedApps: { ...state.selectedApps, [action.key]: !state.selectedApps[action.key] },
      };
    case 'field':
      return { ...state, [action.field]: action.value };
    case 'marketing':
      return { ...state, marketingOptIn: action.value };
    case 'error':
      return { ...state, error: action.message, submitting: false };
    case 'submit_start':
      return { ...state, submitting: true, error: null };
    case 'submit_done':
      return {
        ...state,
        submitting: false,
        userPostSignup: action.user,
        supabaseWarning: action.warning,
        step: 'victory',
      };
    case 'victory_reset':
      return { ...initialState, selectedApps: { ...initialApps } };
    default:
      return state;
  }
}

const TRIAL_CARD_COUNT = 6;

export type PreregisterQuestGameProps = {
  hubUrls: HubUrls;
  dmFriendRpgUrl?: string;
  id?: string;
};

export function PreregisterQuestGame({ hubUrls, dmFriendRpgUrl, id }: PreregisterQuestGameProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const supabaseEnabled = isSupabaseConfigured();
  const preregisterBase = hubUrls.preregisterUrl?.replace(/\/$/, '') || '';

  const optedApps = useMemo(
    () =>
      (Object.entries(state.selectedApps) as [PreregisterAppKey, boolean][])
        .filter(([, v]) => v)
        .map(([k]) => k),
    [state.selectedApps],
  );

  const dmUrl = dmFriendRpgUrl || '';

  function rollCosmetic() {
    const picks = [
      'Lucky aura +1 (cosmetic)',
      'Guild resonance stable',
      'Critical hype — narrative only',
      'Sync coefficient nominal',
      'Party buff visualization only',
    ];
    try {
      const seed = getOrCreateHubSessionSeed();
      const n = Number(sessionStorage.getItem(HUB_ROLL_COUNTER_KEY) || '0');
      const text = deterministicPickFromSeed(seed, n, picks);
      sessionStorage.setItem(HUB_ROLL_COUNTER_KEY, String(n + 1));
      dispatch({ type: 'set_roll', text });
    } catch {
      dispatch({ type: 'set_roll', text: picks[0]! });
    }
  }

  function advanceFromWelcome() {
    rollCosmetic();
    dispatch({ type: 'next', step: 'trial' });
  }

  function advanceFromTrial() {
    dispatch({ type: 'trial_reset' });
    dispatch({ type: 'next', step: 'party' });
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (state.submitting) return;
    if (state.honeypot.trim()) return;

    const now = Date.now();
    const last = Number(sessionStorage.getItem(LAST_SUBMIT_KEY) || 0);
    if (last && now - last < SUBMIT_COOLDOWN_MS) {
      dispatch({ type: 'error', message: 'Please wait a few seconds and try again.' });
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
    if (!emailOk) {
      dispatch({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!state.password || state.password.length < 6) {
      dispatch({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (optedApps.length === 0) {
      dispatch({ type: 'error', message: 'Select at least one app to preregister for.' });
      return;
    }

    sessionStorage.setItem(LAST_SUBMIT_KEY, String(now));
    dispatch({ type: 'submit_start' });

    try {
      await signUp(state.email.trim(), state.password, state.displayName.trim() || undefined);
      const user = getCurrentUser();
      if (!user) throw new Error('Missing authenticated user after signup.');

      let warning: string | null = null;
      if (supabaseEnabled) {
        const result = await persistPreregisterState({
          userId: user.uid,
          email: user.email || state.email.trim(),
          displayName: user.displayName || state.displayName.trim() || undefined,
          optedApps,
          marketingOptIn: state.marketingOptIn,
        });
        if (!result.success) warning = result.error || 'Could not save preregister prefs.';
      } else {
        warning = null;
      }

      dispatch({ type: 'submit_done', user, warning });
    } catch (err: unknown) {
      dispatch({
        type: 'error',
        message: getReadableAuthError(err as { code?: string; message?: string }),
      });
    }
  }

  return (
    <section
      id={id ?? 'guild-preregister-quest'}
      className="py-12 px-4 border-y border-violet-500/20 bg-gradient-to-b from-violet-950/40 to-transparent"
      aria-labelledby="quest-heading"
    >
      <div className="max-w-4xl mx-auto hud-panel p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="shrink-0 flex md:flex-col items-center gap-3 justify-center md:justify-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center border border-white/20 shadow-lg">
              <Swords className="w-10 h-10 text-white" aria-hidden />
            </div>
            <p className="text-xs font-mono text-cyan-300/90 uppercase tracking-widest hidden md:block">DM Friend</p>
          </div>

          <div className="flex-1 min-w-0">
            <h2 id="quest-heading" className="anime-display text-2xl sm:text-3xl font-bold text-white mb-1">
              Guild preregister quest
            </h2>
            <p className="text-sm text-zinc-400 mb-6">Multi-step onboarding — scripted guide, real account creation.</p>

            {/* Step indicators */}
            <ol className="flex flex-wrap gap-2 mb-6 text-[10px] sm:text-xs font-mono uppercase" aria-label="Quest steps">
              {(['welcome', 'trial', 'party', 'signup', 'victory'] as Step[]).map((s, i) => (
                <li
                  key={s}
                  className={`px-2 py-1 rounded border ${
                    state.step === s ? 'border-cyan-400 text-cyan-200 bg-cyan-500/10' : 'border-white/15 text-zinc-500'
                  }`}
                >
                  {i + 1}. {s}
                </li>
              ))}
            </ol>

            {state.step === 'welcome' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-black/30 border border-white/10 p-4 font-medium text-zinc-200 leading-relaxed">
                  <Sparkles className="inline w-4 h-4 text-amber-300 mr-1" aria-hidden />
                  Welcome, traveler. I am your{' '}
                  <span className="text-pink-300">DM Friend</span> — here to guild-register you across the Otaku Network.
                  Roll for flavor, face a tiny trial (optional to fail), choose your party apps, then seal the pact.
                </div>
                <button
                  type="button"
                  onClick={rollCosmetic}
                  className="anime-focus-ring mr-3 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-violet-600/40 border border-violet-400/40 text-sm font-semibold"
                >
                  <Dice5 className="w-4 h-4" aria-hidden /> Roll (cosmetic)
                </button>
                {state.rollFlavor ? (
                  <p className="text-sm text-violet-200 mt-2 border-l-2 border-violet-500 pl-3">{state.rollFlavor}</p>
                ) : null}
                <button
                  type="button"
                  onClick={advanceFromWelcome}
                  className="anime-focus-ring mt-4 w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-pink-500 to-violet-600 text-white flex items-center justify-center gap-2"
                >
                  Begin quest <ArrowRight className="w-4 h-4" aria-hidden />
                </button>
              </div>
            )}

            {state.step === 'trial' && (
              <div className="space-y-4">
                <p className="text-zinc-300 text-sm mb-2">Trial: flip two matching sigils (same column color). Wrong picks only change flavor.</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Array.from({ length: TRIAL_CARD_COUNT }).map((_, i) => {
                    const chosen = state.trialSelections.includes(i);
                    const colorHue = i % 3 === 0 ? 'from-violet-500 to-purple-700' : i % 3 === 1 ? 'from-pink-500 to-rose-700' : 'from-cyan-500 to-teal-700';
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => dispatch({ type: 'trial_toggle', index: i })}
                        className={`anime-focus-ring aspect-square rounded-lg bg-gradient-to-br ${colorHue} border-2 ${
                          chosen ? 'border-amber-300 scale-95' : 'border-transparent'
                        } min-h-[48px]`}
                      >
                        <span className="sr-only">Sigil {i + 1}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-500">
                  Matched pair: {state.trialMatched ? 'Yes — nice!' : state.trialSelections.length >= 2 ? 'Not a pair — onward anyway!' : 'Pick two tiles.'}
                </p>
                <button
                  type="button"
                  onClick={advanceFromTrial}
                  className="anime-focus-ring min-h-[44px] px-6 py-3 rounded-lg font-bold bg-white/10 border border-white/20 w-full sm:w-auto"
                >
                  Continue to party roster
                </button>
              </div>
            )}

            {state.step === 'party' && (
              <div className="space-y-4">
                <p className="text-zinc-300 text-sm">Choose which experiences you want on your roster (at least one).</p>
                <div className="space-y-2">
                  {PREREGISTER_APPS.map((app) => (
                    <label
                      key={app.key}
                      className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer min-h-[44px]"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded"
                        checked={state.selectedApps[app.key]}
                        onChange={() => dispatch({ type: 'toggle_app', key: app.key })}
                      />
                      <span>
                        <span className="font-semibold text-white block">{app.name}</span>
                        <span className="text-xs text-zinc-500">{app.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {!supabaseEnabled ? (
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                    Supabase not configured locally — signup still works; selections may not persist.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'next', step: 'signup' })}
                  disabled={optedApps.length === 0}
                  className="anime-focus-ring min-h-[44px] px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white disabled:opacity-40 w-full sm:w-auto"
                >
                  Seal the pact (account)
                </button>
              </div>
            )}

            {state.step === 'signup' && (
              <form className="space-y-4" onSubmit={submitSignup}>
                <div className="sr-only">
                  <label htmlFor="hub-website-hp">Leave blank</label>
                  <input
                    id="hub-website-hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={state.honeypot}
                    onChange={(e) => dispatch({ type: 'field', field: 'honeypot', value: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1" htmlFor="hub-display">
                    Display name (optional)
                  </label>
                  <input
                    id="hub-display"
                    className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-3 min-h-[44px] text-white"
                    value={state.displayName}
                    onChange={(e) => dispatch({ type: 'field', field: 'displayName', value: e.target.value })}
                    autoComplete="nickname"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1" htmlFor="hub-email">
                    Email
                  </label>
                  <input
                    id="hub-email"
                    type="email"
                    required
                    className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-3 min-h-[44px] text-white"
                    value={state.email}
                    onChange={(e) => dispatch({ type: 'field', field: 'email', value: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1" htmlFor="hub-pass">
                    Password
                  </label>
                  <input
                    id="hub-pass"
                    type="password"
                    required
                    className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-3 min-h-[44px] text-white"
                    value={state.password}
                    onChange={(e) => dispatch({ type: 'field', field: 'password', value: e.target.value })}
                    autoComplete="new-password"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={state.marketingOptIn}
                    onChange={(e) => dispatch({ type: 'marketing', value: e.target.checked })}
                  />
                  <span className="text-sm text-zinc-400">Marketing opt-in (guild news)</span>
                </label>
                {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="anime-focus-ring w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 text-black"
                >
                  {state.submitting ? 'Forging account…' : 'Complete registration'}
                </button>
                {preregisterBase ? (
                  <p className="text-xs text-zinc-500">
                    Prefer the dedicated flow?{' '}
                    <a href={`${preregisterBase}/signup`} className="text-cyan-400 underline underline-offset-2 anime-focus-ring">
                      Open preregister SPA
                    </a>
                  </p>
                ) : null}
              </form>
            )}

            {state.step === 'victory' && (
              <div className="space-y-4 text-center sm:text-left">
                <VictoryConfetti />
                <PartyPopper className="w-14 h-14 text-amber-300 mx-auto sm:mx-0" aria-hidden />
                <h3 className="anime-display text-2xl font-bold text-white">Quest cleared!</h3>
                <p className="text-zinc-300">
                  Signed in as <span className="text-white font-semibold">{state.userPostSignup?.email}</span>.
                </p>
                {state.supabaseWarning ? (
                  <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-400/25 rounded-lg p-3">{state.supabaseWarning}</p>
                ) : (
                  <p className="text-sm text-emerald-300 flex items-center justify-center sm:justify-start gap-2">
                    <Heart className="w-4 h-4" aria-hidden /> Profile preferences saved where Supabase is active.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4">
                  <a
                    href={hubUrls.blogUrl}
                    className="anime-focus-ring min-h-[44px] flex items-center justify-center px-4 py-3 rounded-lg bg-violet-500/20 border border-violet-400/40 font-semibold"
                  >
                    Blog
                  </a>
                  <a
                    href={hubUrls.trackerUrl}
                    className="anime-focus-ring min-h-[44px] flex items-center justify-center px-4 py-3 rounded-lg bg-pink-500/20 border border-pink-400/40 font-semibold"
                  >
                    Tracker
                  </a>
                  <a
                    href={hubUrls.programUrl}
                    className="anime-focus-ring min-h-[44px] flex items-center justify-center px-4 py-3 rounded-lg bg-amber-500/20 border border-amber-400/40 font-semibold"
                  >
                    Program
                  </a>
                  {state.selectedApps.dmf_rpg && dmUrl ? (
                    <a
                      href={dmUrl}
                      className="anime-focus-ring min-h-[44px] flex items-center justify-center px-4 py-3 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/40 font-semibold"
                      target="_blank"
                      rel="noreferrer"
                    >
                      DM Friend RPG
                    </a>
                  ) : null}
                  {preregisterBase ? (
                    <a href={preregisterBase} className="anime-focus-ring min-h-[44px] flex items-center justify-center px-4 py-3 rounded-lg border border-white/20 text-zinc-200">
                      Preregister home
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-xs text-zinc-500 underline mt-4 anime-focus-ring"
                  onClick={() => dispatch({ type: 'victory_reset' })}
                >
                  Register another traveler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
