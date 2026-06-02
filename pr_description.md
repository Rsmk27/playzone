🎯 **What:**
Replaced `Math.random()` with `window.crypto.getRandomValues()` in `src/games/DiceRoller.jsx` for dice roll generation.

⚠️ **Risk:**
`Math.random()` is not cryptographically secure, meaning its output can be predictable if the internal state of the PRNG is deduced. In the context of a game, predictability allows a malicious user or script to anticipate future dice rolls and potentially exploit the game logic.

🛡️ **Solution:**
Created a `getSecureRandom` helper function that leverages the Web Crypto API (`window.crypto.getRandomValues()`) to generate a cryptographically secure random 32-bit unsigned integer, which is then mapped securely to the 1-6 range. This ensures that dice rolls are truly random and not susceptible to PRNG state attacks. Both the animation loop and the final result calculation have been updated to use this secure method.
