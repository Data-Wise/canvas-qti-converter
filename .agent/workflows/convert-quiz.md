---
description: Convert a markdown quiz file to QTI and verify it
---

# Convert Quiz to QTI

1. Build the project if not already built:

```bash
npm run build
```

2. Convert the markdown file (replace `<input>` with your file):

```bash
examify <input>.md -o scratch/<output>.qti.zip
```

3. Preview parsed questions (optional):

```bash
examify <input>.md --preview
```

4. Emulate Canvas import to predict success:

```bash
examify emulate-canvas scratch/<output>.qti.zip
```

5. Check the package contents:

```bash
unzip -l scratch/<output>.qti.zip
```
