import assert from 'node:assert/strict';
import {readFile, writeFile, access} from 'node:fs/promises';

const path = new URL('../dist/index.html', import.meta.url);
const html = await readFile(path, 'utf8');
const entry = /<script\b(?=[^>]*\btype="module")(?=[^>]*\bsrc="([^"]+)")[^>]*>\s*<\/script>/g;
const matches = [...html.matchAll(entry)];
assert.equal(matches.length, 1, 'Expected one Vite module entry');
const src = matches[0][1];
assert.match(src, /^\.\/assets\/[\w.-]+\.js$/);
await access(new URL(src, path));
// AxureShow versions script src URLs; an inline import keeps React's module URL identical across chunks.
const result = html.replace(entry, `<script type="module">import ${JSON.stringify(src)};</script>`);
assert(!/<script\b[^>]*\bsrc=/.test(result), 'Entry must not be rewritten with a version query');
assert(result.includes(`import ${JSON.stringify(src)};`));
await writeFile(path, result);
console.log('AxureShow entry uses the same canonical module URL as lazy chunks.');