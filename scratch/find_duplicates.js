import fs from 'fs';
import path from 'path';

const commandsPath = './src/commands';
const names = new Map();

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const match = content.match(/\.setName\(['"]([^'"]+)['"]\)/);
            if (match) {
                const name = match[1];
                if (names.has(name)) {
                    names.get(name).push(fullPath);
                } else {
                    names.set(name, [fullPath]);
                }
            }
        }
    }
}

walk(commandsPath);

for (const [name, paths] of names.entries()) {
    if (paths.length > 1) {
        console.log(`Duplicate found: "${name}"`);
        paths.forEach(p => console.log(`  - ${p}`));
    }
}
