# AppFlow

Evidence-based talent intelligence platform. AppFlow analyzes real candidate evidence — GitHub repositories, portfolio projects, and professional experience — to generate capability profiles and match candidates with opportunities based on demonstrated ability, not keyword claims.

## Live Demo
_Deploying to Vercel — URL to be added once live._

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Database:** PostgreSQL via Prisma 7 ORM (Supabase)
- **Auth:** NextAuth.js v4 with credentials and Google OAuth
- **AI:** Anthropic Claude API (`claude-opus-4-8`, with `claude-haiku-4-5` for lightweight match explanations)
- **Deployment:** Vercel

## Features

### For Candidates
- LinkedIn-style profile with experience, education, and skills
- GitHub OAuth integration with repository analysis
- AI-powered capability profile generation
- Personalized job matching with evidence-based scores
- Application tracking pipeline

### For Recruiters
- Job posting with an AI-generated competency framework
- Evidence-based candidate ranking and match scores
- Candidate intelligence profiles with interview question generation
- Application pipeline management

## Architecture
AppFlow uses the Next.js App Router with all backend logic running as Next.js API routes — no separate server. The AI analysis pipeline uses Anthropic Claude to extract competencies from candidate evidence and from job descriptions, then matches them against each other using a weighted, evidence-strength-aware scoring algorithm (`lib/matching-engine.ts`). Access is role-gated (candidate / recruiter) via middleware and per-route context guards.

## Local Development
```bash
git clone https://github.com/Bruclyn/appflow.git
cd appflow
npm install
cp .env.example .env
# Fill in environment variables (see DEPLOYMENT.md)
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full documentation. Variable names are listed in [.env.example](./.env.example).
