## 🧪 [testing improvement] Add test suite for leaderboard actions

### 🎯 What
This PR addresses the testing gap by adding tests for the leaderboard actions in `lib/actions/leaderboard.actions.ts`. A new test file `tests/leaderboard.actions.test.ts` was created to test `fetchTopScores` and `submitScore`. Since the project was missing vitest and had no tests implemented before, `vitest` was installed, and the vitest configuration was added along with updating `tests/setup.js` for `@testing-library/jest-dom`.

### 📊 Coverage
The new tests cover the following scenarios:
*   `fetchTopScores`:
    *   Successfully fetching top scores with `connectToDatabase`, sorting, limiting, and retrieving a lean model via mocked mongoose responses.
    *   Failing gracefully and logging errors when a database error occurs.
*   `submitScore`:
    *   Successfully submitting a score with valid inputs.
    *   Throwing an error when `clerkId` is missing.
    *   Throwing an error when `score` is invalid (not a number).
    *   Throwing an error when `score` is out of bounds (less than 0 or greater than 100000).
    *   Failing gracefully and logging errors when a database error occurs during creation.

### ✨ Result
Test coverage for the leaderboard actions is now robust. This allows confident refactoring of leaderboard business logic in the future knowing that successful paths and boundary validations are protected by tests.
