# ClauseCompass — Frontend

Next.js UI for ClauseCompass, an AI-powered contract review tool. Upload a contract, see clause-level risk flags, and chat with the document to ask follow-up questions.

**Demo ScreenShot:** ![ClauseCompass demo](C:\Users\patel\clausecompass\frontend\screenshots)

**Live app:** https://clausecompass-frontend.vercel.app

**Backend repo:** https://github.com/mansi-patell/clausecompass-backend

## What it does

- File upload (PDF/DOCX) with a loading state during analysis
- Renders AI-generated risk analysis as color-coded clause cards (red/yellow/green by risk level)
- Displays missing standard protections as a separate checklist
- Includes a chat panel for asking questions about the uploaded contract, with conversation history maintained per session

## Tech stack

- **Next.js** (App Router)
- **React** (hooks-based state management, no external state library needed at this scale)
- **Tailwind CSS**

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Requires the [backend](https://github.com/mansi-patell/clausecompass-backend) to be running (locally or the deployed version) — the API URL is currently set directly in `src/app/page.tsx`.

## Known limitations / next steps

- API URL is hardcoded rather than read from an environment variable — would move to `NEXT_PUBLIC_API_URL` for easier switching between local/production backends
- No persistent chat history across page reloads (session lives only in React state)
- No multi-document support yet — one contract per session
