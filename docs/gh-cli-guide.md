# GitHub CLI (`gh`) Workflow Guide

A practical guide for managing PRs, releases, and repository operations with the GitHub CLI.

## Table of Contents

1. [Authentication](#authentication)
2. [Pull Request Management](#pull-request-management)
3. [Dependabot PRs](#dependabot-prs)
4. [Releases](#releases)
5. [Repository Operations](#repository-operations)
6. [Workflow Runs](#workflow-runs)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Authentication

### Initial Setup

```bash
# Basic authentication (opens browser)
gh auth login

# With specific scopes (required for workflow file modifications)
gh auth login --scopes workflow,repo,read:org

# Check current auth status
gh auth status
```

### Token Scopes Explained

| Scope | Purpose | When Needed |
|-------|---------|-------------|
| `repo` | Full repository access | Default, most operations |
| `workflow` | Modify workflow files | Merging PRs that touch `.github/workflows/` |
| `read:org` | Read org membership | Private org repos |
| `admin:repo_hook` | Manage webhooks | Setting up hooks |
| `delete_repo` | Delete repositories | Dangerous, rarely needed |

### Re-authenticate with Additional Scopes

```bash
# Add workflow scope (needed for dependabot workflow PRs)
gh auth refresh --scopes workflow

# Or full re-login
gh auth login --scopes workflow
```

**Pro tip**: If you get "refusing to allow an OAuth App to create or update workflow" errors, you need the `workflow` scope.

---

## Pull Request Management

### Listing PRs

```bash
# List open PRs
gh pr list

# List all PRs (including closed)
gh pr list --state all

# List PRs by author
gh pr list --author dependabot

# List PRs with specific label
gh pr list --label "dependencies"

# Custom format output
gh pr list --json number,title,author --jq '.[] | "\(.number): \(.title) by \(.author.login)"'
```

### Viewing PR Details

```bash
# View PR in terminal
gh pr view 123

# View specific fields as JSON
gh pr view 123 --json title,body,files,mergeable,statusCheckRollup

# Check if PR is mergeable
gh pr view 123 --json mergeable --jq '.mergeable'

# List changed files
gh pr view 123 --json files --jq '.files[].path'

# Check CI status
gh pr view 123 --json statusCheckRollup --jq '.statusCheckRollup[] | "\(.name): \(.conclusion)"'
```

### Creating PRs

```bash
# Interactive PR creation
gh pr create

# With title and body
gh pr create --title "Add feature X" --body "Description here"

# With body from file
gh pr create --title "Add feature X" --body-file PR_TEMPLATE.md

# Draft PR
gh pr create --draft --title "WIP: Feature X"

# Specify base branch
gh pr create --base develop --title "Feature X"

# With reviewers and labels
gh pr create --title "Feature X" --reviewer user1,user2 --label enhancement
```

### Merging PRs

```bash
# Merge with default method (usually merge commit)
gh pr merge 123

# Squash merge (combines all commits into one)
gh pr merge 123 --squash

# Rebase merge (replays commits on base)
gh pr merge 123 --rebase

# Delete branch after merge
gh pr merge 123 --squash --delete-branch

# Auto-merge when checks pass
gh pr merge 123 --auto --squash

# Admin merge (bypass branch protection)
gh pr merge 123 --admin --squash
```

### Merge Method Comparison

| Method | Result | Best For |
|--------|--------|----------|
| `--merge` | Merge commit | Preserving full history |
| `--squash` | Single commit | Clean history, dependabot PRs |
| `--rebase` | Linear history | Feature branches |

### Checkout and Review

```bash
# Checkout PR locally
gh pr checkout 123

# Checkout and create local branch name
gh pr checkout 123 --branch feature-review

# View diff
gh pr diff 123

# View diff for specific file
gh pr diff 123 -- src/index.ts
```

---

## Dependabot PRs

### Batch Operations

```bash
# List all dependabot PRs
gh pr list --author "app/dependabot"

# View all dependabot PR numbers
gh pr list --author "app/dependabot" --json number --jq '.[].number'

# Merge all passing dependabot PRs (careful!)
for pr in $(gh pr list --author "app/dependabot" --json number,mergeable --jq '.[] | select(.mergeable == "MERGEABLE") | .number'); do
  echo "Merging PR #$pr"
  gh pr merge $pr --squash --delete-branch
done
```

### Checking CI Status Before Merge

```bash
# Check if all checks passed
gh pr view 123 --json statusCheckRollup --jq '
  .statusCheckRollup |
  if all(.conclusion == "SUCCESS") then "All checks passed"
  else "Some checks failed" end
'

# List failed checks
gh pr view 123 --json statusCheckRollup --jq '.statusCheckRollup[] | select(.conclusion != "SUCCESS")'
```

### Handling Conflicts

```bash
# Check mergeable status
gh pr view 123 --json mergeable

# Request dependabot rebase (via comment - deprecated Jan 2026)
gh pr comment 123 --body "@dependabot rebase"

# Manual rebase approach
gh pr checkout 123
git fetch origin main
git rebase origin/main
git push --force-with-lease
```

**Note**: As of January 2026, `@dependabot` comment commands are deprecated. Use GitHub's native PR controls instead.

---

## Releases

### Creating Releases

```bash
# Create release from existing tag
gh release create v1.0.0

# Create release with auto-generated notes
gh release create v1.0.0 --generate-notes

# Create release with custom notes
gh release create v1.0.0 --notes "Release notes here"

# Create release with notes from file
gh release create v1.0.0 --notes-file CHANGELOG.md

# Create release with assets
gh release create v1.0.0 dist/*.zip dist/*.tar.gz

# Create draft release
gh release create v1.0.0 --draft

# Create prerelease
gh release create v1.0.0-beta.1 --prerelease

# Target specific commit
gh release create v1.0.0 --target main
```

### Listing and Viewing Releases

```bash
# List releases
gh release list

# View latest release
gh release view

# View specific release
gh release view v1.0.0

# Get release as JSON
gh release view v1.0.0 --json tagName,publishedAt,body
```

### Downloading Release Assets

```bash
# Download all assets from latest release
gh release download

# Download specific release assets
gh release download v1.0.0

# Download to specific directory
gh release download v1.0.0 --dir ./downloads

# Download specific asset pattern
gh release download v1.0.0 --pattern "*.zip"
```

### Editing Releases

```bash
# Edit release notes
gh release edit v1.0.0 --notes "Updated notes"

# Convert draft to published
gh release edit v1.0.0 --draft=false

# Add assets to existing release
gh release upload v1.0.0 additional-file.zip
```

---

## Repository Operations

### Cloning

```bash
# Clone by name (uses current authenticated user/org)
gh repo clone examark

# Clone with full path
gh repo clone Data-Wise/examark

# Clone to specific directory
gh repo clone Data-Wise/examark ./my-project
```

### Repository Info

```bash
# View repo in browser
gh repo view --web

# View repo info
gh repo view

# View as JSON
gh repo view --json name,description,defaultBranchRef,stargazerCount

# List repos
gh repo list Data-Wise --limit 20
```

### Forking

```bash
# Fork to your account
gh repo fork Data-Wise/examark

# Fork and clone
gh repo fork Data-Wise/examark --clone
```

---

## Workflow Runs

### Listing Runs

```bash
# List recent workflow runs
gh run list

# List runs for specific workflow
gh run list --workflow ci.yml

# List runs for specific branch
gh run list --branch main

# List failed runs only
gh run list --status failure

# Limit results
gh run list --limit 5
```

### Viewing Run Details

```bash
# View specific run
gh run view 12345678

# View with logs
gh run view 12345678 --log

# View failed logs only
gh run view 12345678 --log-failed

# Watch run in progress
gh run watch 12345678
```

### Triggering Workflows

```bash
# Trigger workflow_dispatch workflow
gh workflow run ci.yml

# With inputs
gh workflow run deploy.yml --field environment=production

# On specific branch
gh workflow run ci.yml --ref feature-branch
```

### Re-running Failed Workflows

```bash
# Re-run all jobs
gh run rerun 12345678

# Re-run failed jobs only
gh run rerun 12345678 --failed
```

---

## Common Patterns

### Full PR Review and Merge Workflow

```bash
# 1. List open PRs
gh pr list

# 2. View PR details and check CI
gh pr view 123 --json title,body,files,statusCheckRollup

# 3. Checkout for local testing
gh pr checkout 123

# 4. Run local tests
npm test

# 5. Approve (if reviewing)
gh pr review 123 --approve --body "LGTM!"

# 6. Merge
gh pr merge 123 --squash --delete-branch

# 7. Return to main
git checkout main && git pull
```

### Release Workflow

```bash
# 1. Ensure on main and up to date
git checkout main && git pull

# 2. Bump version (npm projects)
npm version patch  # or minor, major

# 3. Push with tags
git push && git push --tags

# 4. Create GitHub release
gh release create v$(node -p "require('./package.json').version") --generate-notes
```

### Bulk Merge Dependabot PRs

```bash
#!/bin/bash
# Save as: merge-dependabot.sh

echo "Fetching dependabot PRs..."
prs=$(gh pr list --author "app/dependabot" --json number,title,statusCheckRollup --jq '
  .[] | select(.statusCheckRollup | all(.conclusion == "SUCCESS")) |
  "\(.number)\t\(.title)"
')

if [ -z "$prs" ]; then
  echo "No mergeable dependabot PRs found"
  exit 0
fi

echo "Found mergeable PRs:"
echo "$prs"
echo ""
read -p "Merge all? (y/n) " confirm

if [ "$confirm" = "y" ]; then
  echo "$prs" | while IFS=$'\t' read -r num title; do
    echo "Merging #$num: $title"
    gh pr merge "$num" --squash --delete-branch --admin || echo "Failed to merge #$num"
  done
fi
```

### JSON Query Patterns (jq)

```bash
# Extract single field
gh pr view 123 --json title --jq '.title'

# Multiple fields
gh pr view 123 --json title,number --jq '"\(.number): \(.title)"'

# Filter arrays
gh pr list --json number,title,labels --jq '.[] | select(.labels[].name == "bug")'

# Count
gh pr list --json number --jq 'length'

# Transform to table
gh pr list --json number,title,author --jq '.[] | [.number, .title, .author.login] | @tsv'
```

---

## Troubleshooting

### Common Errors and Solutions

#### "refusing to allow an OAuth App to create or update workflow"

**Cause**: Token lacks `workflow` scope
**Solution**:
```bash
gh auth refresh --scopes workflow
# or
gh auth login --scopes workflow
```

#### "Pull request is not mergeable: the head branch is not up to date"

**Cause**: Branch has conflicts or is behind base
**Solutions**:
```bash
# Option 1: Rebase locally
gh pr checkout 123
git fetch origin main
git rebase origin/main
git push --force-with-lease

# Option 2: Use admin merge (if you have permission)
gh pr merge 123 --admin --squash

# Option 3: Enable auto-merge to merge when ready
gh pr merge 123 --auto --squash
```

#### "GraphQL: Resource not accessible by integration"

**Cause**: Insufficient permissions
**Solution**: Check repo access and token scopes
```bash
gh auth status
gh api user  # Should return your user info
```

#### Rate Limiting

**Cause**: Too many API requests
**Solution**:
```bash
# Check rate limit status
gh api rate_limit --jq '.resources.core'

# Wait or use conditional requests
```

### Debugging

```bash
# Enable debug output
GH_DEBUG=1 gh pr list

# Check API responses directly
gh api repos/Data-Wise/examark/pulls

# Verbose output
gh pr merge 123 --squash 2>&1 | cat -v
```

### Useful Aliases

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# PR shortcuts
alias prlist='gh pr list'
alias prview='gh pr view'
alias prmerge='gh pr merge --squash --delete-branch'
alias prco='gh pr checkout'

# Quick merge with admin
alias pradmin='gh pr merge --squash --delete-branch --admin'

# Dependabot PRs
alias deplist='gh pr list --author "app/dependabot"'

# Release
alias relcreate='gh release create --generate-notes'

# Workflow runs
alias runs='gh run list --limit 10'
alias runwatch='gh run watch'
```

---

## Quick Reference

| Task | Command |
|------|---------|
| List open PRs | `gh pr list` |
| View PR | `gh pr view 123` |
| Check CI status | `gh pr view 123 --json statusCheckRollup` |
| Checkout PR | `gh pr checkout 123` |
| Merge (squash) | `gh pr merge 123 --squash --delete-branch` |
| Admin merge | `gh pr merge 123 --admin --squash` |
| Create PR | `gh pr create` |
| List runs | `gh run list` |
| Watch run | `gh run watch` |
| Create release | `gh release create v1.0.0 --generate-notes` |
| Auth status | `gh auth status` |
| Add workflow scope | `gh auth refresh --scopes workflow` |

---

## Additional Resources

- [Official gh documentation](https://cli.github.com/manual/)
- [gh reference](https://cli.github.com/manual/gh)
- [jq manual](https://stedolan.github.io/jq/manual/) (for JSON queries)
