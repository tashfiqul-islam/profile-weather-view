import { $ } from 'bun';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { fileURLToPath } from 'node:url';

/**
 * End-to-end tests for scripts/publish.sh against a local bare "GitHub", with a throwaway signing
 * key and fully isolated git config. Linux/macOS only: Windows OpenSSH ignores umask and rejects
 * the key file's ACL, which is irrelevant on the Ubuntu runner that executes this script.
 */
const SCRIPT = fileURLToPath(new URL('publish.sh', import.meta.url));

const README = `# Hi
Intro that render must never touch.
<!-- Hourly Weather Update -->
| Weather | Temp |
|---|---|
| old | 0°C |
<!-- End of Hourly Weather Update -->
<em>Last refresh: never</em>
Footer.
`;

const PATCHED = README.replace('| old | 0°C |', '| Clear Sky | 25°C |').replace(
  'Last refresh: never',
  'Last refresh: Tuesday, November 17, 2026 at 11:23:05 (UTC+6)',
);

describe.skipIf(process.platform === 'win32')('scripts/publish.sh', () => {
  let root: string;
  let remote: string;
  let seed: string;
  let work: string;
  let tmp: string;
  let env: Record<string, string>;

  beforeEach(async () => {
    root = (await $`mktemp -d`.text()).trim();
    [remote, seed, work, tmp] = [
      `${root}/remote.git`,
      `${root}/seed`,
      `${root}/work`,
      `${root}/tmp`,
    ];
    const isolated = {
      PATH: process.env['PATH'] ?? '',
      HOME: root,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_AUTHOR_NAME: 'seed',
      GIT_AUTHOR_EMAIL: 'seed@example.com',
      GIT_COMMITTER_NAME: 'seed',
      GIT_COMMITTER_EMAIL: 'seed@example.com',
    };
    await $`git init -q --bare -b main ${remote} && mkdir ${tmp}`.env(isolated);
    await $`git clone -q ${remote} ${seed}`.env(isolated).quiet();
    await Bun.write(`${seed}/README.md`, README);
    await $`git add . && git commit -qm init && git push -q origin main`.cwd(seed).env(isolated);
    await $`git clone -q ${remote} ${work}`.env(isolated);
    await $`ssh-keygen -q -t ed25519 -N '' -C test -f ${root}/key`.env(isolated);
    env = {
      ...isolated,
      TMPDIR: tmp,
      SIGNING_KEY: await Bun.file(`${root}/key`).text(),
      NAME: 'Weather Bot',
      EMAIL: 'bot@example.com',
    };
  });

  afterEach(async () => {
    await $`rm -rf ${root}`;
  });

  const publish = (overrides: Record<string, string> = {}) =>
    $`bash ${SCRIPT} ${remote}`
      .cwd(work)
      .env({ ...env, ...overrides })
      .nothrow()
      .quiet();

  const remoteLog = () => $`git -C ${remote} log --format=%s main`.env(env).text();

  test('signs, rebases over a concurrent edit, verifies, pushes, and leaves no key behind', async () => {
    await Bun.write(`${work}/README.md`, PATCHED);
    await Bun.write(`${seed}/OTHER.md`, 'concurrent\n');
    await $`git add . && git commit -qm concurrent && git push -q origin main`.cwd(seed).env(env);

    const result = await publish();

    expect(result.exitCode).toBe(0);
    expect(result.stderr.toString()).toContain('Good "git" signature for bot@example.com');
    expect((await remoteLog()).split('\n').slice(0, 2)).toEqual([
      expect.stringMatching(/^update\(weather\): refresh data for /),
      'concurrent',
    ]);
    expect(await $`git -C ${remote} cat-file commit main`.env(env).text()).toContain(
      '-----BEGIN SSH SIGNATURE-----',
    );
    expect(await $`git -C ${remote} show main:README.md`.env(env).text()).toBe(PATCHED);
    expect((await $`ls -A ${tmp}`.text()).trim()).toBe('');
  });

  test('does nothing when the README is unchanged', async () => {
    const result = await publish();
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain('README unchanged');
    expect(await remoteLog()).toBe('init\n');
  });

  test('refuses a README changed outside the weather section', async () => {
    await Bun.write(`${work}/README.md`, PATCHED.replace('Intro', 'Injected intro'));
    const result = await publish();
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain('outside the weather section');
    expect(await remoteLog()).toBe('init\n');
  });

  test('refuses any change besides README.md', async () => {
    await Bun.write(`${work}/README.md`, PATCHED);
    await Bun.write(`${work}/evil.sh`, 'echo pwned\n');
    const result = await publish();
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain('unexpected changes from render');
    expect(await remoteLog()).toBe('init\n');
  });

  test.each(['SIGNING_KEY', 'NAME', 'EMAIL'])('fails fast when %s is missing', async (name) => {
    await Bun.write(`${work}/README.md`, PATCHED);
    const result = await publish({ [name]: '' });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain(`${name} is not set`);
    expect(await remoteLog()).toBe('init\n');
  });
});
