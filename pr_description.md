🎯 **What:** The testing gap in `updateUser` within `lib/actions/user.actions.ts` has been addressed. The error path where `User.findOneAndUpdate` returns `null` was previously untested.
📊 **Coverage:** The test suite now covers both the happy path (successfully updating and returning a user) and the error condition (throwing a "User update failed" error when `findOneAndUpdate` returns `null`).
✨ **Result:** Test coverage for `user.actions.ts` is significantly improved, ensuring that database update failures are correctly handled and logged.
