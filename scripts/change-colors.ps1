# Script to change pink/rose colors to violet/purple throughout the app

$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.jsx,*.js,*.css

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Replace pink with violet
    $content = $content -replace 'pink-50', 'violet-50'
    $content = $content -replace 'pink-100', 'violet-100'
    $content = $content -replace 'pink-200', 'violet-200'
    $content = $content -replace 'pink-300', 'violet-300'
    $content = $content -replace 'pink-400', 'violet-400'
    $content = $content -replace 'pink-500', 'violet-500'
    $content = $content -replace 'pink-600', 'violet-600'
    $content = $content -replace 'pink-700', 'violet-700'
    $content = $content -replace 'pink-800', 'violet-800'
    $content = $content -replace 'pink-900', 'violet-900'
    
    # Replace rose with purple
    $content = $content -replace 'rose-50', 'purple-50'
    $content = $content -replace 'rose-100', 'purple-100'
    $content = $content -replace 'rose-200', 'purple-200'
    $content = $content -replace 'rose-300', 'purple-300'
    $content = $content -replace 'rose-400', 'purple-400'
    $content = $content -replace 'rose-500', 'purple-500'
    $content = $content -replace 'rose-600', 'purple-600'
    $content = $content -replace 'rose-700', 'purple-700'
    $content = $content -replace 'rose-800', 'purple-800'
    $content = $content -replace 'rose-900', 'purple-900'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nColor replacement complete!"
