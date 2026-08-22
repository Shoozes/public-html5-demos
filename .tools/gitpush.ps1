#Requires -Version 7.0

[CmdletBinding()]
param(
    [string]$Remote = 'origin',
    [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $repoRoot) {
    throw 'This script must run inside a Git repository.'
}

Push-Location $repoRoot
try {
    $currentBranch = (git branch --show-current).Trim()
    if ($currentBranch -ne $Branch) {
        throw "Refusing to push branch '$currentBranch'; expected '$Branch'."
    }

    $dirty = git status --porcelain
    if ($dirty) {
        throw 'Refusing to push with uncommitted changes.'
    }

    git fetch $Remote $Branch --prune
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $distance = (git rev-list --left-right --count "$Remote/$Branch...$Branch").Trim().Split()
    $behind = [int]$distance[0]
    if ($behind -gt 0) {
        throw "Refusing to push because '$Branch' is behind '$Remote/$Branch'."
    }

    git push $Remote "$Branch`:$Branch"
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
