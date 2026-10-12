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

github_git() {
  git -c credential.helper= \
    -c 'credential.helper=!f() { if [ "$1" = get ]; then printf "username=x-access-token\\npassword=%s\\n" "$GITHUB_PUSH_TOKEN"; fi; }; f' \
    "$@"
}

# Build on top of GitHub's current main so product-specific commits remain in its history.
github_git fetch --quiet "$GITHUB_REPOSITORY" main
github_main=$(git rev-parse FETCH_HEAD)

for product_file in README.md config/product.php; do
  if ! git cat-file -e "$github_main:$product_file"; then
    echo "Missing $product_file in $GITHUB_REPOSITORY; publication stopped." >&2
    exit 1
  fi
done

source_dir=$(pwd)
scratch_dir=$(mktemp -d)
variant_dir="$scratch_dir/repository"
trap 'git -C "$source_dir" worktree remove --force "$variant_dir" >/dev/null 2>&1 || true; rmdir "$scratch_dir" >/dev/null 2>&1 || true' EXIT

git worktree add --detach --quiet "$variant_dir" "$github_main"

# Start from the exact GitLab tree, then keep the two files owned by this GitHub repo.
git -C "$variant_dir" read-tree --reset -u "$CI_COMMIT_SHA"
git -C "$variant_dir" restore --source="$github_main" --staged --worktree -- \
  README.md config/product.php

if git -C "$variant_dir" diff --cached --quiet; then
  echo "GitHub already has the current GitLab code and its product files."
  exit 0
fi

git -C "$variant_dir" \
  -c user.name='GitLab CI' \
  -c user.email='gitlab-ci@users.noreply.github.com' \
  commit --quiet -m "Sync GitLab main $CI_COMMIT_SHA"

github_git -C "$variant_dir" push "$GITHUB_REPOSITORY" HEAD:refs/heads/main
