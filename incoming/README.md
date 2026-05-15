# Incoming Stories

Drop `.txt`, `.docx`, or `.odt` source files in this folder, then run:

```bash
npm run import:incoming
```

The importer creates website-ready Markdown files in `src/content/stories`.
It skips a file if a story with the same slug already exists.

Keep originals here as your local source archive. The website only reads the
generated `.md` files in `src/content/stories`.
