# Project: API Update Agent
GitHub App that detects breaking Stripe API changes and opens fix PRs.

## Stack
TypeScript (strict), Node 24, Fastify, octokit, ts-morph, oasdiff CLI,
BullMQ + Redis, PostgreSQL + Drizzle, Vitest, Docker.

## Commands
- npm run dev / npm test / npm run lint / npm run eval

## Rules
- ES modules only. No `any` without a comment explaining why.
- Every new function in packages/core gets a Vitest test.
- Never open a PR unless tsc and the target repo's tests pass.
- I am learning: explain non-obvious decisions in 2-3 sentences.
- Do not write the files I list under "Mine"; review them instead.

## Mine (I write these, Claude reviews)
- packages/core/webhook-verify.ts
- packages/core/changes/parse-oasdiff.ts
- packages/core/impact/find-stripe-calls.ts
- packages/core/fix/verify-loop.ts