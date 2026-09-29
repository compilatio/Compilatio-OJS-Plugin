#!/bin/sh
set -eu

: "${CI_COMMIT_SHA:?Missing GitLab commit SHA}"
: "${GITHUB_REPOSITORY:?Missing GitHub repository URL}"
: "${GITHUB_PUSH_TOKEN:?Missing GitHub push token}"

# An old pipeline must not publish after a newer main commit has landed.
git fetch --quiet origin main
latest_main=$(git rev-parse FETCH_HEAD)

if [ "$latest_main" != "$CI_COMMIT_SHA" ]; then
  echo "Skipping superseded commit $CI_COMMIT_SHA."
  exit 0
fi

export GIT_TERMINAL_PROMPT=0

git -c credential.helper= \
  -c 'credential.helper=!f() { if [ "$1" = get ]; then printf "username=x-access-token\\npassword=%s\\n" "$GITHUB_PUSH_TOKEN"; fi; }; f' \
  push "$GITHUB_REPOSITORY" "$CI_COMMIT_SHA:refs/heads/main"
