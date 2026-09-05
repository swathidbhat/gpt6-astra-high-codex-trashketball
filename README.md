# Trashketball

A Three.js paper-toss game with a Severance-inspired office and a luxury beach house. Every basket is worth 10 points; the beach house unlocks at 100 and supports continued play.

## Run

`npm install` then `npm run dev`. Production build: `npm run build`.

Drag down in the room to increase power, sideways to aim, then release. Alternatively use the aim and power sliders and **Take the shot**, or arrow keys and Space. Restart begins a new office run. Sound can be muted.

## Physics

Motion uses a fixed 240 Hz simulation with exact constant-gravity integration (9.81 m/s²). The visible trajectory uses the same launch velocity and integrator. Rim contacts reflect the incoming velocity with restitution; paper loses energy on the floor and basket walls. Scoring requires a downward crossing through the basket opening, including ball-radius clearance. Misses do not deduct points. Both rooms are still, with no wind.

Run `node --experimental-strip-types --test tests/physics.test.mjs` for analytical trajectory, reachable-basket, scoring and rim-rebound tests. `npx tsc --noEmit` checks TypeScript.

The page optionally registers WebMCP tools for state, throwing, and entering the earned second level. Unsupported browsers continue normally. A live supported WebMCP validation context was not available during implementation; these tools are not claimed as browser-verified. Browser interaction and visual QA were not performed.
