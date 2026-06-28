<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI ROI Analyst — EBT LLC Edition

A full-stack financial modeling tool that quantifies the ROI of AI integrations.
Powered by Gemini 3.5 Flash for narrative + parameter extraction, with all
financial math computed deterministically in code.

View the original in AI Studio: https://ai.studio/apps/dd219512-c2dd-4597-b2d7-80291a3783fa

## Architecture

- **Frontend:** React 19 + Vite + Tailwind v4 (built, not CDN).
- **Backend:** Express ([server.ts](server.ts)) exposing `/api/analyze` and
  `/api/extract`. The Gemini API key lives **only** on the server and is never
  shipped to the browser.
- **Single source of truth for math:** [services/financials.ts](services/financials.ts)
  computes ROI, break-even, savings, etc. The LLM receives the final numbers and
  writes only the narrative + slide copy, so the dashboard, the prose, and the
  exported PPTX can never disagree.

## Run Locally

**Prerequisites:** Node.js 20.12+ (uses built-in env handling).

1. Install dependencies: `npm install`
2. Set your key in [.env.local](.env.local):
   `GEMINI_API_KEY=your_key_here`
   (the server loads `.env.local` / `.env` automatically; real shell/host env
   vars take precedence and are never overridden).
3. Run the dev server: `npm run dev` → http://localhost:3000

## Build & Deploy

```bash
npm run build     # vite build → dist/ + esbuild server → dist/server.cjs
npm start         # NODE_ENV=production node dist/server.cjs
```

Provide `GEMINI_API_KEY` (and optional `PORT`) via the hosting platform's
secret/env configuration in production.
