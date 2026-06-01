# LearnQuest — Premium Rebuild Plan

You asked for everything. Honestly: 15+ feature areas + full visual refresh + admin + community is **4–6 weeks of work**, not one turn. Cramming it into a single response would produce broken half-features across the board. Here's the realistic phased plan. I'll ship Phase 1 now, then we iterate.

## Phase 1 — Foundation (this turn)

**Visual design refresh** (you approved "full visual refresh")
- Generate 3 design directions from your current dashboard screenshot
- You pick one → I rebuild the design system (palette, typography, motion, tokens in `index.css` + `tailwind.config.ts`)
- Apply across Navbar, Dashboard, Subjects, Profile

**Dashboard rebuild**
- Personalized welcome + level/XP progress
- Stats grid (XP, streak, level, lessons done, time, accuracy)
- Continue Learning card (resume last subject from `subject_progress`)
- Weekly XP chart (Recharts, from `exercise_history`)
- Recommended next actions
- Achievement summary strip
- Daily challenge widget (deterministic per day)

## Phase 2 — Profile + Courses (next turn)
- Avatar upload (Storage bucket), bio field, profile redesign
- Course search/filter/favorites, lesson navigation polish
- Notes + bookmarks system (new tables)

## Phase 3 — AI Tutor (next turn)
- New edge function `ai-tutor` using Lovable AI (`google/gemini-2.5-flash`)
- Floating chat panel, conversation history table
- Generate-quiz / summarize-lesson / explain-simpler actions

## Phase 4 — Certificates + Learning Paths
- `certificates` table with verification UUIDs
- PDF generation (jsPDF) + public `/verify/:id` page
- Learning paths data model + UI

## Phase 5 — Daily/Weekly/Monthly Challenges + Notifications
- `challenges` + `user_challenges` tables, server-side completion
- In-app notification center (`notifications` table + realtime)

## Phase 6 — Admin Panel
- `app_role` enum + `user_roles` table + `has_role()` (per security rules)
- Admin routes guarded by role: user list, XP adjust, content toggles, platform stats

## Phase 7 — Community
- Discussions/Q&A tables, comments, study groups
- Largest scope, highest moderation cost — last on purpose

## Cross-cutting (woven through every phase)
- Accessibility pass (aria labels, focus rings, contrast, heading order)
- Performance (lazy routes via `React.lazy`, image `loading="lazy"`, code splitting)
- SEO (per-route `<PageSeo>` already in place — extend coverage)
- PWA (manifest + service worker) — added in Phase 2

## What I will NOT do
- Email verification / rate limiting / spam protection — these are **Supabase Auth settings**, not code. I'll list which toggles to flip in Cloud settings.
- Real-time analytics dashboards beyond what Lovable Cloud already provides.
- Pretend a single response can ship all of this well.

---

**Next action:** I'll capture a screenshot of your current dashboard and generate 3 design directions for the visual refresh. You pick one, I build Phase 1.

Reply "go" to start, or tell me to reorder phases.
