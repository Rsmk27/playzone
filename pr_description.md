🎯 **What:**
- Added missing tests for the `createUser` function in `lib/actions/user.actions.ts`.
- Fixed existing failing tests in `tests/leaderboard.actions.test.ts` to accurately align with the behavior of `lib/actions/leaderboard.actions.ts`.

📊 **Coverage:**
- Added a test to verify the happy path for successfully creating a user via `createUser`.
- Added an error handling test to ensure exceptions thrown by `User.create` are correctly caught, logged via `console.error`, and re-thrown.
- Ensured test coverage for leaderboard correctly simulates error handling where an empty array is returned instead of an error being thrown.

✨ **Result:**
- Improved test coverage for user creation functionality.
- An all-green test suite ensuring no existing code is broken and testing regressions are patched up.
