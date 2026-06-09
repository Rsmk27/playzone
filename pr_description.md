🎯 **What:** The testing gap in `lib/mongodb.ts` addressed. The `connectToDatabase` function previously lacked unit tests for MongoDB connection handling, caching, and error scenarios.

📊 **Coverage:** The test suite now covers:
- Missing `MONGODB_URI` environment variable error
- Successful database connection initialization
- Connection caching (returning existing connection without reconnecting)
- Connection failure handling and promise resetting
- Reusing in-flight connection promise for concurrent requests

✨ **Result:** Increased test coverage and reliability for the critical database connection logic, ensuring that caching and error handling work as expected.
