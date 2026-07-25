# Design — Prismart E-Commerce Platform

A locked design system for the Prismart web application. Every page redesign reads this file before emitting code.

## Genre
`modern-minimal` (High-contrast, crisp typography, clean micro-interactions, OKLCH palette, zero AI slop).

## Macrostructure Family
- **Catalog / Landing Page**: `Marquee Hero` (High-impact header banner, search bar overlay, responsive product grid).
- **User Dashboard / Cart / Profile / Admin**: `Workbench` (Balanced multi-column card layout, crisp data rows, tabular metrics).
- **Authentication Pages (Login / Register)**: `Centered Form Card` (Focused single-card form with clear action hierarchy).

## Theme Palette (OKLCH Tailored)
- `--color-paper`: `oklch(0.985 0.005 240)` (Fresh ultra-light slate backdrop)
- `--color-paper-2`: `oklch(1.0 0 0)` (Pure white card surfaces)
- `--color-ink`: `oklch(0.18 0.03 260)` (Deep obsidian primary text)
- `--color-ink-2`: `oklch(0.48 0.02 260)` (Muted slate body text)
- `--color-rule`: `oklch(0.92 0.01 240)` (Hairline border rules)
- `--color-accent`: `oklch(0.55 0.22 264)` (Vibrant electric indigo accent)
- `--color-accent-ink`: `oklch(1 0 0)` (White text on accent)
- `--color-focus`: `oklch(0.65 0.20 264)` (Ring focus outline)

## Typography
- **Display**: `'Plus Jakarta Sans'`, weight `800` (roman, no italic headers)
- **Body**: `'Inter'`, weight `400` / `500` / `600`
- **Mono**: `'JetBrains Mono'`, `ui-monospace`, weight `500`
- **Display tracking**: `-0.025em` (tight tracking)

## Spacing & Geometry
- Spacing scale: 4-point named scale (`--space-3xs` to `--space-3xl`).
- Radius scale: `--radius-card: 1.25rem`, `--radius-pill: 9999px`, `--radius-input: 0.75rem`.

## Motion & Microinteractions
- **Easings**: `cubic-bezier(0.16, 1, 0.3, 1)` named `--ease-out`.
- **Duration**: `200ms` short transition for hover, scale, and focus states.
- **Button Feedback**: Micro-scale transition `active:scale-[0.98]` on click.

## CTA Voice
- **Primary CTA**: Solid vibrant indigo pill (`bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/25 active:scale-[0.98]`).
- **Secondary CTA**: Crisp bordered button (`bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold active:scale-[0.98]`).

## What Pages MUST Share
- The brand wordmark (`Prismart` with brand gradient icon badge).
- Glassmorphic top navigation bar with cart item badge & profile route link.
- Unified card styling (`bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xs`).
- Typography scale and color tokens.

## Exports

### tokens.css (Tailwind v4 `@theme`)
```css
@theme {
  --color-paper: oklch(0.985 0.005 240);
  --color-paper-2: oklch(1.0 0 0);
  --color-ink: oklch(0.18 0.03 260);
  --color-ink-2: oklch(0.48 0.02 260);
  --color-rule: oklch(0.92 0.01 240);
  --color-accent: oklch(0.55 0.22 264);
  --color-focus: oklch(0.65 0.20 264);

  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 200ms;
}
```
