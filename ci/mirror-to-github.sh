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

askpass=$(mktemp)
trap 'rm -f "$askpass"' EXIT HUP INT TERM
cat > "$askpass" <<'EOF'
#!/bin/sh
case "$1" in
  *Username*) printf '%s\n' 'x-access-token' ;;
  *Password*) printf '%s\n' "$GITHUB_PUSH_TOKEN" ;;
  *) exit 1 ;;
esac
EOF
chmod 700 "$askpass"
export GIT_ASKPASS="$askpass"
export GIT_TERMINAL_PROMPT=0

git -c credential.helper= push "$GITHUB_REPOSITORY" "$CI_COMMIT_SHA:refs/heads/main"
