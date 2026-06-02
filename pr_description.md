🧪 Added Leaderboard component tests

## 🎯 What
Added missing tests for the `Leaderboard` component, covering both UI rendering and Firebase integration scenarios. Set up Vitest and React Testing Library to enable the testing environment.

## 📊 Coverage
The new tests cover the following scenarios:
- **Initial loading state**: Validates the loading UI is rendered when data is fetching.
- **Empty state**: Validates the correct message is shown when no scores are returned.
- **Data loading**: Validates scores are rendered correctly when successfully fetched.
- **Error handling (Load)**: Validates error messages when initial load fails.
- **Score submission form**: Validates that the form renders when a new score is passed down.
- **Successful score submission**: Validates successful mock submission and UI updates.
- **Error handling (Submit)**: Validates error messages during score submission.
- **Close button**: Validates the `onBack` callback is triggered when closing the modal.

## ✨ Result
Increased test coverage with a robust set of tests for `Leaderboard`. The testing environment is now set up and configured correctly with `vitest` and `@testing-library/react`. Tests run independently of the real Firebase endpoints by utilizing robust service mocks.
