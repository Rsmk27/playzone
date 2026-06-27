🎯 **What:**
Added a comprehensive test suite for the `Minesweeper.jsx` component using Vitest and React Testing Library. This addresses the testing gap for the game logic, ensuring that interactions and state changes are properly verified.

📊 **Coverage:**
The new test suite covers the following scenarios:
- Initial board rendering and status checks.
- Flagging and unflagging cells (via simulated right-clicks).
- Revealing safe cells correctly.
- Flood-fill revealing for empty cell clicks.
- Game Over condition (clicking a mine).
- Win condition (revealing all non-mine cells).

✨ **Result:**
Significant testing improvement with robust, deterministic tests (via `Math.random` mocking). These tests provide a safety net for the Minesweeper component, preventing regressions and validating core gameplay functionality.
