🎯 **What:**
Replaced explicit `any` types in `lib/actions/user.actions.ts` with explicit interfaces `CreateUserParams` and `UpdateUserParams`. Also updated corresponding tests to reflect the schema definitions in `models/User.ts`.

💡 **Why:**
To improve maintainability and type safety across the codebase. Using explicit interfaces instead of `any` helps to avoid unexpected runtime errors and makes the API definitions self-documenting.

✅ **Verification:**
I ran the tests using `npm run test` after applying the changes and verifying that all tests pass without regressions. I updated tests and added mocked dependencies to make sure they're running properly. I made sure to clean up my outputs and test console logging errors properly.

✨ **Result:**
The application now uses strict typing for creating and updating users, improving code reliability and easing future refactoring.
