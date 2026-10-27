#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Pages build output: publish only the current site, never archive/docs.
rm -rf dist
mkdir -p dist
cp index.html dist/index.html
cp manifest.webmanifest dist/manifest.webmanifest
mkdir -p dist/assets
cp assets/mimu-icon.png dist/assets/mimu-icon.png

echo "Cloudflare Pages output prepared in dist/"
