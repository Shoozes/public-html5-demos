#Requires -Version 7.0

[CmdletBinding()]
param(
    [string]$Remote = 'origin',
    [string]$Branch = 'main'
)

$helper = Join-Path $PSScriptRoot '.tools\gitpush.ps1'
if (-not (Test-Path -LiteralPath $helper -PathType Leaf)) {
    throw "Guarded push helper not found: $helper"
}

& $helper @PSBoundParameters
exit $LASTEXITCODE
