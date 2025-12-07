# Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible.

## Ways to Contribute

- 🐛 **Report bugs** — Found an issue? [Open a bug report](https://github.com/Data-Wise/examify/issues/new)
- 💡 **Suggest features** — Have an idea? [Start a discussion](https://github.com/Data-Wise/examify/issues/new)
- 🔧 **Submit fixes** — PRs are welcome for any bug fixes
- 📚 **Improve docs** — Help us make the documentation better

## Development Setup

### Prerequisites

- Node.js 18+
- npm or bun

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Data-Wise/examify.git
cd examify

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

## Development Workflow

### 📦 Release Workflow

We use **automated versioning**. To release a new version:

1. **Ensure you are on `dev` branch** and clean.
2. Run the automated release command:

    ```bash
    npm version patch  # v0.4.1 -> v0.4.2
    # OR
    npm version minor  # v0.4.x -> v0.5.0
    ```

    **This command automatically:**
    1. Bumps version in `package.json`, `src/index.ts`, `_extensions/.../_extension.yml`, and `README.md`.
    2. Creates a git commit and tag.
    3. Pushes to GitHub.
    4. Triggers the GitHub Action to build and release artifacts.

### Manual Release (Fallback)

If automation fails, run:

```bash
bun scripts/sync-version.ts
git add -A
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push origin dev --tags
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (auto-rerun on changes)
npm run test:watch
```

!!! tip "Test Coverage"
    We use Vitest for testing. All 32 tests should pass before submitting a PR.

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
examify examples/sample-quiz.md -o test.qti.zip

# Validate the output
examify verify test.qti.zip

# Simulate Canvas import
examify emulate-canvas test.qti.zip
```

## Project Structure

```text
examify/
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

Feel free to [open an issue](https://github.com/Data-Wise/examify/issues) for any questions!
