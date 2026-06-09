## 🧪 [testing improvement] Add test for Leaderboard error state

### 🎯 What
Added missing component test coverage for the error state of the `Leaderboard` component.

### 📊 Coverage
The test correctly mocks the `fetchTopScores` import to reject and verifies that the error text "Failed to load scores." is displayed in the component.

### ✨ Result
Improved test coverage for edge cases inside the `Leaderboard` component, leading to more confidence and reliability in our application's behavior when fetching data from the database fails.
