## 2026-05-19 - Code Splitting App.jsx
**Learning:** Static imports for multiple nested components can balloon a React app's main bundle size.
**Action:** Always use `React.lazy()` and `<Suspense>` to lazy-load components such as individual games, only fetching them when the user actually navigates to them. This drastically reduces the main bundle size (e.g., from ~429KB to ~175KB in this project).
## 2026-05-19 - Batching Canvas Path Operations
**Learning:** Calling `ctx.strokeRect` in a tight loop for a grid is highly inefficient (e.g. 400 calls per frame for a 20x20 grid) and causes performance drops on the frontend.
**Action:** Always batch grid drawing or repeated lines into a single path using `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and finally `ctx.stroke()`.
## 2024-06-02 - Avoid Redundant Array Methods on 2D Arrays | **Learning:** Using `.flat().filter()` multiple times on a 2D array creates unnecessary allocations and iterations, significantly impacting performance. A single-pass loop over the 2D array is much faster. | **Action:** Use single-pass `for` loops to count or aggregate items from multi-dimensional arrays instead of chaining array methods, especially when needing to count multiple distinct values.
