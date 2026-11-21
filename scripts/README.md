# `scripts/`

Repository tooling that runs outside the app.

| Script                           | Runs in                         | Tested by                                  |
| -------------------------------- | ------------------------------- | ------------------------------------------ |
| [`publish.sh`](publish.sh)       | `weather.yml` → **publish** job | [`publish.test.ts`](publish.test.ts)       |
| [`pr-labels.ts`](pr-labels.ts)   | `pr.yml` → **labels** job       | [`pr-labels.test.ts`](pr-labels.test.ts)   |
| [`readme-art.ts`](readme-art.ts) | `bun run readme:art`, by hand   | [`readme-art.test.ts`](readme-art.test.ts) |

## `readme-art.ts`

Draws the README cover, the diagram of one run and the CONTRIBUTING delivery pipeline as light and
dark SVG pairs under `.github/assets/`, in the mdxcn figure style: dashed frames with `+` corners,
`[ TITLE ]` labels, monospace text and one accent per mode. Each pair is shown as two links ending
`#gh-dark-mode-only` and `#gh-light-mode-only`, which GitHub hides by the viewer's GitHub theme (a
`<picture>` with `prefers-color-scheme` would follow the OS). The test fails when a committed SVG
drifts from the script or a document loses a pair, so run `bun run readme:art` after any change.

## `pr-labels.ts`

Turns a PR title into two managed labels: `type: <type>` and `release: major | minor | patch |
none`. PRs are squash-merged, so the title is the commit semantic-release will read and the body is
its message; the release label applies `.releaserc.json`'s own `releaseRules` with a faithful port
of commit-analyzer's algorithm: matching rules apply in order, a later `release: false` overrides
earlier matches, `major` ends the scan, and if no custom rule matches the plugin's defaults apply. A
`!` or a `BREAKING CHANGE:` footer means major. The label therefore cannot disagree with the
release job; `pr-labels.test.ts` pins each of those semantics.

`labelsFor(title, body)` is the pure core; the CLI reads `PR_TITLE` / `PR_BODY` and prints
`type=…` / `release=…` for `$GITHUB_OUTPUT`. The workflow then replaces any stale `type:` or
`release:` label, so editing a title relabels the PR.

## `publish.sh`

The only code that ever holds a secret. It runs in the `profile` environment with nothing but
bash, git and ssh-keygen, takes the README that the secret-free **render** job produced, and turns
it into a signed commit on the profile repository.

```text
+----------------- [ PUBLISH.SH ] -----------------+
|                                                  |
| 1  Guard                                         |
|    Only README.md changed, only inside the       |
|    weather section or the refresh stamp.         |
| │                                                |
| 2  Sign                                          |
|    Key to a 0600 temp file; gpg.format=ssh.      |
| │                                                |
| 3  Commit and rebase                             |
|    Survives a concurrent push; re-signed.        |
| │                                                |
| 4  Verify                                        |
|    git verify-commit HEAD, or nothing ships.     |
| │                                                |
| 5  Push and report                               |
|    Step outputs: result, commit, message.        |
|                                                  |
+--------------------------------------------------+
```

### Contract

| Input / output    | Meaning                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| `$1`              | Push URL, credentials included (the workflow builds it from `PAT`)            |
| working directory | The profile repository checkout, with the rendered `README.md` in place       |
| `SIGNING_KEY`     | Private ed25519 key, registered on GitHub as a **signing** key                |
| `NAME`, `EMAIL`   | Commit identity; `EMAIL` must be verified on the GitHub account               |
| `GITHUB_OUTPUT`   | Optional. Receives `result` (`published` / `unchanged`), `commit`, `message`  |
| exit `0`          | Pushed, or nothing to publish                                                 |
| exit `1`          | Guard refused, a variable is missing, or signing, verifying or pushing failed |

The guard is what keeps a compromised render job from rewriting the profile: anything beyond the
weather table and the refresh stamp, or any file besides `README.md`, stops the script before a
key is ever written to disk. The key file lives in a private temp directory removed on exit, even
on failure.

### Testing

[`publish.test.ts`](publish.test.ts) runs the real script against a local bare repository with a
throwaway key and fully isolated git config: happy path with a concurrent push, unchanged README,
both guard refusals, and each missing variable. It runs on Linux and macOS, so CI on every PR
and WSL locally; Windows skips it because Windows OpenSSH ignores `umask` for key files. The
script is also linted by `shellcheck` in the pre-commit hook and in CI.

```sh
bun test scripts/                # Linux, macOS, WSL
shellcheck scripts/publish.sh
```
