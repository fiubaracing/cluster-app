<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions

Read `CONTRIBUTING.md` in full before writing or changing any code. It defines the backend onion architecture and its one-way data flow (`request → DTO → entity → model → response`, never `model → entity → model`), the frontend feature structure, how SQL migrations work, and the naming, style and git conventions. Follow it, and if a change conflicts with it, say so instead of silently diverging.

Before your first commit, install the pre-commit hook by running `bash scripts/install-hooks.sh` and never bypass it with `--no-verify`. See "Pre-commit hook" in `CONTRIBUTING.md`.
