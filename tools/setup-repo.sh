#!/usr/bin/env bash
# One-time repository setup: enables GitHub Pages with the Actions workflow as the source.
# Run after the repository is public (Pages on a private repository needs a paid plan).
# Then re-run the "pages" workflow: gh workflow run pages.yml
set -euo pipefail

repo="${1:-ilya-isayenia/agentic-design}"

if gh api "repos/${repo}/pages" >/dev/null 2>&1; then
	gh api -X PUT "repos/${repo}/pages" -f build_type=workflow
	echo "Pages already enabled for ${repo}; source set to the workflow."
else
	gh api -X POST "repos/${repo}/pages" -f build_type=workflow
	echo "Pages enabled for ${repo}."
fi

echo "App:       https://${repo%%/*}.github.io/${repo#*/}/"
echo "Storybook: https://${repo%%/*}.github.io/${repo#*/}/storybook/"
