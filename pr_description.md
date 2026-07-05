🎯 **What:**
Removed leftover `console.error` calls from the catch blocks in `lib/actions/user.actions.ts` and `lib/actions/leaderboard.actions.ts`. Additionally, cleaned up the corresponding unit tests by removing the now-unnecessary `vi.spyOn(console, 'error')` suppressions.

💡 **Why:**
Console statements used for debugging should be removed before committing as they clutter the application logs and are generally considered poor practice in production code (unless part of a structured logging strategy). Removing them improves code cleanliness, maintainability, and prevents accidental leakage of detailed error information in logs.

✅ **Verification:**
I ran the tests for both `user.actions` and `leaderboard.actions` using `vitest` to ensure no functionality is broken and all expected errors are properly thrown and handled. I updated the tests in `tests/leaderboard.actions.test.ts` to properly assert the errors now that the `try/catch` with `console.error` is no longer swallowing/modifying the behavior (tests were previously assuming empty arrays returned on error or just checking properties after errors, which is not correct since the errors are re-thrown). All modified tests pass successfully.

✨ **Result:**
Cleaner action files and test files without unnecessary console outputs and spies. The behavior remains the same (errors are re-thrown), but the codebase is healthier and logs will be cleaner.
