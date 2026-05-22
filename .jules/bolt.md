## 2026-05-19 - Code Splitting App.jsx
**Learning:** Static imports for multiple nested components can balloon a React app's main bundle size.
**Action:** Always use `React.lazy()` and `<Suspense>` to lazy-load components such as individual games, only fetching them when the user actually navigates to them. This drastically reduces the main bundle size (e.g., from ~429KB to ~175KB in this project).
## 2026-05-19 - Batching Canvas Path Operations
**Learning:** Calling `ctx.strokeRect` in a tight loop for a grid is highly inefficient (e.g. 400 calls per frame for a 20x20 grid) and causes performance drops on the frontend.
**Action:** Always batch grid drawing or repeated lines into a single path using `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and finally `ctx.stroke()`.
## 2026-05-22 - Batching Canvas Path Operations (Space Invaders)
**Learning:** Calling `ctx.fillRect` in a loop for many entities (e.g., up to 64 aliens per frame) causes unnecessary WebGL state changes and slows down rendering.
**Action:** Always batch canvas drawing calls for entities of the same color using `ctx.beginPath()`, multiple `ctx.rect()` calls, and finally `ctx.fill()`. This reduces draw calls from O(n) to O(1) per group.
