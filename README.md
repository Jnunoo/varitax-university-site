# Varitax University — Marketing Site

Public-facing marketing website for **Varitax University** and the **"University in the Box"** concept: a deployable, AI-staffed learning institution with six specialist agents (Advisor, Librarian, Assistant, Tutor, Editor, Progress Tracker).

## Stack

Deliberately dependency-free: a single `index.html` with inline CSS/JS, inline SVG infographics, and a canvas hero animation. No build step, no framework, nothing to break.

- **Fonts:** Space Grotesk (display) + Inter (body) via Google Fonts
- **Interactivity:** faculty explorer tabs, animated pipeline infographic, "Build a Box" curriculum configurator, use-case tabs, FAQ accordion, scroll-reveal + animated counters, pointer-reactive hero constellation
- **Accessibility:** `prefers-reduced-motion` respected, ARIA roles on tabs/accordion, semantic sections

## Brand system

| Token | Value | Role |
|---|---|---|
| Ink | `#0A0E27` | Background — deep "space navy," institutional gravity |
| Indigo | `#6366F1` | Primary — intelligence, trust, tech-forward education |
| Violet | `#A78BFA` | Secondary — creativity, knowledge |
| Amber | `#FFB454` | Accent — warmth, human energy, CTAs highlights |
| Teal | `#34D399` | Success/verification states |

## Develop

Open `index.html` in a browser. That's it.

## Deploy

Hosted on Vercel as a static site (`vercel --prod`).
