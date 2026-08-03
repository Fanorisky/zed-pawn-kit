import fs from 'node:fs';
import path from 'node:path';

const sourceDirectory = process.argv[2];
const outputPath = process.argv[3] ?? 'snippets/pawn-completions.json';

if (!sourceDirectory) {
  console.error('usage: node convert-pocketpawn-completions.mjs <completions-directory> [output]');
  process.exit(1);
}

const snippets = {};
const files = fs.readdirSync(sourceDirectory)
  .filter(file => file.endsWith('.sublime-completions'))
  .sort();

for (const file of files) {
  const filePath = path.join(sourceDirectory, file);
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,\s*([}\]])/g, '$1');
  const document = JSON.parse(source);
  const annotation = path.basename(file, '.sublime-completions');

  for (const completion of document.completions ?? []) {
    const trigger = String(completion.trigger ?? '').trim();
    if (!trigger) continue;

    const contents = String(completion.contents ?? trigger);
    const key = `${annotation}: ${trigger}`;
    snippets[key] = {
      prefix: trigger,
      description: completion.annotation ?? annotation,
      body: [contents.includes('$0') ? contents : `${contents}$0`],
    };
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snippets, null, 2)}\n`);
console.log(`Converted ${Object.keys(snippets).length} completions from ${files.length} files to ${outputPath}`);
