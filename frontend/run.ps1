# Shortcut script to execute root run_all_win11.ps1
$RootDir = Resolve-Path "$PSScriptRoot\.."
Set-Location $RootDir
& "$RootDir\run_all_win11.ps1"
