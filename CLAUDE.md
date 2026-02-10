# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Dev server at localhost:3000
pnpm build    # Production build
pnpm lint     # ESLint
pnpm start    # Start production server
```

No test framework is configured.

## Architecture

Reality Check is a Next.js 16 + React 19 + TypeScript app that predicts LLM hallucination rates for academic citations. It uses a hard-coded OLS regression model trained on 1,435 verified citations to estimate how often an LLM will fabricate references for a given research topic and country.

### Data Flow

User enters topic + country → two parallel fetches to OpenAlex API (topic+country count, country total) → regression model predicts hallucination rate → results displayed with category breakdown and confidence intervals.

### Key Files

- **`src/app/page.tsx`** — Main client component containing all prediction logic: regression coefficients, `predict()`, `predictCategories()`, `confidenceMargin()`, risk level mapping, and OpenAlex API calls. This is where the core math and state management live.
- **`src/components/result-card.tsx`** — Displays prediction results with animated percentages, stacked bar chart of verification categories, and risk-level badges.
- **`src/components/info-modal.tsx`** — Three-tab modal (methodology/predictability/limitations) explaining the statistical model.
- **`src/components/ui/`** — shadcn/ui base components (Card, Button, Input, Label) using "new-york" style.

### Conventions

- All interactive components are client components (`"use client"`). Only the root layout is a server component.
- Styling: Tailwind CSS v4 with OKLCH color tokens in CSS custom properties. Dark mode only (enforced in layout).
- Animations: Framer Motion throughout — entrance animations, staggered reveals, AnimatePresence for transitions.
- Path alias: `@/*` maps to `./src/*`.
- Package manager: pnpm.
