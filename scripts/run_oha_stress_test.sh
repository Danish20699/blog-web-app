#!/usr/bin/env bash
# ==============================================================================
# ITERATION 6: STRESS TESTING WITH OHA (HTTP LOAD GENERATOR)
# ==============================================================================

TARGET_URL="${1:-http://localhost:8080/api/blogs?limit=20}"
CONCURRENCY="${2:-50}"
DURATION="${3:-10s}"

echo "=========================================================="
echo "   DEVSPACE BLOG APP - STRESS TESTING BENCHMARK (OHA)    "
echo "=========================================================="
echo "Target URL  : $TARGET_URL"
echo "Concurrency : $CONCURRENCY concurrent workers"
echo "Duration    : $DURATION"
echo "=========================================================="

if ! command -v oha &> /dev/null; then
    echo "[!] 'oha' is not installed."
    echo "[i] Install with: cargo install oha OR brew install oha"
    exit 1
fi

echo ">>> Running stress test against NGINX Gateway / Backend..."
oha -z "$DURATION" -c "$CONCURRENCY" "$TARGET_URL"

echo "=========================================================="
echo "Benchmarking Complete!"
echo "=========================================================="
