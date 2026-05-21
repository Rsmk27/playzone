## 2026-05-19 - Code Splitting App.jsx
**Learning:** Static imports for multiple nested components can balloon a React app's main bundle size.
**Action:** Always use `React.lazy()` and `<Suspense>` to lazy-load components such as individual games, only fetching them when the user actually navigates to them. This drastically reduces the main bundle size (e.g., from ~429KB to ~175KB in this project).
## 2026-05-19 - Batching Canvas Path Operations
**Learning:** Calling `ctx.strokeRect` in a tight loop for a grid is highly inefficient (e.g. 400 calls per frame for a 20x20 grid) and causes performance drops on the frontend.
**Action:** Always batch grid drawing or repeated lines into a single path using `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and finally `ctx.stroke()`.
## 2026-05-21 - Batching Canvas Operations in Loops
**Learning:** Calling `ctx.fillRect` inside loops (e.g. iterating over bullets or enemies) causes a high number of draw calls per frame which can significantly hurt performance.
**Action:** Always batch these drawing operations using `ctx.beginPath()`, iterating over the array with `ctx.rect()`, and finishing with a single `ctx.fill()` outside the loop, as long as the fill color remains the same.
