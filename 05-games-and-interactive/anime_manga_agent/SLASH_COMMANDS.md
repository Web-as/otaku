# Slash Commands — Integration Plan

> All commands are typed directly into the librarian chat window and begin with `./`.
> They short-circuit the normal conversation pipeline and return structured, librarian-voiced responses.

---

## Command Reference

| Command | Aliases | Auth? | Description |
|---|---|---|---|
| `./help` | `./commands`, `./?` | No | List all commands |
| `./completed` | `./done`, `./finished`, `./get completed list` | **Yes** | Numbered list of every completed title with ratings and dates |
| `./watching` | `./inprogress`, `./current` | **Yes** | In-progress titles with visual progress bars |
| `./queue` | `./plantowatch`, `./borrow list`, `./list` | **Yes** | Plan-to-watch / borrow queue |
| `./stats` | `./profile`, `./card` | **Yes** | Full patron statistics card |
| `./watchtime` | `./time watched`, `./hours`, `./total time` | **Yes** | Estimated total hours spent in the archive |
| `./next` | `./nextpick`, `./recommend`, `./pickforme` | **Yes** | Librarian's single top personalised pick right now |
| `./genres` | `./mytaste`, `./topgenres` | **Yes** | Top genres inferred from borrow history |
| `./search <query>` | `./find`, `./lookup` | No | Quick title/description search |
| `./season` | `./airing`, `./seasonal`, `./nowplaying` | No | What's worth watching this season |
| `./rate <title> <score>` | — | **Yes** | Rate a title 1–10 and store it in your record |

> **Auth?** — commands marked **Yes** require a Bearer token (library card). Guests are given a friendly nudge toward registration.

---

## How It Works (Agent Side)

```
User types: "./completed"
                │
                ▼
   chat() step-0: _parse_slash_command()
                │   matches "completed" alias
                ▼
   _handle_slash_command("completed", args, tier, profile, token, lang)
                │   auth guard → passes (member)
                ▼
   _cmd_completed() → formatted markdown string
                │
                ▼
   AgentResponse { response, command: "completed", patron_tier }
```

The slash path **bypasses** the 12-layer conversational pipeline entirely, so it is always fast and deterministic.

---

## API Endpoints

### `POST /api/chat`
Standard chat endpoint — supports slash commands transparently.
Include `Authorization: Bearer <token>` for member commands.

```json
{ "message": "./watchtime" }
```

Response includes extra fields when a command was matched:
```json
{
  "success": true,
  "data": {
    "response": "⏱️ **Alex's Time in the Archive**\n...",
    "command": "watchtime",
    "patron_tier": "frequent",
    "language": "en"
  }
}
```

### `GET /api/chat/commands`
Returns the full command registry for building autocomplete UIs.

```json
{
  "data": {
    "patron_tier": "regular",
    "commands": [
      {
        "command": "completed",
        "primary_alias": "./completed",
        "aliases": ["./completed", "./done", "./finished", "./get completed list"],
        "description": "Show your completed titles with ratings",
        "member_only": true,
        "available": true
      },
      ...
    ]
  }
}
```

### `GET /api/chat/greet`
Returns an opening greeting tailored to the patron tier. Call this when the chat panel first opens.

---

## Frontend Integration Guide

### 1. Command Palette / Autocomplete

On first load, call `GET /api/chat/commands` and cache the response.
When the user types `./` in the input box, show a floating command palette filtered by what they've typed.

```js
// Pseudocode
chatInput.addEventListener('input', () => {
  if (chatInput.value.startsWith('./')) {
    const typed = chatInput.value.slice(2).toLowerCase();
    const matches = commandRegistry.filter(c =>
      c.aliases.some(a => a.slice(2).startsWith(typed))
    );
    showCommandPalette(matches);
  } else {
    hideCommandPalette();
  }
});
```

Mark member-only commands with a lock icon (🔒) when the user is a guest.

### 2. Opening the Chat Session

When the chat widget loads, call `GET /api/chat/greet` and display the response as the first message from the librarian — no user input needed.

```js
async function openChat() {
  const res = await fetch('/api/chat/greet', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const data = await res.json();
  appendLibrarianMessage(data.data.response);
}
```

### 3. Rendering Command Output

Responses from slash commands use Markdown-style formatting (`**bold**`, `*italic*`, backtick code). Use a lightweight Markdown renderer (e.g. `marked.js`, `micromark`) in the chat bubble.

Add a subtle `command` badge to the chat bubble when `data.command` is present:

```html
<!-- When data.command === "watchtime" -->
<div class="chat-bubble librarian command-bubble">
  <span class="command-badge">⏱ ./watchtime</span>
  <!-- rendered markdown -->
</div>
```

### 4. `./rate` Inline Quick-Rate

On each completed-list entry (`./completed`), render a star-row that fires `./rate <title> <score>` silently:

```js
function rateTitle(title, score) {
  sendMessage(`./rate ${title} ${score}`, { silent: true })
    .then(() => showToast(`Rated ${title} → ${score}/10`));
}
```

### 5. `./next` — Recommendation Card

When the agent returns a response with `data.command === "next"`, render it as a rich card (poster, synopsis, genre pills) rather than plain text, using the `data.recommendation` object that is also returned.

```js
if (response.data.command === 'next' && response.data.recommendation) {
  renderRecommendationCard(response.data.recommendation);
} else {
  renderTextBubble(response.data.response);
}
```

### 6. `./stats` — Patron Dashboard Panel

Optionally pull `./stats` on the patron profile page and render the structured text as a dashboard card with visual stat bars (completed count, avg rating, etc.) using your existing charting library.

---

## Extending the Command Set

To add a new command:

1. **Register it** in `AnimeMangaAgent.SLASH_COMMANDS` (in `core/agent.py`):
   ```python
   "mycommand": (["./mycommand", "./alias"], "Description", True),
   ```

2. **Implement the handler** as `_cmd_mycommand(self, *, args, tier, profile, token, lang) -> str`.

3. **Add it to the dispatcher** inside `_handle_slash_command()`:
   ```python
   "mycommand": self._cmd_mycommand,
   ```

4. **No API changes needed** — the `/api/chat` endpoint will automatically pick it up.

---

## Watch-Time Estimation Notes

The `./watchtime` command uses these heuristics. As the system gains richer data (episode counts stored on completion) accuracy will improve automatically.

| Content type | Method | Default fallback |
|---|---|---|
| Anime | `episode_count × 24 min` per title | 12 eps × 24 min = 288 min |
| In-progress anime | `episode_count × progress% × 24 min` | same per-episode rate |
| Manga | `100 chapters × 8 min` per title | fixed 800 min |

To improve accuracy: when logging watch history, store the actual episode count from the Jikan API response. The `watch_history.episode_count` column already exists for this purpose.

---

## Staff / Librarian Commands 🗝️

The library uses a four-tier role hierarchy:

| Role | Display title | Who they are |
|---|---|---|
| `user` | Regular Patron | Standard library card holder |
| `premium` | Premium Member ✦ | Elevated membership with priority features |
| `librarian` | **Head Librarian 🗝️** | Staff — full patron management, cannot grant staff roles |
| `admin` | Chief Archivist 🔐 | System administrator — unrestricted access |

---

### Staff commands (Head Librarian + Chief Archivist)

These commands are available to any user with `librarian` OR `admin` role.
Patrons who attempt them see: *"🗝️ Library staff access only."*

| Command | Aliases | Description |
|---|---|---|
| `./patrons` | `./members`, `./allusers` | Overview of every registered patron — tier, completions, last active |
| `./patron <name>` | — | Full profile card for one specific patron |
| `./librarystats` | `./library stats`, `./archive stats` | Global aggregate stats for the whole library |
| `./popular` | `./mostcompleted`, `./top titles` | Titles completed by the most patrons |
| `./topratedall` | `./top rated all`, `./best rated` | Highest average-rated titles (≥2 ratings) |
| `./trending here` | `./trendinghere`, `./new queued` | Titles most recently saved to borrow queues |
| `./active [N]` | `./activepatrons` | Patrons active in the last N days (default 7) |
| `./newmembers [N]` | `./new members`, `./recent joins` | Patrons who joined in the last N days (default 14) |
| `./inactive [N]` | `./inactivepatrons`, `./lapsed` | Patrons not seen for N+ days (default 30) |
| `./promote <name> <role>` | — | Head Librarian: `user`/`premium` only · Chief Archivist: all roles |

### `./promote` — role permission matrix

| Caller role | Can grant |
|---|---|
| `librarian` (Head Librarian) | `user`, `premium` |
| `admin` (Chief Archivist) | `user`, `premium`, `librarian`, `admin` |

```
# Head Librarian examples
./promote sakura premium
→ ✅ sakura's role updated to Premium Member ✦

./promote sakura librarian
→ 🔐 Granting 'librarian' requires Chief Archivist authority.

# Chief Archivist examples
./promote newstaff librarian
→ ✅ newstaff's role updated to Head Librarian 🗝️

./promote sysadmin admin
→ ✅ sysadmin's role updated to Chief Archivist 🔐
   ⚠️ Admin access granted. Reserve for system administrators.
```

### What the Head Librarian sees when they open chat

```
🗝️ Welcome back, Head Librarian [name]. The archive is in your capable hands.

Quick pulse: 18 patrons active this week · 387 completions on file · 5 new members this month.

Your full staff toolkit is available — type ./help for the command list,
or just tell me what needs attention today.
```

---

## Admin REST API Endpoints

Most `/api/admin/` routes require a **librarian or admin** token (`Authorization: Bearer <token>`).
The `/api/admin/promote` endpoint accepts both roles but enforces the same role ceiling as the chat command.
Pure `user`/`premium` tokens receive **403 Forbidden**.

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/patrons` | All patrons overview |
| GET | `/api/admin/patron/<username>` | Full PatronProfile for one user |
| GET | `/api/admin/stats` | Library-wide aggregate stats |
| GET | `/api/admin/popular?limit=15` | Most-completed titles |
| GET | `/api/admin/top-rated?limit=15` | Highest average-rated titles |
| GET | `/api/admin/trending?limit=15` | Most recently queued titles |
| GET | `/api/admin/active?days=7` | Recently active patrons |
| GET | `/api/admin/new-members?days=14` | Recently registered patrons |
| GET | `/api/admin/inactive?days=30` | Lapsed patrons |
| POST | `/api/admin/promote` | Change a patron's role |

### `/api/admin/stats` response shape

```json
{
  "total_patrons": 42,
  "active_last_7_days": 18,
  "new_members_last_30_days": 5,
  "total_completions": 387,
  "completions_by_type": { "anime": 302, "manga": 85 },
  "total_in_progress": 64,
  "total_queued": 211,
  "global_avg_rating": 7.8,
  "estimated_total_hours": 9288.0
}
```

### `/api/admin/promote` request body

```json
{ "username": "sakura", "role": "premium" }
```

---

## Frontend Integration — Admin Panel

### 1. Admin Chat Toolbar

When the logged-in user has `role === "admin"`, surface a second command palette section labelled **Librarian Tools** with all admin commands.

```js
if (userRole === 'admin') {
  renderCommandGroup('Librarian Tools 🔐', adminCommands);
}
```

### 2. Library Dashboard Page

Build a `/admin` page that pre-loads the following on mount:

```js
// Load all at once
const [stats, patrons, popular, trending] = await Promise.all([
  fetch('/api/admin/stats'),
  fetch('/api/admin/patrons'),
  fetch('/api/admin/popular?limit=10'),
  fetch('/api/admin/trending?limit=10'),
]);
```

Suggested layout:

```
┌─────────────────────────────────────────┐
│  📊 Library Stats     👥 Active Patrons │
│  42 patrons           18 active (7d)    │
│  387 completions      5 new this month  │
│  9,288 hrs watched    7.8 avg rating    │
├─────────────────────────────────────────┤
│  🏆 Most Completed    🔥 Trending Queue │
│  1. Attack on Titan   1. Dandadan       │
│  2. Frieren           2. Solo Leveling  │
│  ...                  ...               │
├─────────────────────────────────────────┤
│  😴 Inactive Patrons  🆕 New Members    │
│  List with last-seen  List with joined  │
└─────────────────────────────────────────┘
```

### 3. Patron Lookup Widget

A search box on the admin panel that calls `/api/admin/patron/<name>` and renders the full `PatronProfile` as a card — useful for answering "what has this patron been watching?" without using the chat.

### 4. Role Management

A simple dropdown next to each patron row in the patrons table that POSTs to `/api/admin/promote`:

```js
async function changeRole(username, newRole) {
  await fetch('/api/admin/promote', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json' },
    body: JSON.stringify({ username, role: newRole }),
  });
}
```

---

*Last updated: auto-generated by the AnimeManga Librarian Agent build.*
