# AppFlow Deployment — Environment Variables

Reference document only. **Do not put real secret values in this file** — it is
committed to the repo. Set the real values in the Vercel dashboard
(Project → Settings → Environment Variables) and in your local `.env` (which is
git-ignored).

## Required — App will not start without these

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string (**Session pooler**, port 5432). Supabase → Settings → Database → Connection string → Session pooler. |
| `NEXTAUTH_URL` | Full production URL, e.g. `https://appflow.vercel.app`. Must be the exact deployed origin (no trailing slash). |
| `NEXTAUTH_SECRET` | Random 32-byte secret. Generate with: `openssl rand -base64 32` |

## Required — Core features will not work without these

| Variable | Notes |
|---|---|
| `ANTHROPIC_API_KEY` | From console.anthropic.com. Powers AI capability analysis, JD competency extraction, interview questions, and match explanations. Without it those features fall back to deterministic behaviour where possible and error where not. |

## Optional — GitHub OAuth (Evidence Center)

| Variable | Notes |
|---|---|
| `GITHUB_CLIENT_ID` | From github.com/settings/developers → OAuth Apps. |
| `GITHUB_CLIENT_SECRET` | Same OAuth App. Authorization callback URL must be `<NEXTAUTH_URL>/api/evidence/github/callback`. |

If these are unset, the "Connect GitHub" flow is unavailable but the rest of the
app runs normally.

## Optional — Google OAuth (Login with Google)

| Variable | Notes |
|---|---|
| `GOOGLE_CLIENT_ID` | From console.cloud.google.com. |
| `GOOGLE_CLIENT_SECRET` | Same project. The Google provider is only registered when both values are present, so leaving them blank simply hides "Continue with Google". |

## Optional — App URL

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public base URL of the deployment, e.g. `https://appflow.vercel.app`. Set to the actual Vercel URL after the first deploy. |

---

## Deploy sequence (summary)

1. Push `main` to GitHub.
2. Vercel → New Project → import the `appflow` repo (framework auto-detected as Next.js, root `.`).
3. Add every **Required** variable above. Set `NEXTAUTH_URL` to the URL Vercel shows for the project.
4. Deploy.
5. Copy the real deployment URL, then update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to it and redeploy.
6. (Optional) Register the GitHub OAuth app with callback `<url>/api/evidence/github/callback`, add `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`, redeploy.
7. In Supabase → Authentication → URL Configuration, set the Site URL and add the Vercel URL to Redirect URLs.

## Notes specific to this codebase

- Prisma 7 requires the `@prisma/adapter-pg` driver adapter (already wired in `lib/prisma.ts`); the only DB env var needed is `DATABASE_URL`. Do **not** add a `directUrl` — it is not used.
- `postinstall`/build runs `prisma generate` implicitly via the Prisma client; if a build fails with "property does not exist" on a model, run `npx prisma generate` and rebuild.
- Session strategy is JWT (NextAuth v4), so no session table writes are needed at runtime, but `NEXTAUTH_SECRET` must be identical across all instances.
