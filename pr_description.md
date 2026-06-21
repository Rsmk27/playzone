🎯 **What:**
Implemented a comprehensive Vitest test file for the `lib/actions/leaderboard.actions.ts` functions (`fetchTopScores` and `submitScore`), filling the missing test coverage for these core actions. During the test implementation, a bug was identified where `submitScore` did not correctly filter out `NaN` scores; this bug was corrected as part of this testing improvement.

📊 **Coverage:**
- **`fetchTopScores`:** Covered successful top score fetching (including formatting validation), handling pre-formatted dates, database connection errors, and find operation errors.
- **`submitScore`:** Covered successful valid score submissions, name truncation for long strings, rejection of missing authenticated user ID (`clerkId`), invalid score types (including `NaN`), negative scores, excessively high scores, database connection failures, and creation failures.

✨ **Result:**
Significant improvement in test coverage for the leaderboard functionalities. The robust testing also served as a reliable safety net that successfully identified and resolved a latent `NaN` validation bug, strengthening the overall data integrity of the leaderboard component.
