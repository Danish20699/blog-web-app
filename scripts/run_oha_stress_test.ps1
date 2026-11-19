# ==============================================================================
# ITERATION 6: STRESS TESTING WITH OHA (HTTP LOAD GENERATOR)
# ==============================================================================
# Prerequisites:
#   Install oha via winget or cargo:
#     winget install hatoo.oha
#     OR
#     cargo install oha
# ==============================================================================

param(
    [string]$TargetUrl = "http://localhost:8080/api/blogs?limit=20",
    [int]$Connections = 50,
    [int]$Requests = 5000,
    [string]$Duration = "10s"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DEVSPACE BLOG APP - STRESS TESTING BENCHMARK (OHA)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target URL  : $TargetUrl" -ForegroundColor Yellow
Write-Host "Concurrency : $Connections concurrent workers" -ForegroundColor Yellow
Write-Host "Duration    : $Duration (or $Requests requests)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if oha is installed
if (-not (Get-Command oha -ErrorAction SilentlyContinue)) {
    Write-Host "[!] 'oha' is not found in PATH." -ForegroundColor Red
    Write-Host "[i] You can install it on Windows using:" -ForegroundColor Yellow
    Write-Host "      winget install hatoo.oha" -ForegroundColor White
    Write-Host "    Or download the binary from: https://github.com/hatoo/oha/releases" -ForegroundColor White
    exit 1
}

Write-Host "`n>>> Running stress test against NGINX Gateway / Backend..." -ForegroundColor Green
oha -z $Duration -c $Connections $TargetUrl

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Benchmarking Complete! Review latency percentiles above." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
