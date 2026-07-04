# Custom Visual Novel Maker: Master Design Blueprint

**Compiled Date**: May 25, 2026
**Target Platform**: Next.js / React (otaku-web-app)
**Project Goal**: A custom web-based Visual Novel Maker where two AI agents (a Librarian and a DM) work together to generate custom D&D-style anime adventures, rendered in a dynamic, premium WebGL interface.

---

## 1. The Core Data Structure (The Anime D&D Schema)
We are using a deeply nested JSON schema that mirrors both D&D campaign scopes and Anime seasonal pacing. This allows the AI to manage long-term state without losing context.
*   **`Franchise`**: The multiverse/series setting (e.g., *The Fate Series*).
*   **`QuestCampaign`**: A full multi-season run (e.g., *Sword Art Online: Aincrad*).
*   **`QuestBook`**: A single 12-24 episode season with a defined Big Bad Evil Guy (BBEG).
*   **`QuestLog`**: A specific story arc (e.g., *The Tournament Arc*).
*   **`ShortQuestScroll`**: A single episode or game session. This is the **Active Context Window** passed to the AI DM during gameplay.

---

## 2. Multi-Agent AI Architecture
The system uses an **Agent-to-Agent (A2A)** orchestration framework (such as LangGraph) to divide labor, ensuring high-quality, hallucination-free generation.

### Agent 1: The Anime Librarian
*   **Role**: The researcher and lore-keeper.
*   **API Integration (VNDB)**: The Librarian is equipped with a tool to query the **Visual Novel Database API v2 (Kana)**. It pulls official character traits, narrative tags (e.g., *Tsundere*, *Time Loop*), and world rules directly from the database.
*   **Output**: Compiles this official data into a **Global Lore Database** (GraphRAG / Mem0 Vector DB), creating a queryable source of truth.

### Agent 2: The DM Friend
*   **Role**: The Game Engine Coordinator.
*   **Execution**: When a player starts a session, the DM Friend reads the current `ShortQuestScroll` and the player's `User Session DB` (which tracks their specific chaotic choices and level-ups).
*   **Output Generation**: Using the Vercel AI SDK and `zod`, the DM Friend outputs a **strict JSON Scene Block** instead of plain text, instructing the frontend exactly what to render.

---

## 3. The Visual Novel Frontend & Asset Pipeline
To move away from simple text chats and achieve a premium, modern visual novel aesthetic, we are implementing a robust WebGL and structured UI pipeline.

### The Structured Output Scene Block
The AI outputs JSON containing:
*   `background`: The active setting.
*   `sprite`: The character speaking.
*   `animation_state`: Emotion (angry, happy, crying).
*   `dialogue`: The text to stream typewriter-style.
*   `dnd_event`: Skill check requirements (e.g., "Roll Magic DC 15").

### Custom Animation (Live2D & PixiJS)
*   **Creation**: Characters are custom-drawn in layered `.psd` files (separating eyes, hair, lips, limbs).
*   **Rigging**: Layers are imported into **Live2D Cubism Editor** to create breathing, expressive models exported as `.moc3` files.
*   **Rendering**: The Next.js frontend uses **PixiJS** (`pixi-live2d-display`) wrapped in a `<canvas>` component to render the `.moc3` models. The AI's `animation_state` JSON key directly triggers the Live2D parameters.

### Parallax Backgrounds
Backgrounds are drawn in 3 distinct layers (Foreground, Midground, Background). React tracks mouse movement and offsets these layers at different speeds to create a deep 3D parallax effect, enhanced by PixiJS particle systems (rain, magic dust).

---

## 4. Codebase Porting Strategy
Half of the application is already built using existing components from the `otaku-web-app` workspace. We will port and re-skin the following:

1.  **The Campaign Builder GUI**: 
    *   *Sourced From*: The existing Blog Post Editor (`Admin.tsx`). 
    *   *Usage*: Stripped of blog features, this rich-text and tag-management UI will be used by human creators to manually build `QuestLog` JSONs and define Boss DCs.
2.  **The Character Sheet Creator**: 
    *   *Sourced From*: The Tracker Metadata Form (`AddAnimeModal.tsx`). 
    *   *Usage*: Repurposed to validate D&D core stats (1-20), classes, and equipped items instead of anime metadata.
3.  **Unified User Accounts**: 
    *   *Sourced From*: `shared/utils/authRedirect.ts`. 
    *   *Usage*: Users log in with their existing cross-site Otaku profiles.
4.  **Monetization (The Freemium Campaign Model)**: 
    *   *Sourced From*: `UnifiedGateway.tsx` and the Stripe Checkout Integration. 
    *   *Usage*: Players play Episode 1 (the Prologue) for free. To unlock the rest of the `QuestBook`, the existing Stripe checkout flow is triggered, activating the premium tier and database access.

---

## Summary of Next Steps
1.  **Setup**: Initialize the new Next.js route for the VN canvas and install `pixi.js` and `live2d-react`.
2.  **Porting**: Copy the Stripe and Auth utilities into the new workspace.
3.  **Agent Building**: Set up the Vercel AI SDK route with the `zod` schema to force the DM Friend to output valid Scene Blocks.
4.  **VNDB Integration**: Write the `fetch_vn_lore` API route for the Anime Librarian.
