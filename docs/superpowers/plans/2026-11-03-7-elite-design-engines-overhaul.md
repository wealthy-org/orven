# 7 Elite Design Engines Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire visual and interaction architecture across all 7 pages of Orven Protocol by synthesizing 7 elite design systems: Anime.js (SVG micro-motion & number tickers), Motion.dev / Framer Motion (layout transitions & spring gestures), Kokonut UI (interactive cards & glow borders), Bklit.com (luxury editorial typography), UI/UX Pro Max (anti-slop tokens & WCAG AAA), shadcn/ui (radix-style badges & primitives), and 21st.dev (Magic UI border beams & shimmer buttons).

**Architecture:**
1. Component Engine: Reusable UI primitives in `apps/web/src/components/ui/` (`BorderBeam`, `ShimmerButton`, `NumberTicker`, `PageTransition`, `MotionCard`, `Badge`).
2. CSS & Physics Layer: Tokenize shadcn/21st.dev/Kokonut animations in `globals.css` (GPU-accelerated transforms, zero layout shifts).
3. Page Overhaul Layer: Upgrade all 7 pages (`/vault`, `/swap`, `/pad`, `/tide`, `/lock`, `/agents`, `/docs`) with the new motion primitives and Lucide icons.
4. Verification Layer: Run Next.js build, Mainnet pre-flight (35/35), E2E system tests (66/66), and Playwright QA browser simulation.

**Tech Stack:** Next.js 14, Framer Motion, Anime.js, Lucide React, Viem, CSS3.

---

### Task 1: Build the UI Component Engine Primitives (`components/ui/`)

**Files:**
- Create: `apps/web/src/components/ui/BorderBeam.tsx`
- Create: `apps/web/src/components/ui/ShimmerButton.tsx`
- Create: `apps/web/src/components/ui/NumberTicker.tsx`
- Create: `apps/web/src/components/ui/PageTransition.tsx`
- Create: `apps/web/src/components/ui/MotionCard.tsx`
- Create: `apps/web/src/components/ui/Badge.tsx`
- Modify: `apps/web/src/styles/globals.css`

- [x] **Step 1: Create `BorderBeam.tsx` (21st.dev style animated gradient beam)**
- [x] **Step 2: Create `ShimmerButton.tsx` (21st.dev / Kokonut UI style glowing button)**
- [x] **Step 3: Create `NumberTicker.tsx` (Anime.js / Motion style fluid counter)**
- [x] **Step 4: Create `PageTransition.tsx` (Motion.dev staggered entrance wrapper)**
- [x] **Step 5: Create `MotionCard.tsx` (Kokonut UI interactive spotlight card)**
- [x] **Step 6: Create `Badge.tsx` (shadcn/ui style accessible variant badges)**
- [x] **Step 7: Add CSS tokens and keyframe animations in `globals.css`**

---

### Task 2: Overhaul Core Trading Pages (`/vault`, `/swap`, `/lock`)

**Files:**
- Modify: `apps/web/src/pages/vault.tsx`
- Modify: `apps/web/src/pages/swap.tsx`
- Modify: `apps/web/src/pages/lock.tsx`

- [x] **Step 1: Refactor `vault.tsx` with Bento Grid, BorderBeam, NumberTickers, and Lucide icons**
- [x] **Step 2: Refactor `swap.tsx` with ShimmerButton, 21st.dev Magic Swap Card, and smooth flip rotation**
- [x] **Step 3: Refactor `lock.tsx` with MotionCard, animated tier cards, and shadcn badges**

---

### Task 4: Overhaul Ecosystem Pages (`/pad`, `/tide`, `/agents`, `/docs`)

**Files:**
- Modify: `apps/web/src/pages/pad.tsx`
- Modify: `apps/web/src/pages/tide.tsx`
- Modify: `apps/web/src/pages/agents.tsx`
- Modify: `apps/web/src/pages/docs.tsx`

- [x] **Step 1: Refactor `pad.tsx` with Kokonut UI interactive offer cards and live escrow counter**
- [x] **Step 2: Refactor `tide.tsx` with animated streak calendar, pulse dot, and multiplier badges**
- [x] **Step 3: Refactor `agents.tsx` with AI terminal glowing bar, model badges, and motion tool cards**
- [x] **Step 4: Refactor `docs.tsx` with Bklit luxury typography, animated code blocks, and copy micro-interactions**

---

### Task 5: Monorepo Build, QA Verification & Git Push

**Files:**
- Verification & git commit

- [x] **Step 1: Run `npm --workspace apps/web run build`**
- [x] **Step 2: Run `npm run verify:mainnet` (35/35 checks)**
- [x] **Step 3: Run `npm run test:e2e` (66/66 checks)**
- [x] **Step 4: Run `npm run qa:test` (Playwright live browser QA)**
- [x] **Step 5: Commit and push to `origin/main`**
