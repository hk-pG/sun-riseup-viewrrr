$today = Get-Date -Format "yyyy-MM-dd"

$template = "./template.md"

$newFileName = "$today.md"

if (Test-Path $newFileName) {
    Write-Host "File $newFileName already exists. Please choose a different date or delete the existing file."
}
else {
    if (Test-Path $template) {
        Copy-Item $template $newFileName
        Write-Host "New memo created: $newFileName"
    }
    else {
        Write-Host "Template file not found: $template"
    }
}
