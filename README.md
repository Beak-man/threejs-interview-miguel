# Take-Home Exercise: Interactive Exhibit

Build a small three.js scene: a rotating platform being observed by an automated camera turret. The project must be written in TypeScript. This repo has a TypeScript build already configured and three.js pinned to version 0.185.1. Please do not change the pinned version. Your final build should compile with no TypeScript errors and run with no console warnings or errors.

**Time budget: about one hour.** Please stop at roughly 60 minutes, commit whatever you have, and note how long you spent. We are not expecting a polished result in that time.

A note on what we're evaluating: we're just as interested in *how* you work as in what you build. We expect and encourage you to use AI tools (Claude Code, Cursor, Copilot, ChatGPT, whatever you normally use). You will not be penalized for writing or modifying code by hand, and you won't be penalized for AI-generated code either. We want to see your real workflow and your judgment about when to use which approach. An incomplete but well-reasoned submission is more valuable to us than a complete but unexamined one.

## Getting started

```sh
git clone <this-repo-url>
cd threejs-interview-test
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build
```

The starter renders a single placeholder cube. You may keep, modify, or delete it.

## Requirements

**1. The scene**
- A circular platform that rotates slowly and continuously.
- A drone (any simple shape) flying a smooth looping path around the scene, above and around the platform.
- An orbit-controlled user camera so we can inspect the scene from any angle.

**2. The tracking turret**
- A two-part turret (rotating base + pitching head) mounted on the edge of the rotating platform.
- The turret must smoothly and continuously track the flying drone.
- Constraints: the head cannot pitch below horizontal, and the turret's rotation speed is capped at 90 degrees per second. If the drone moves faster than the turret can turn, the turret should lag behind and catch up smoothly, never snap or jitter.
- Tracking must remain correct at all times, including while the platform underneath the turret rotates.
- Make sure the drone's path is fast enough that the turret's speed cap actually comes into play at some point, so the lag-and-catch-up behavior is observable.

## How to submit

Please include all of the following:

**1. Prompt log.** If you use an AI tool, include your prompts:
- Preferred: export the raw session/chat transcript (Claude Code and Cursor both support this).
- Otherwise: a PROMPTS.md file listing prompts in order, unedited.

**2. Annotated git history.** Commit as you go, and prefix each commit message with one of:
- `[ai]`: substantially AI-generated
- `[hand]`: written by hand
- `[ai+edit]`: AI-generated, then modified by you (a one-line note on what you changed is appreciated, e.g., "[ai+edit] drone path: generated the curve, tuned the speed by hand")

**3. DECISIONS.md.** Three short bullets: what you delegated to AI vs. did yourself and why, anywhere the AI led you astray and how you caught it, and what you'd do next with more time. Include roughly how long you spent.

Send us a link to your repo and any files above not already in the repo. See your invitation email for the deadline and where to send everything.

## Questions

If anything in the requirements seems ambiguous or underspecified, you're welcome to email us questions, or make a reasonable assumption and note it in DECISIONS.md. Either is fine.
