---
description: Create a new version release with tag
---

# Release New Version

1. Update version in package.json:

```bash
# Edit package.json "version" field
```

2. Update version in src/index.ts:

```bash
# Update .version('X.Y.Z') line
```

3. Add CHANGELOG entry for new version

4. Build and test:

```bash
npm run build && npm test -- --run
```

5. Commit changes:

```bash
git add -A && git commit -m 'chore: release vX.Y.Z'
```

6. Create and push tag:

```bash
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

7. Deploy updated docs:

```bash
mkdocs gh-deploy
```
