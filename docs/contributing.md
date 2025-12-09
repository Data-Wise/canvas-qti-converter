# Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible.

## Ways to Contribute

- 🐛 **Report bugs** — Found an issue? [Open a bug report](https://github.com/Data-Wise/examark/issues/new)
- 💡 **Suggest features** — Have an idea? [Start a discussion](https://github.com/Data-Wise/examark/issues/new)
- 🔧 **Submit fixes** — PRs are welcome for any bug fixes
- 📚 **Improve docs** — Help us make the documentation better

## Development Setup

### Prerequisites

- Node.js 18+
- npm or bun

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Data-Wise/examark.git
cd examark

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

## Development Workflow

### 📦 Release Workflow

We use **fully automated releases**. To release a new version:

1. **Ensure you are on `main` branch** with a clean working tree.
2. Run the automated release command:

    ```bash
    npm version patch  # v0.6.1 -> v0.6.2
    # OR
    npm version minor  # v0.6.x -> v0.7.0
    # OR
    npm version major  # v0.x.x -> v1.0.0
    ```

    **This command automatically:**

    1. Bumps version in `package.json`, `src/index.ts`, `_extensions/exam/_extension.yml`, and `README.md`
    2. Creates a git commit and tag
    3. Pushes to GitHub (triggers release workflow)

    **The GitHub Actions workflow then:**

    1. Builds the project
    2. Creates a GitHub Release with:
       - `examark-cli.zip` (CLI distribution)
       - `examark-extension.zip` (Quarto extension)
       - Auto-generated release notes
    3. Publishes to **npm** (`npm install -g examark`)
    4. Updates **Homebrew tap** (`brew upgrade examark`)

### Manual Release (Fallback)

If automation fails, run:

```bash
bun scripts/sync-version.ts
git add -A
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

Then manually:

- Publish to npm: `npm publish --access public`
- Update Homebrew: Edit `Formula/examark.rb` in the [homebrew-tap](https://github.com/Data-Wise/homebrew-tap) repo

### Required Secrets

For full automation, these secrets must be configured in GitHub repository settings:

| Secret | Purpose |
|--------|---------|
| `NPM_TOKEN` | npm granular access token with publish permissions |
| `HOMEBREW_TAP_TOKEN` | GitHub PAT with `repo` scope for homebrew-tap |

#### Creating NPM_TOKEN (Granular Access Token)

As of November 2025, npm only supports **granular access tokens** (classic tokens are deprecated).

1. Go to [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~/tokens)
2. Click **"Generate New Token"** → **"Granular Access Token"**
3. Configure:
   - **Token name**: `examark-ci-publish`
   - **Expiration**: Up to 90 days max (you'll need to rotate periodically)
   - **Packages and scopes**: Select "Only select packages and scopes" → add `examark`
   - **Permissions**: **Read and write**
   - **Organizations**: Select your org if applicable
4. Copy token and add as `NPM_TOKEN` secret in GitHub

!!! tip "Alternative: Trusted Publishing"
    For even better security, consider [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) which uses OIDC and eliminates long-lived tokens entirely. Requires npm CLI 11.5.1+.

#### Creating HOMEBREW_TAP_TOKEN

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Configure:
   - **Note**: `examark-homebrew-tap`
   - **Expiration**: 90 days or custom
   - **Scopes**: Select `repo` (full control of private repositories)
4. Copy token and add as `HOMEBREW_TAP_TOKEN` secret in GitHub

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (auto-rerun on changes)
npm run test:watch
```

!!! tip "Test Coverage"
    We use Vitest for testing. All 195 tests should pass before submitting a PR.

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Build and verify
npm run build
```

### Testing Your Changes

```bash
# Convert a test file
examark examples/sample-quiz.md -o test.qti.zip

# Validate the output
examark verify test.qti.zip

# Simulate Canvas import
examark emulate-canvas test.qti.zip
```

## Project Structure

```text
examark/
├── src/
│   ├── index.ts        # CLI entry point
│   ├── parser/         # Markdown parsing logic
│   ├── generator/      # QTI XML generation
│   ├── diagnostic/     # Validation & Emulation
│   └── utils/          # Shared utilities
├── tests/              # Test suite
├── docs/               # MkDocs documentation
└── examples/           # Sample input files
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with tests
4. **Commit** using [conventional commits](https://www.conventionalcommits.org/)

   ```bash
   git commit -m "feat: add amazing new feature"
   git commit -m "fix: resolve parsing issue"
   ```

5. **Push** to your fork
6. **Open** a Pull Request

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Code follows existing style
- [ ] Documentation updated if needed

## Code of Conduct

Be kind. We're all here to learn and build something useful together.

## Questions?

Feel free to [open an issue](https://github.com/Data-Wise/examark/issues) for any questions!
