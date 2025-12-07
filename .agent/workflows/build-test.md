---
description: Build, test, and generate a QTI package from a markdown file
---

# Examify Build and Test

// turbo-all

1. Build the project:

```bash
npm run build
```

2. Run all tests:

```bash
npm test -- --run
```

3. Generate a test QTI package:

```bash
examify examples/quiz-with-figures.md -o scratch/test-output.qti.zip
```

4. Verify the package:

```bash
examify emulate-canvas scratch/test-output.qti.zip
```
