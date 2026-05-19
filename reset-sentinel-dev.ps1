#Requires -Version 5.1
<#
.SYNOPSIS
  Clears Sentinel generated workspace + local WebView data for a true first-run experience.

.DESCRIPTION
  - Stops running Sentinel (Tauri) processes.
  - Deletes all files under the Sentinel workspace root (see SENTINEL_WORKSPACE_ROOT or OS default).
  - Removes Tauri/WebView local data for this app bundle (IndexedDB, localStorage, sessionStorage, etc.).
  - Optionally removes repo-local dev mirror folders (evidence, imports, …) next to this script when present.
  - Recreates empty workspace directories matching sentinel_ensure_layout (Rust).

  NEVER deletes repository source: app/src, app/src-tauri/src, package.json, .git, etc.

.PARAMETER DryRun
  Print actions only; do not delete or stop processes.

.PARAMETER SkipWebViewData
  Do not remove %LOCALAPPDATA%\com.faithbasedinnovations.sentinel (WebView / IndexedDB cache).

.PARAMETER SkipRepoLocal
  Do not remove repo-root evidence/imports/… folders (if you only use the Tauri workspace).
#>
param(
  [switch] $DryRun,
  [switch] $SkipWebViewData,
  [switch] $SkipRepoLocal
)

if ($args -contains '--dry-run') { $DryRun = $true }
if ($args -contains '--skip-webview-data') { $SkipWebViewData = $true }
if ($args -contains '--skip-repo-local') { $SkipRepoLocal = $true }

$ErrorActionPreference = 'Stop'

function Write-Ok([string]$msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn([string]$msg) { Write-Host "[--] $msg" -ForegroundColor Yellow }
function Write-Info([string]$msg) { Write-Host "     $msg" -ForegroundColor Gray }

function Test-IsSentinelRepoLayout([string]$CandidateRoot) {
  if (-not (Test-Path -LiteralPath $CandidateRoot)) { return $false }
  $pkg = Join-Path $CandidateRoot 'app\package.json'
  $cargo = Join-Path $CandidateRoot 'app\src-tauri\Cargo.toml'
  if ((Test-Path -LiteralPath $pkg) -and (Test-Path -LiteralPath $cargo)) { return $true }
  return $false
}

function Get-DefaultWorkspaceRoot {
  if ($env:SENTINEL_WORKSPACE_ROOT -and $env:SENTINEL_WORKSPACE_ROOT.Trim().Length -gt 0) {
    return [System.IO.Path]::GetFullPath($env:SENTINEL_WORKSPACE_ROOT.Trim())
  }
  if ($env:OS -match 'Windows') {
    if (-not $env:LOCALAPPDATA) { throw 'LOCALAPPDATA is not set. Set SENTINEL_WORKSPACE_ROOT to your data directory.' }
    return [System.IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Faith Based Innovations\Sentinel\workspace'))
  }
  $home = $env:HOME
  if (-not $home) { throw 'HOME is not set. Set SENTINEL_WORKSPACE_ROOT.' }
  if ($env:OS -match 'Darwin' -or (Test-Path (Join-Path $home 'Library'))) {
    return [System.IO.Path]::GetFullPath((Join-Path $home 'Library/Application Support/Sentinel/workspace'))
  }
  $xdg = if ($env:XDG_DATA_HOME) { $env:XDG_DATA_HOME } else { Join-Path $home '.local/share' }
  return [System.IO.Path]::GetFullPath((Join-Path $xdg 'Sentinel/workspace'))
}

function Stop-SentinelProcesses {
  $names = @('sentinel-app', 'Sentinel')
  foreach ($n in $names) {
    $procs = Get-Process -Name $n -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
      if ($DryRun) { Write-Warn "Would stop process: $($p.ProcessName) (PID $($p.Id))" }
      else {
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        Write-Ok "Stopped process $($p.ProcessName) (PID $($p.Id))"
      }
    }
  }
}

function Remove-TreeIfExists([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  if ($DryRun) { Write-Warn "Would remove: $Label -> $Path"; return }
  Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
  Write-Ok "Removed $Label"
}

function Clear-DirectoryContents([string]$DirPath, [string]$Label) {
  if (-not (Test-Path -LiteralPath $DirPath)) { return }
  if ($DryRun) { Write-Warn "Would clear contents: $Label -> $DirPath"; return }
  Get-ChildItem -LiteralPath $DirPath -Force | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop }
  Write-Ok "Cleared $Label"
}

function Ensure-WorkspaceLayout([string]$WorkspaceRoot) {
  $subs = @(
    'app',
    'assets',
    'evidence',
    'imports',
    'imports/original_evidence_uploads',
    'imports/parenting_plan',
    'imports/legal_references',
    'imports/authority_library',
    'imports/reference_materials',
    'exports',
    'backups',
    'temp',
    'cache',
    'logs',
    'uploads/raw',
    'uploads/processed',
    'uploads/ocr',
    'uploads/extracted',
    'uploads/thumbnails'
  )
  foreach ($rel in $subs) {
    $full = Join-Path $WorkspaceRoot $rel.Replace('/', [IO.Path]::DirectorySeparatorChar)
    if ($DryRun) { Write-Info "Would ensure directory: $full" }
    else {
      New-Item -ItemType Directory -Force -Path $full | Out-Null
    }
  }
  if (-not $DryRun) { Write-Ok 'Recreated clean workspace folder layout' }
  else { Write-Warn 'Would recreate clean workspace folder layout' }
}

# --- main ---
Write-Host ''
Write-Host 'Sentinel dev reset - generated runtime data only' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
if ($DryRun) { Write-Warn 'DRY RUN: no files will be deleted and no processes stopped.' }

$ScriptRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$RepoRoot = $ScriptRoot

if (-not (Test-Path (Join-Path $RepoRoot 'app\package.json'))) {
  Write-Warn 'Could not find app\package.json next to this script; repo-local cleanup paths may be wrong.'
}

Stop-SentinelProcesses

$workspaceRoot = Get-DefaultWorkspaceRoot
Write-Info "Workspace root: $workspaceRoot"

if (Test-IsSentinelRepoLayout $workspaceRoot) {
  throw "Refusing: workspace root matches Sentinel repository layout. Point SENTINEL_WORKSPACE_ROOT at a data-only folder."
}
$fullRepo = [System.IO.Path]::GetFullPath($RepoRoot)
if ([string]::Equals($workspaceRoot.TrimEnd('\', '/'), $fullRepo.TrimEnd('\', '/'), [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Refusing: workspace root equals repository root.'
}

if (-not (Test-Path -LiteralPath $workspaceRoot)) {
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $workspaceRoot | Out-Null }
  Write-Ok 'Workspace root did not exist; created empty root'
}
else {
  Clear-DirectoryContents $workspaceRoot 'workspace runtime tree'
}

Ensure-WorkspaceLayout $workspaceRoot

# Tauri / WebView2 persisted web storage (localStorage, sessionStorage, IndexedDB for dev URL)
if (-not $SkipWebViewData -and ($env:OS -match 'Windows') -and $env:LOCALAPPDATA) {
  $bundleDir = Join-Path $env:LOCALAPPDATA 'com.faithbasedinnovations.sentinel'
  Remove-TreeIfExists $bundleDir 'Tauri/WebView local data (com.faithbasedinnovations.sentinel)'
}

# Repo-local dev mirrors (optional): only known runtime folder names at repo root — never app/, .git/, etc.
if (-not $SkipRepoLocal) {
  foreach ($dir in @('evidence', 'imports', 'exports', 'backups', 'uploads', 'temp', 'cache', 'logs')) {
    $p = Join-Path $RepoRoot $dir
    if (Test-Path -LiteralPath $p) {
      Remove-TreeIfExists $p "repo-local $dir"
    }
  }
}

Write-Host ''
if ($DryRun) {
  Write-Warn 'Dry run finished (no changes were made).'
} else {
  Write-Ok 'Reset complete. Launch Sentinel to run first-run / onboarding again.'
}
Write-Host ''
