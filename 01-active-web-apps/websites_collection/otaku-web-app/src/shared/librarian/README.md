# Anime Librarian (Kana) — blog whispers & comments

Kana lives on the **library / tracker** site and helps members blog about what they tracked.

## In the `.blog` compose UI

Transparent **whisper questions** (CSS class `.blog`) appear behind the textarea. They are **specific to the anime** (title, status, episode progress, post type) — Kana does not need to have watched the show; prompts use metadata and title heuristics.

## Scouting public posts

On `/blog`, Kana **reads public mini-posts**, detects when your text answers one of her prompts, and leaves a **personalized comment** (“Oh? you answered my question…”) under the post — stored in `localStorage` (`librarianComments`) for now.

## Can Kana use the site itself?

**Yes — by design:**

| Phase | How |
|-------|-----|
| **Now** | Client-side scout + comments on the same origin as the tracker/blog app |
| **Next** | Service account `LIBRARIAN_BOT_USER_ID` + `POST /api/librarian/comment` (see `backend/librarian-bot.mjs`) writes to Supabase `librarian_comments` |
| **Later** | Librarian agent browses public feed, posts comments, and can file desk notes via the same APIs members use |

Set `LIBRARIAN_BOT_SECRET` and `LIBRARIAN_BOT_USER_ID` in backend `.env.local` so automated Kana can post without a browser.

## Files

- `prompts.ts` — generate anime-specific questions
- `scout.ts` — scan public posts, add comments
- `librarianWhispers.css` — transparent `.blog-librarian-whisper` styles
