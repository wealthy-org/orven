# Responsive Multi-Device & Professional PWA Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an enterprise-grade responsive layout across all device viewports (320px iPhone SE, 375px–430px modern smartphones, 768px–820px tablets, 1024px–1440px+ desktops), eliminating all 5 failure modes (rusak, berdempetan, menumpuk, bertabrakan, hancur), with professional mobile fintech widgets (thumb-friendly bottom navigation bar, mobile bottom sheets, responsive data tables) and full PWA (Progressive Web App) support.

**Architecture:** 
1. PWA layer: W3C compliant `manifest.json`, offline-capable Service Worker (`sw.js`), Apple/Android mobile web app meta tags, and client hydration registration.
2. Navigation layer: Interactive animated mobile drawer in `Header.tsx` + persistent thumb-friendly `MobileBottomNav.tsx` with safe-area insets (`env(safe-area-inset-bottom)`).
3. Design System & CSS layer: Fluid typography (`clamp`), zero-collision flex/grid patterns with `min-width: 0`, responsive table wrappers with smooth scroll indicators, and mobile modal bottom-sheets.
4. Page layer: Redesign and refine all 7 pages (`/vault`, `/swap`, `/pad`, `/tide`, `/lock`, `/agents`, `/docs`) to ensure crisp spacing, touch targets >= 44px, and zero layout overflow.

**Tech Stack:** Next.js 14 (Pages Router), React 18, TypeScript 5, CSS3 Variables, PWA Service Worker & Web App Manifest.

**Spec:** User directive for responsive zero-collision UI/UX, professional mobile widgets, and full PWA capabilities.

## Global Constraints

- Never allow horizontal window overflow (`overflow-x: hidden` / `clip`).
- All interactive controls (buttons, links, inputs, tabs) must satisfy minimum touch target size 44x44px per Apple HIG / WCAG 2.1 AAA.
- Every data table (`.trades`) must be enclosed in a responsive scroll container with `overflow-x: auto` and `overscroll-behavior: contain`.
- Support iPhone notch and bottom home indicator via `padding-bottom: max(16px, env(safe-area-inset-bottom))`.
- Next.js production build (`npm --workspace apps/web run build`) must compile cleanly with 0 TypeScript/lint errors.

## Review Focus

1. **320px–360px viewport test (iPhone SE & compact Androids):** Headers, addresses, and balance widgets must not truncate catastrophically, wrap into clipped zones, or push elements outside the viewport.
2. **PWA installation & manifest validity:** Valid icons, theme-color `#15171A`, standalone display mode, and service worker registration without runtime exceptions.
3. **Modal & Popup containment:** The `/swap` token selector modal and action dialogues must switch to bottom sheets on mobile without overflowing the viewport.
4. **Table readability on mobile:** Tables in `/vault`, `/swap`, `/lock`, `/agents`, and `/docs` must allow smooth touch swipe without causing whole-page jitter.
5. **Mobile Navigation Drawer & Bottom Bar cohesion:** Toggling the hamburger opens the drawer cleanly; the bottom navigation bar highlights the active route and stays out of the way of page actions.

---

### Task 1: PWA Infrastructure & HTML Head Architecture

**Files:**
- Create: `apps/web/public/manifest.json`
- Create: `apps/web/public/sw.js`
- Create: `apps/web/public/icons/icon-192.svg`
- Create: `apps/web/public/icons/icon-512.svg`
- Modify: `apps/web/src/pages/_document.tsx`
- Modify: `apps/web/src/pages/_app.tsx`

**Interfaces:**
- Produces: Web App Manifest, Service Worker registration, PWA meta tags (viewport, theme-color, apple-mobile-web-app-capable).

- [x] **Step 1: Create W3C Web App Manifest in `apps/web/public/manifest.json`**
  Includes `name: "Orven Protocol"`, `short_name: "Orven"`, `start_url: "/vault"`, `display: "standalone"`, `background_color: "#FFFFFF"`, `theme_color: "#15171A"`, icons.

- [x] **Step 2: Create Service Worker in `apps/web/public/sw.js`**
  Implements cache-first / network-fallback strategy for static assets and offline app shell caching with self.skipWaiting().

- [x] **Step 3: Create SVG App Icons in `apps/web/public/icons/`**
  Generate high-fidelity Orven brand SVG/PNG icons for PWA homescreen launch.

- [x] **Step 4: Update `apps/web/src/pages/_document.tsx` with PWA and Viewport Meta Tags**
  Inject viewport (`width=device-width, initial-scale=1, viewport-fit=cover`), theme-color, apple-mobile-web-app-capable, apple-touch-icon, and manifest link.

- [x] **Step 5: Register Service Worker in `apps/web/src/pages/_app.tsx`**
  Add client-side `navigator.serviceWorker.register('/sw.js')` inside `useEffect`.

- [x] **Step 6: Verify PWA files and build compilation**
  Run `npm --workspace apps/web run build` and ensure all static assets are bundled.

---

### Task 2: Mobile Navigation Architecture (Drawer & Bottom Nav Bar)

**Files:**
- Create: `apps/web/src/components/MobileBottomNav.tsx`
- Modify: `apps/web/src/components/Header.tsx`
- Modify: `apps/web/src/components/Layout.tsx`

**Interfaces:**
- Produces: `<MobileBottomNav />` component for screen sizes <= 768px.
- Enhances: `<Header />` with a fully functional slide-in mobile navigation drawer, backdrop overlay, route click handlers, and body scroll lock.

- [x] **Step 1: Create `MobileBottomNav.tsx`**
  Thumb-friendly bar fixed at bottom on `< 768px` with icons and labels for:
  - Vault (`/vault`)
  - Swap (`/swap`)
  - Pad (`/pad`)
  - Tide (`/tide`)
  - Lock (`/lock`)
  Includes active indicator dot/pill and safe-area inset compensation.

- [x] **Step 2: Enhance `Header.tsx`**
  - Implement full mobile menu drawer (`.mnav`) markup with links to Vault, Pad, Tide, Swap, Lock, Agents, Docs.
  - Add close button and backdrop click dismissal.
  - Add `useEffect` to toggle `document.body.classList.toggle('mnav-open', mobileMenuOpen)` to prevent background scroll when open.
  - Automatically close mobile menu on route change.

- [x] **Step 3: Integrate into `Layout.tsx`**
  Render `<MobileBottomNav />` inside Layout with safe-area spacing container so page content does not get hidden under the bottom bar.

- [x] **Step 4: Run build to verify type safety**
  Run `npm --workspace apps/web run build`.

---

### Task 3: Global Responsive CSS System & Anti-Collision Engine

**Files:**
- Modify: `apps/web/src/styles/globals.css`

**Interfaces:**
- Produces: Responsive utilities, `.table-container`, `.bottom-sheet`, `.mobile-card`, `.widget-stat-grid`, `.btn-touch`, responsive breakpoints for 320px, 480px, 768px, 1024px.

- [x] **Step 1: Expand CSS variables & tokens**
  Add fluid padding, safe-area-inset tokens (`--sab: env(safe-area-inset-bottom, 0px)`), touch-target minimums, and responsive font clamps.

- [x] **Step 2: Add Responsive Table Container styles**
  Implement `.table-container` with smooth horizontal scrolling, subtle scrollbar, and soft fade cues so users know content is scrollable.

- [x] **Step 3: Add Mobile Bottom Sheet & Dialog responsive rules**
  Style modals to animate up from bottom on viewports `<= 640px` with rounded top borders and touch-friendly close button.

- [x] **Step 4: Implement Anti-Collision Grid rules**
  Ensure `.facts`, `.layout`, `.page-head`, `.tools`, and `.vault-two` gracefully collapse to 1 or 2 clean columns without text truncation or element collision.

- [x] **Step 5: Verify CSS compilation**
  Run Next.js build.

---

### Task 4: Responsive Overhaul of Core Trading Pages (`/vault`, `/swap`, `/lock`)

**Files:**
- Modify: `apps/web/src/pages/vault.tsx`
- Modify: `apps/web/src/pages/swap.tsx`
- Modify: `apps/web/src/pages/lock.tsx`

**Interfaces:**
- Refines: Vault balance cards, 3-step onboarding widget, transaction table, swap token picker modal (converted to responsive bottom sheet), fee discount schedule table, and touch inputs.

- [x] **Step 1: Refactor `vault.tsx`**
  - Make 3-step onboarding widget responsive with clean grid `grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr))`.
  - Wrap transaction table in `.table-container`.
  - Ensure button groups wrap gracefully with min 44px height.
  - Prevent long hex address collision with ellipsis and copy feedback.

- [x] **Step 2: Refactor `swap.tsx`**
  - Upgrade Deflation Burn Widget into a sleek, responsive fintech card widget.
  - Transform Token Picker Modal into a responsive bottom sheet on mobile (`max-width: 100vw`, `bottom: 0`, `border-radius: 16px 16px 0 0`).
  - Wrap fee tier schedule table in responsive container.
  - Ensure swap input and currency selectors have 48px touch targets.

- [x] **Step 3: Refactor `lock.tsx`**
  - Wrap fee discount table in `.table-container`.
  - Optimize the Lock Form panel for mobile touch and instant feedback.

- [x] **Step 4: Run build to verify type safety**
  Run `npm --workspace apps/web run build`.

---

### Task 5: Responsive Overhaul of Ecosystem & Marketplace Pages (`/pad`, `/tide`, `/agents`, `/docs`)

**Files:**
- Modify: `apps/web/src/pages/pad.tsx`
- Modify: `apps/web/src/pages/tide.tsx`
- Modify: `apps/web/src/pages/agents.tsx`
- Modify: `apps/web/src/pages/docs.tsx`

**Interfaces:**
- Refines: Search & filter toolbars, 7-day streak calendar, escrow offer cards, MCP tool tables, and code snippets.

- [x] **Step 1: Refactor `pad.tsx`**
  - Make search bar and category tabs stack cleanly on mobile (`flex-direction: column; align-items: stretch` on `<= 640px`).
  - Optimize offer cards for mobile touch and clean typography.

- [x] **Step 2: Refactor `tide.tsx`**
  - Fix 7-day streak calendar (`.tide-days`): adjust column widths and font sizes for mobile viewports (min-width or 7-column fluid compact grid).
  - Wrap point breakdown and activity tables in `.table-container`.

- [x] **Step 3: Refactor `agents.tsx`**
  - Ensure code snippets (`pre`, `code`) have smooth horizontal scroll with `overflow-x: auto` and do not blow out mobile width.
  - Wrap MCP tools table in `.table-container`.
  - Make prompt tester textarea and execute button 100% width on mobile.

- [x] **Step 4: Refactor `docs.tsx`**
  - Wrap architecture specification tables in `.table-container`.
  - Ensure readable line heights and clean padding on small screens.

- [x] **Step 5: Run build to verify compilation**
  Run `npm --workspace apps/web run build`.

---

### Task 6: End-to-End Verification & Multi-Device QA

**Files:**
- Verification only

- [x] **Step 1: Run complete build test**
  Run `npm --workspace apps/web run build` and ensure 0 errors.

- [x] **Step 2: Audit with agent browser across viewports**
  Launch browser preview at:
  - 360px (mobile compact)
  - 390px (mobile standard)
  - 768px (tablet)
  - 1280px (desktop)
  Verify zero horizontal overflow, mobile drawer functional, bottom navigation bar responsive, tables scrollable, and widgets crisp.
