import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('.', import.meta.url).pathname.replace(/\/$/, '');
const UPSTREAM = ['HeyPuter/builder', 'Nariman Jelveh', 'jelveh', 'reynaldichernando', 'mediratta'];
const TEXT_EXTS = new Set(['.md', '.json', '.html', '.sh', '.yml', '.yaml', '.txt', '.css', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.cff']);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules' || entry === 'test.mjs' || entry === 'dist') continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) results.push(...walk(full));
    else if (TEXT_EXTS.has(extname(full))) results.push(full);
  }
  return results;
}

console.log('\n🔍 AI Builder — Verification Suite\n');

// 1. No upstream references
console.log('📝 Upstream cleanliness');
const files = walk(ROOT);
for (const f of files) {
  const content = readFileSync(f, 'utf8');
  const rel = f.replace(ROOT + '/', '');
  for (const term of UPSTREAM) {
    test(`${rel} has no "${term}"`, () => {
      assert(!content.toLowerCase().includes(term.toLowerCase()),
        `Found "${term}" in ${rel}`);
    });
  }
}

// 2. Required files exist
console.log('\n📦 Required files');
const required = ['LICENSE', 'README.md', 'CITATION.cff', 'MAINTAINERS.md', 'package.json', 'THIRD_PARTY_NOTICES.md', 'icon.png'];
for (const f of required) {
  test(`${f} exists`, () => {
    assert(statSync(join(ROOT, f)).isFile(), `Missing ${f}`);
  });
}

// 3. LICENSE contains Abdullah Formuli
console.log('\n🔐 License check');
const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8');
test('LICENSE mentions Abdullah Formuli', () => {
  assert(license.includes('Abdullah Formuli'), 'Missing Abdullah Formuli in LICENSE');
});

// 4. README pointers
console.log('\n📖 README check');
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
test('README.md points to authrain-cloud-abdullahformuli/builder', () => {
  assert(readme.includes('authrain-cloud-abdullahformuli/builder'), 'Missing repo link in README.md');
});

// 5. package.json check
console.log('\n📦 package.json check');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
test('package.json author is Abdullah Formuli', () => {
  assert(pkg.author.includes('Abdullah Formuli'), 'Missing Abdullah Formuli in package.json author');
});
test('package.json repository points to authrain-cloud-abdullahformuli/builder', () => {
  assert(pkg.repository.url.includes('authrain-cloud-abdullahformuli/builder'), 'Missing repo url in package.json');
});

console.log(`\n${'═'.repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
