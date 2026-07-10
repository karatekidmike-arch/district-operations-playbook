# District Operations Playbook

A working Next.js starter for district budget tracking.

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase URL and publishable key.
4. Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Supabase setup

Open Supabase SQL Editor and run `supabase/schema.sql`.

For the first test, the app also works without environment variables using browser local storage.

## Push to GitHub

Copy these files into your repository, then:

```bash
git add .
git commit -m "Initial District Operations Playbook"
git push
```

## Deploy to Vercel

Import the GitHub repository into Vercel. Add the two environment variables from `.env.example`, then deploy.
