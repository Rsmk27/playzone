## 2026-05-19 - Code Splitting App.jsx
**Learning:** Static imports for multiple nested components can balloon a React app's main bundle size.
**Action:** Always use `React.lazy()` and `<Suspense>` to lazy-load components such as individual games, only fetching them when the user actually navigates to them. This drastically reduces the main bundle size (e.g., from ~429KB to ~175KB in this project).
## 2026-05-19 - Batching Canvas Path Operations
**Learning:** Calling `ctx.strokeRect` in a tight loop for a grid is highly inefficient (e.g. 400 calls per frame for a 20x20 grid) and causes performance drops on the frontend.
**Action:** Always batch grid drawing or repeated lines into a single path using `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and finally `ctx.stroke()`.
## 2026-06-02 - Unroll small inner loops | **Learning:** Unrolling small, hot loops (like checking 8 neighboring cells in a grid) can improve performance by ~20%. | **Action:** Use explicit function calls instead of nested loops inside frequently-called recursive functions.
