## 2026-05-19 - Code Splitting App.jsx
**Learning:** Static imports for multiple nested components can balloon a React app's main bundle size.
**Action:** Always use `React.lazy()` and `<Suspense>` to lazy-load components such as individual games, only fetching them when the user actually navigates to them. This drastically reduces the main bundle size (e.g., from ~429KB to ~175KB in this project).
## 2026-05-19 - Batching Canvas Path Operations
**Learning:** Calling `ctx.strokeRect` in a tight loop for a grid is highly inefficient (e.g. 400 calls per frame for a 20x20 grid) and causes performance drops on the frontend.
**Action:** Always batch grid drawing or repeated lines into a single path using `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and finally `ctx.stroke()`.

## 2024-06-02 - Optimize Array Flattening in Minesweeper | **Learning:** Using `.flat().filter(...)` frequently (e.g. inside a game loop or reveal function) creates unnecessary intermediate arrays and causes noticeable performance degradation, especially with matrix operations. | **Action:** Replace chained array functions like `.flat().filter(...)` with manual nested `for`-loops and primitive counter variables. This improves execution speed and significantly reduces garbage collection overhead in tight loops.
