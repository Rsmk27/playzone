## 2026-05-19 - Code Splitting App.jsx
**Learning:** Static imports for multiple nested components can balloon a React app's main bundle size.
**Action:** Always use `React.lazy()` and `<Suspense>` to lazy-load components such as individual games, only fetching them when the user actually navigates to them. This drastically reduces the main bundle size (e.g., from ~429KB to ~175KB in this project).
## 2026-05-19 - Batching Canvas Path Operations
**Learning:** Calling `ctx.strokeRect` in a tight loop for a grid is highly inefficient (e.g. 400 calls per frame for a 20x20 grid) and causes performance drops on the frontend.
**Action:** Always batch grid drawing or repeated lines into a single path using `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and finally `ctx.stroke()`.
## 2026-06-02 - Minesweeper Grid Generation Loop Optimization | **Learning:** In grid-based games with sparse elements (like mines), calculating adjacent counts by iterating over all cells is inefficient ($O(\text{ROWS} \times \text{COLS} \times 9)$). It's much faster to store the coordinates of the sparse elements during placement and only increment their neighbors ($O(\text{MINES} \times 9)$). | **Action:** Identify grid algorithms that iterate over the entire grid to evaluate local effects. If the active elements are sparse, switch to an element-centric approach to eliminate redundant checks.
