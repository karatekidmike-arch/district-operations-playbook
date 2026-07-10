# District Operations Playbook

Deployment-ready Next.js web app for district budget tracking.

## Important

This fixed version uses JavaScript, not TypeScript, so it avoids the Vercel TypeScript dependency failure from the earlier build.

## Deploy

1. Upload all files in this folder to the root of the GitHub repository.
2. Vercel will redeploy automatically after the commit.
3. The app works immediately in browser demo mode.
4. Add Supabase variables later for shared data across devices.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor, then add these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
