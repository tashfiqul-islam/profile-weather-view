# Security policy

## Reporting a vulnerability

Report privately through
[GitHub private vulnerability reporting](https://github.com/tashfiqul-islam/profile-weather-view/security/advisories/new).
Please do not open a public issue, discussion, or pull request for a suspected vulnerability.

Include what you can of:

- the affected file, workflow, or commit, and the version or SHA;
- the impact you expect (for example "secret readable from a PR", "content injected into the
  profile README");
- steps or a proof of concept, and any logs with secrets redacted.

### What happens next

| Stage                        | Target                                                    |
| ---------------------------- | --------------------------------------------------------- |
| Acknowledgement              | within 3 business days                                    |
| Triage and severity (CVSS 4) | within 7 days                                             |
| Fix for critical / high      | within 7 / 30 days of triage                              |
| Fix for medium / low         | next scheduled release                                    |
| Disclosure                   | GitHub Security Advisory (CVE requested where it applies) |

Disclosure is coordinated: the advisory is published once a fix is released, or after 90 days,
whichever comes first, unless we agree otherwise. Reporters are credited in the advisory unless
they ask not to be.

### Safe harbour

Good-faith research that follows this policy is authorised, and we will not pursue or support
legal action over it. Stay within scope, use only accounts and repositories you own, avoid
privacy violations and service degradation, and give us reasonable time to fix before disclosing.

## Supported versions

| Version                  | Supported |
| ------------------------ | --------- |
| Latest release on `main` | Yes       |
| Anything older           | No        |

This is a continuously deployed automation, not a library: fixes ship as a new release and the
next scheduled run picks them up.

## Scope

**In scope:** source in `src/`, the workflows in `.github/workflows/`, the release
pipeline, and any way to reach the secrets or the profile repository through them.

**Out of scope:** Open-Meteo, GitHub, and third-party actions or packages themselves (report to
their maintainers; tell us if our use of them is exploitable), the Meteocons icon CDN, social
engineering, and findings that need a compromised maintainer account or machine.

## Threat model

### System

Three times a day the **Weather** workflow fetches public weather data, patches the weather
section of the public profile README in `tashfiqul-islam/tashfiqul-islam`, and pushes an
SSH-signed commit. The **CI** workflow gates every change and releases from `main`. The work is split so
that code which touches untrusted input never holds a secret:

```text
+---------------- [ TRUST ZONES ] -----------------+
|                                                  |
| weather.yml                                      |
| ├─ render              no secrets, read-only     |
| │  ├─ open-meteo api   untrusted input           |
| │  └─ npm packages     third-party code          |
| └─ publish             profile environment       |
|    ├─ PAT              profile repo write        |
|    └─ signing key      ssh, verified pre-push    |
| ci.yml                                           |
| └─ release             GITHUB_TOKEN write        |
|    └─ semantic-release third-party code          |
|                                                  |
+--------------------------------------------------+
```

**render** fetches, validates, and patches, then hands the README to **publish** as a
run-scoped artifact. **publish** downloads it, signs with plain `git`, verifies the signature,
and pushes; it runs no fetch, no dependency code, and no third-party action with a secret.

### Assets

| Asset               | Why it matters                                                        |
| ------------------- | --------------------------------------------------------------------- |
| SSH signing key     | Signs as the maintainer: "Verified" commits anywhere GitHub trusts it |
| `PAT`               | Write access to the profile repository's contents                     |
| Profile README      | Public face of the maintainer; what visitors see                      |
| `main` and releases | Source of truth for every future run                                  |
| CI runners          | Execute the above with whatever credentials a job holds               |

### Threats and mitigations (STRIDE)

| #   | Threat                                                              | Mitigation                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1  | **Spoofing**: a forged or intercepted API response                  | HTTPS only; the response must pass a strict Zod schema (numbers, `0`/`1`, integer codes) or the run fails                                                                                                                                        |
| T1  | **Tampering**: injected HTML or Markdown in the README via API data | No API string reaches the README. Text comes from a fixed WMO table; values are rounded numbers and `HH:MM` times formatted by our code                                                                                                          |
| T2  | **Tampering**: a malicious npm release                              | Frozen `bun.lock`; 3-day `minimumReleaseAge` on install, 14 days in Renovate; dependency review on every PR; render installs `--production` (one dependency, `zod`) and holds no secrets; publish refuses any change outside the weather section |
| T3  | **Tampering**: a compromised or re-tagged action                    | Every action pinned to a full commit SHA; Renovate bumps pins through reviewed, CI-gated PRs                                                                                                                                                     |
| R1  | **Repudiation**: unattributable profile changes                     | Weather commits are SSH-signed and checked with `git verify-commit` before push; every run is logged in GitHub Actions with its diff in the job summary                                                                                          |
| I1  | **Information disclosure**: secrets read by untrusted code          | Secrets exist only in the `profile` environment and only in **publish**; `persist-credentials: false` everywhere; the PAT is injected into the single push step; fork PRs use `pull_request` and get no secrets                                  |
| I2  | **Information disclosure**: workflow misconfiguration leaks a token | `permissions: {}` by default with commented per-job grants; `actionlint` and `zizmor` (strictest persona) run on every commit and in CI                                                                                                          |
| D1  | **Denial of service**: Open-Meteo slow or down                      | 15 s per attempt, four attempts with jittered backoff and `Retry-After` (about 75 s of tolerance); the job times out in 5 min and the next scheduled run recovers                                                                                |
| E1  | **Elevation**: a PR or branch gains write access                    | No `pull_request_target`; **publish** never runs for PRs; the `profile` environment is limited to `main`; release runs only on push to `main` after the gate passes                                                                              |

### Residual risks

- **A compromised render job can still forge the weather values.** `scripts/publish.sh` refuses any
  change outside the weather section and the refresh stamp (and any file but `README.md`), so a
  malicious dependency in render could at most publish wrong numbers or icon text inside the
  table. No secret is reachable from render.
- **Third-party code with a write token.** semantic-release runs in the release job with
  `GITHUB_TOKEN` (contents, issues, pull requests: write on this repo). It is pinned and its
  updates are reviewed, but a malicious pinned version would still be trusted. The publish job has
  no such exposure: it signs and pushes with plain `git`.
- **Long-lived credentials.** The PAT and signing key are static secrets. Their scope and expiry
  (below) limit, but do not remove, the damage of a leak.

### Operating requirements

The model above assumes these settings. Revisit them after any change to the workflows.

- `profile` environment: holds `PAT`, `SIGNING_KEY` as **secrets** and `GIT_COMMITTER_NAME`,
  `GIT_COMMITTER_EMAIL` as **variables**; deployment branches limited to `main`; no admin bypass;
  no repository-level copies of the secrets.
- `PAT`: fine-grained, only `tashfiqul-islam/tashfiqul-islam`, only _Contents: read and write_,
  with an expiry; rotate on expiry or on any suspicion.
- `SIGNING_KEY`: a dedicated ed25519 key used for nothing else, registered on GitHub as a
  **signing** key (not an authentication key); `GIT_COMMITTER_EMAIL` is a verified address on the
  account. Revoke it on GitHub to invalidate the identity without touching any other key.
- Repository: private vulnerability reporting, secret scanning with push protection, and
  Dependabot alerts enabled; `main` protected so changes land through pull requests with the
  **CI / Quality gate** check passing.

Last reviewed: November 2026.
