// Used only in GitHub Actions. The workflow supplies a scoped GITHUB_TOKEN.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { ROOT, output, site, baseUrl } from './lib.mjs';

if (!process.env.GITHUB_ACTIONS || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) {
  throw new Error('Publish through the GitHub Actions workflow on the source branch.');
}
function run(command, args, cwd = ROOT) {
  const child = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (child.status !== 0) throw new Error(command + ' failed');
}
const worktree = path.join(ROOT, '.cache/publish');
run('git', ['fetch', 'origin', 'master']);
run('git', ['worktree', 'add', '--detach', worktree, 'origin/master']);
run('rsync', ['-a', '--delete', '--exclude=.git', output + '/', worktree + '/']);
run('git', ['add', '--all'], worktree);
const unchanged = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: worktree }).status === 0;
if (!unchanged) {
  run('git', ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
    'commit', '-m', 'Publish bilingual site from ' + process.env.GITHUB_SHA], worktree);
  run('git', ['push', 'origin', 'HEAD:master'], worktree);
}
const expected = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: worktree, encoding: 'utf8' }).trim();
const api = process.env.GITHUB_API_URL + '/repos/' + process.env.GITHUB_REPOSITORY + '/pages/builds';
const headers = {
  Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
};
// A push made with GITHUB_TOKEN does not trigger Pages automatically.
const response = await fetch(api, { method: 'POST', headers, signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error('Pages build request failed: HTTP ' + response.status + ' ' + await response.text());
console.log('Requested GitHub Pages build for ' + expected);
let success = false;
for (let attempt = 0; attempt < 40; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 15000));
  const status = await fetch(api + '/latest', { headers, signal: AbortSignal.timeout(30000) });
  if (!status.ok) throw new Error('Cannot read Pages build status: HTTP ' + status.status);
  const build = await status.json();
  console.log('Pages build: ' + build.status);
  if (build.commit !== expected) continue;
  if (build.status === 'errored') throw new Error(build.error?.message || 'Pages deployment failed');
  if (build.status === 'built') { success = true; break; }
}
if (!success) throw new Error('Timed out waiting for the generated commit to be published.');
await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, 'Published commit: ' + expected + '\n');

// Check custom-domain provisioning and enable HTTPS when GitHub permits it.
// DNS propagation and certificate issuance can outlast a deployment.
if (site.customDomainEnabled && baseUrl === site.activeBlogUrl.replace(/\/$/, '')) {
  const pagesApi = api.replace(/\/builds$/, '');
  for (let attempt = 0; attempt < 12; attempt++) {
    const status = await fetch(pagesApi, { headers, signal: AbortSignal.timeout(30000) });
    if (!status.ok) throw new Error('Cannot read Pages domain status: HTTP ' + status.status);
    const pages = await status.json();
    if (pages.cname !== new URL(baseUrl).hostname) throw new Error('GitHub Pages custom domain does not match ' + baseUrl);
    console.log('Pages domain: ' + pages.cname + '; certificate: ' + (pages.https_certificate?.state || 'pending') + '; enforce HTTPS: ' + pages.https_enforced);
    if (pages.https_enforced) break;
    if (pages.https_certificate?.state === 'approved') {
      const enforce = await fetch(pagesApi, {
        method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ https_enforced: true }), signal: AbortSignal.timeout(30000)
      });
      if (enforce.ok) {
        console.log('HTTPS enforcement enabled for ' + pages.cname);
        await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, 'HTTPS enforcement enabled for ' + pages.cname + '.\n');
      } else {
        const message = 'Enable Enforce HTTPS in repository Settings → Pages. API response: HTTP ' + enforce.status + ' ' + await enforce.text();
        console.warn(message);
        await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, message + '\n');
      }
      break;
    }
    if (attempt === 11) {
      await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, 'Custom domain configured; HTTPS certificate is still provisioning. Re-run this workflow after DNS propagation to retry HTTPS enforcement.\n');
    } else {
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
}
