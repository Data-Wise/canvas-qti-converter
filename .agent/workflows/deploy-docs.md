---
description: Deploy documentation site to GitHub Pages
---

# Deploy Documentation

// turbo-all

1. Serve docs locally to verify:

```bash
cd docs && python -m http.server 8000
```

2. Build MkDocs site:

```bash
mkdocs build
```

3. Deploy to GitHub Pages:

```bash
mkdocs gh-deploy
```

The site will be available at: <https://data-wise.github.io/examify/>
