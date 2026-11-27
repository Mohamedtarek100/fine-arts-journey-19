#!/usr/bin/env bash
# =========================================================================
# GLB Optimization & Draco Compression Pipeline (scripts/optimize-models.sh)
# Usage:
#   bash scripts/optimize-models.sh path/to/model.glb
#   bash scripts/optimize-models.sh --all
# Requirements: Node.js 18+ (invokes npx @gltf-transform/cli)
# =========================================================================
set -euo pipefail

optimize_one() {
  local input="$1"
  local tmp="${input%.glb}.opt.glb"
  echo "[optimize] Processing: $input"
  npx --yes @gltf-transform/cli optimize "$input" "$tmp" \
    --compress draco \
    --texture-compress webp \
    --texture-size 1024 \
    --weld \
    --prune \
    --dedup
  mv -f "$tmp" "$input"
  echo "[optimize] Done: $input ($(du -h "$input" | cut -f1))"
}

if [[ "${1:-}" == "--all" ]]; then
  find assets/models -type f -name "*.glb" | while read -r file; do
    optimize_one "$file"
  done
elif [[ -n "${1:-}" && -f "$1" ]]; then
  optimize_one "$1"
else
  echo "Usage: bash scripts/optimize-models.sh <model.glb | --all>"
  exit 1
fi
