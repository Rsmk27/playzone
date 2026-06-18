const fs = require('fs');
const file = 'public/games/typing-test/index.html';
let content = fs.readFileSync(file, 'utf8');

const search = `            resultText.innerHTML = \`
                You typed <strong>\${wpm} WPM</strong> with
                <strong class="\${accuracyClass}">\${accuracy}% accuracy</strong>!<br>
                Correct characters: \${correctChars} | Incorrect: \${incorrectChars}
            \`;`;

const replace = `            resultText.innerHTML = '';
            resultText.appendChild(document.createTextNode('You typed '));

            const wpmStrong = document.createElement('strong');
            wpmStrong.textContent = \`\${wpm} WPM\`;
            resultText.appendChild(wpmStrong);

            resultText.appendChild(document.createTextNode(' with '));

            const accStrong = document.createElement('strong');
            accStrong.className = accuracyClass;
            accStrong.textContent = \`\${accuracy}% accuracy\`;
            resultText.appendChild(accStrong);

            resultText.appendChild(document.createTextNode('!'));
            resultText.appendChild(document.createElement('br'));

            resultText.appendChild(document.createTextNode(\`Correct characters: \${correctChars} | Incorrect: \${incorrectChars}\`));`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed successfully.');
} else {
    console.log('Search string not found!');
}
