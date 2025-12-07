# Contributing

We love your input! We want to make contributing to this project as easy and transparent as possible.

## Ways to Contribute

- 🐛 **Report bugs** — Found an issue? [Open a bug report](https://github.com/Data-Wise/canvas-qti-converter/issues/new)
- 💡 **Suggest features** — Have an idea? [Start a discussion](https://github.com/Data-Wise/canvas-qti-converter/issues/new)
- 🔧 **Submit fixes** — PRs are welcome for any bug fixes
- 📚 **Improve docs** — Help us make the documentation better

## Development Setup

### Prerequisites

- Node.js 18+
- npm or bun

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Data-Wise/canvas-qti-converter.git
cd canvas-qti-converter

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

## Development Workflow

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
qti-convert examples/sample-quiz.md -o test.qti.zip

# Validate the output
qti-convert verify test.qti.zip

# Simulate Canvas import
qti-convert emulate-canvas test.qti.zip
```

## Project Structure

```text
canvas-qti-converter/
├── src/
│   ├── cli.ts          # Command-line interface
│   ├── parser.ts       # Markdown parsing logic
│   ├── generator.ts    # QTI XML generation
│   ├── validator.ts    # Package validation
│   └── emulator.ts     # Canvas import simulation
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

Feel free to [open an issue](https://github.com/Data-Wise/canvas-qti-converter/issues) for any questions!
