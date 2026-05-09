
const fs = require('fs');
const content = fs.readFileSync('d:/minh hung/MH_DaiHoc/c++/best web desgin/src/app/pages/ProfilePage.tsx', 'utf8');

let openTags = 0;
let closeTags = 0;

const regex = /<([a-zA-Z0-9.-]+)([^>]*?)(\/?)>/g;
let match;

while ((match = regex.exec(content)) !== null) {
    const tagName = match[1];
    const isSelfClosing = match[3] === '/';
    
    if (!isSelfClosing && !['img', 'input', 'br', 'hr'].includes(tagName.toLowerCase())) {
        openTags++;
        console.log(`Open: ${tagName} at ${match.index}`);
    } else if (isSelfClosing) {
        console.log(`Self-closing: ${tagName} at ${match.index}`);
    }
}

const closeRegex = /<\/([a-zA-Z0-9.-]+)>/g;
while ((match = closeRegex.exec(content)) !== null) {
    closeTags++;
    console.log(`Close: ${match[1]} at ${match.index}`);
}

console.log(`Total Open: ${openTags}`);
console.log(`Total Close: ${closeTags}`);
console.log(`Balance: ${openTags - closeTags}`);
