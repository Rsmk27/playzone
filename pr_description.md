🎯 **What:**
- Addressed testing gap for the `getUserByClerkId` function in `lib/actions/user.actions.ts`.
- Consolidated tests from `tests/user.actions.test.ts` into the correctly placed `tests/lib/actions/user.actions.test.ts`.
- Silenced expected console error output during failure tests to clean up the test runner logs.

📊 **Coverage:**
- Added test for successful `getUserByClerkId` execution (returns user).
- Added test for when the user is not found by `getUserByClerkId` (returns null).
- Added test for error handling when fetching fails during `getUserByClerkId` (throws error and logs).

✨ **Result:**
- Full function coverage achieved for `lib/actions/user.actions.ts`.
- Cleaned up duplicate and misplaced test files.
