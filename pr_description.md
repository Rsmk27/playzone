🎯 **What:**
Refactored the deep nesting in `handleTokenClick` of `src/games/Ludo.jsx` by implementing early returns inside the `newTokens.forEach` block.

💡 **Why:**
Deeply nested `if` statements make the code harder to read, maintain, and debug. By inverting the conditions and returning early, the main logic path is flattened and becomes immediately obvious, improving the overall readability and health of the codebase.

✅ **Verification:**
1. Confirmed logically equivalent functionality using De Morgan's laws when inverting the nested conditions.
2. The project has successfully compiled using `npm run build`. Note: no unit tests were found for this file.

✨ **Result:**
Reduced nesting by 2 levels within the capture logic block. Code flow is flatter and cleaner.
