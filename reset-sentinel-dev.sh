#!/usr/bin/env bash
# Sentinel dev reset — clears generated workspace + local WebView data (macOS / Linux).
# Usage: ./reset-sentinel-dev.sh   [--dry-run]   [--skip-webview-data]   [--skip-repo-local]
set -euo pipefail

DRY_RUN=0
SKIP_WEBVIEW=0
SKIP_REPO_LOCAL=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --skip-webview-data) SKIP_WEBVIEW=1 ;;
    --skip-repo-local) SKIP_REPO_LOCAL=1 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

ok()  { echo "[OK] $*"; }
warn() { echo "[--] $*"; }
info() { echo "     $*"; }

is_repo_layout() {
  local d="$1"
  [[ -f "$d/app/package.json" && -f "$d/app/src-tauri/Cargo.toml" ]]
}

default_workspace() {
  if [[ -n "${SENTINEL_WORKSPACE_ROOT:-}" ]]; then
    (cd "${SENTINEL_WORKSPACE_ROOT}" && pwd)
    return
  fi
  case "$(uname -s)" in
    Darwin)
      echo "$HOME/Library/Application Support/Sentinel/workspace"
      ;;
    Linux)
      local xdg="${XDG_DATA_HOME:-$HOME/.local/share}"
      echo "$xdg/Sentinel/workspace"
      ;;
    *)
      echo "Unsupported OS; set SENTINEL_WORKSPACE_ROOT." >&2
      exit 1
      ;;
  esac
}

stop_sentinel() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    warn "Would stop Sentinel-related processes (sentinel-app, Sentinel)"
    return
  fi
  pkill -f sentinel-app 2>/dev/null || true
  pkill -x Sentinel 2>/dev/null || true
  ok "Stopped Sentinel processes (if any were running)"
}

rm_tree() {
  local path="$1" label="$2"
  [[ -e "$path" ]] || return
  if [[ "$DRY_RUN" -eq 1 ]]; then
    warn "Would remove: $label -> $path"
    return
  fi
  rm -rf "$path"
  ok "Removed $label"
}

clear_dir_contents() {
  local dir="$1" label="$2"
  [[ -d "$dir" ]] || return
  if [[ "$DRY_RUN" -eq 1 ]]; then
    warn "Would clear contents: $label -> $dir"
    return
  fi
  find "$dir" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  ok "Cleared $label"
}

ensure_layout() {
  local root="$1"
  local subs=(
    app assets evidence imports imports/original_evidence_uploads imports/parenting_plan
    imports/legal_references imports/authority_library imports/reference_materials
    exports backups temp cache logs
    uploads/raw uploads/processed uploads/ocr uploads/extracted uploads/thumbnails
  )
  for rel in "${subs[@]}"; do
    local full="$root/$rel"
    if [[ "$DRY_RUN" -eq 1 ]]; then
      info "Would ensure directory: $full"
    else
      mkdir -p "$full"
    fi
  done
  if [[ "$DRY_RUN" -eq 1 ]]; then warn "Would recreate clean workspace folder layout"
  else ok "Recreated clean workspace folder layout"; fi
}

echo ""
echo "Sentinel dev reset - generated runtime data only"
echo "------------------------------------------------"
if [[ "$DRY_RUN" -eq 1 ]]; then warn "DRY RUN: no deletes."; fi

stop_sentinel

WS="$(default_workspace)"
info "Workspace root: $WS"

if is_repo_layout "$WS"; then
  echo "Refusing: workspace root looks like the Sentinel repository. Set SENTINEL_WORKSPACE_ROOT." >&2
  exit 1
fi
if [[ "$(cd / && cd "$REPO_ROOT" && pwd)" == "$(cd / && cd "$WS" && pwd 2>/dev/null || true)" ]]; then
  echo "Refusing: workspace root equals repository root." >&2
  exit 1
fi

mkdir -p "$WS" 2>/dev/null || true
if [[ ! -d "$WS" ]]; then mkdir -p "$WS"; ok "Created workspace root"; fi
clear_dir_contents "$WS" "workspace runtime tree"
ensure_layout "$WS"

if [[ "$SKIP_WEBVIEW" -eq 0 ]]; then
  case "$(uname -s)" in
    Darwin)
      rm_tree "$HOME/Library/Application Support/com.faithbasedinnovations.sentinel" "Tauri/WebView data (macOS)"
      ;;
    Linux)
      rm_tree "${XDG_DATA_HOME:-$HOME/.local/share}/com.faithbasedinnovations.sentinel" "Tauri/WebView data (Linux)"
      ;;
  esac
fi

if [[ "$SKIP_REPO_LOCAL" -eq 0 ]]; then
  for d in evidence imports exports backups uploads temp cache logs; do
    if [[ -e "$REPO_ROOT/$d" ]]; then
      rm_tree "$REPO_ROOT/$d" "repo-local $d"
    fi
  done
fi

echo ""
if [[ "$DRY_RUN" -eq 1 ]]; then
  warn "Dry run finished (no changes were made)."
else
  ok "Reset complete. Launch Sentinel to run first-run / onboarding again."
fi
echo ""
