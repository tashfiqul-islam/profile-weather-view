#!/usr/bin/env bash
# Signs, verifies, and pushes the rendered README to the profile repository.
#
# Usage:  publish.sh <remote-url>          (run inside the profile repo checkout)
# Env:    SIGNING_KEY  private ed25519 key (OpenSSH format) registered as a GitHub signing key
#         NAME, EMAIL  commit identity; EMAIL must be verified on the GitHub account
#
# Trust boundary: the README comes from the secret-free render job. Before anything is signed,
# the change must be README.md only, and only inside the weather section or the refresh stamp.
set -euo pipefail

remote="${1:?usage: publish.sh <remote-url>}"
readonly START='<!-- Hourly Weather Update -->'
readonly END='<!-- End of Hourly Weather Update -->'
readonly STAMP='<em>Last refresh:'

fail() {
  echo "::error::$*" >&2
  exit 1
}

for var in SIGNING_KEY NAME EMAIL; do
  [[ -n "${!var:-}" ]] || fail "$var is not set in the profile environment"
done

changes="$(git status --porcelain)"
if [[ -z "$changes" ]]; then
  echo "::notice::README unchanged"
  exit 0
fi
[[ "$changes" == " M README.md" ]] || fail "unexpected changes from render: ${changes//$'\n'/, }"

# Everything outside the weather section, minus the refresh-stamp line, must be untouched.
outside() { sed "/$START/,/$END/d" | grep -vF "$STAMP" || true; }
diff -u <(git show HEAD:README.md | outside) <(outside < README.md) >&2 ||
  fail "render changed README.md outside the weather section; refusing to publish"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
key="$tmp/signing_key"
(umask 077 && printf '%s\n' "$SIGNING_KEY" > "$key")
printf '%s namespaces="git" %s\n' "$EMAIL" "$(ssh-keygen -y -f "$key")" > "$tmp/allowed_signers"

git config user.name "$NAME"
git config user.email "$EMAIL"
git config gpg.format ssh
git config user.signingkey "$key"
git config gpg.ssh.allowedSignersFile "$tmp/allowed_signers"
git config commit.gpgsign true

git commit --quiet -am "update(weather): refresh data for $(TZ=Asia/Dhaka date '+%Y-%m-%d %H:%M:%S %Z')"
git pull --quiet --rebase "$remote" main # survive a concurrent edit; the rebased commit is re-signed
git verify-commit HEAD
git push --quiet "$remote" HEAD:main
git log -1 --format='Pushed %h: %s'
