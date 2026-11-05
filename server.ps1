# VoxGesture Local High-Performance HTTP Server
# Runs using native Windows PowerShell .NET HttpListener (zero external runtime required)

$port = 8001
$baseDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener.Prefixes.Clear()
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚑 VoxGesture Emergency Triage Bridge is live at: $prefix" -ForegroundColor Green
Write-Host "   Serving directory: $baseDir" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Open default browser
Start-Process $prefix

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".md"   = "text/plain; charset=utf-8"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        # Prevent path traversal
        $safePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($baseDir, $urlPath))
        if (-not $safePath.StartsWith($baseDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path $safePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($safePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($safePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentType = "text/plain"
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
