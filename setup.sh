#!/bin/bash
set -euo pipefail

# Ensure the root .env exists (seed from .env.example if missing)
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "Root .env not found — creating it from .env.example"
    cp .env.example .env
  else
    echo "Root .env and .env.example are both missing. Create a root .env first." >&2
    exit 1
  fi
fi

# Symlink the root .env into every app and package so each workspace
# resolves the same env when run on its own (e.g. pnpm --filter <pkg> dev).
# apps/* and packages/* are both two levels deep, so ../../.env points to root.
for dir in apps/* packages/*; do
  [ -d "$dir" ] || continue
  target="$dir/.env"

  # Don't clobber a real (non-symlink) .env that a package intentionally owns.
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "skip  $target (real file, not a symlink)"
    continue
  fi

  ln -sf ../../.env "$target"
  echo "link  $target -> root .env"
done

echo "Done. Root .env linked into all workspaces. ✅"
