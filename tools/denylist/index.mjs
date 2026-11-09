// Fails when the repository contains any string from DENYLIST (one per line; case and spaces ignored,
// starting at a word start),
// a home-directory path or a tilde path. Scans the working tree, commit messages and every patch in
// history. Prints only where (path:line or commit id), never the matched text.
// Passes with a notice when DENYLIST is unset, so contributors without the secret can run `pnpm check`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const squash = (/** @type {string} */ s) => s.toLowerCase().replace(/\s+/g, '');
// A real path has a segment after the prefix; the bare prefixes quoted in docs do not match.
const PATHS = [new RegExp('/' + 'Users/[\\w.-]+', 'i'), new RegExp('(^|[\\s"\'(=:])~' + '/[\\w.-]+')];

const secret = (process.env.DENYLIST ?? '').split('\n').map(squash).filter(Boolean);
if (!secret.length) {
  console.log('denylist: DENYLIST is unset; skipped');
  process.exit(0);
}
// A match must start at a word start in the original text, so a needle hidden inside ordinary words
// joined by a space ("add aria-live") does not count, while "Some Name" and "SomeName" both do.
const hit = (/** @type {string} */ line) => {
  const lower = line.toLowerCase();
  const kept = [];
  for (let i = 0; i < lower.length; i++) if (!/\s/.test(lower[i])) kept.push(i);
  const s = kept.map((i) => lower[i]).join('');
  const atWordStart = (/** @type {number} */ pos) => !/[a-z0-9]/.test(lower[(kept[pos] ?? 0) - 1] ?? '');
  for (const n of secret) {
    for (let pos = s.indexOf(n); pos > -1; pos = s.indexOf(n, pos + 1)) if (atWordStart(pos)) return true;
  }
  return PATHS.some((re) => re.test(line));
};

const git = (/** @type {string[]} */ args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 30 });
const findings = [];

// 1. Working tree: tracked and untracked-but-not-ignored text files.
const files = git(['ls-files', '--cached', '--others', '--exclude-standard']).split('\n').filter(Boolean);
for (const file of files) {
  if (/\.(png|jpe?g|webp|gif|ico|woff2?|ttf)$/i.test(file) || file === 'pnpm-lock.yaml') continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  text.split('\n').forEach((line, i) => {
    if (hit(line)) findings.push(`${file}:${i + 1}`);
  });
}

// 2. Commit messages and 3. patches in history.
const hasHead = (() => {
  try {
    git(['rev-parse', 'HEAD']);
    return true;
  } catch {
    return false;
  }
})();
if (hasHead) {
  for (const entry of git(['log', '--all', '--format=%H%x00%B%x01']).split('\x01')) {
    const [sha, message] = entry.trim().split('\x00');
    if (sha && message && message.split('\n').some(hit)) findings.push(`commit ${sha.slice(0, 10)} (message)`);
  }
  let sha = '';
  for (const line of git(['log', '--all', '-p', '--format=commit %H', '--', '.', ':(exclude)pnpm-lock.yaml']).split('\n')) {
    if (line.startsWith('commit ')) sha = line.slice(7, 17);
    else if ((line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---') && hit(line)) {
      findings.push(`commit ${sha} (patch)`);
    }
  }
}

const unique = [...new Set(findings)];
if (unique.length) {
  console.error(`denylist: ${unique.length} finding(s):`);
  for (const f of unique) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`denylist: clean (${files.length} files${hasHead ? ', history' : ''})`);
