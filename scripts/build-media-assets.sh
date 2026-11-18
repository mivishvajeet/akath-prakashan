#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AISTUDIO_DIR="$ROOT_DIR/public/assets/aistudio"
AKATH_DIR="$ROOT_DIR/public/assets/akath"

mkdir -p "$AKATH_DIR"

echo "=== 1. Generating Responsive AVIF, WebP, and Optimized JPEG Variants ==="

generate_cover_variants() {
  local src_file="$1"
  local base_prefix="$2"

  echo "Optimizing cover: $src_file -> $base_prefix"

  convert "$src_file" -strip -resize "960x>" -quality 82 "${base_prefix}.webp"
  convert "$src_file" -strip -resize "960x>" -quality 68 "${base_prefix}.avif"

  for w in 320 640 960; do
    convert "$src_file" -strip -resize "${w}x>" -quality 82 "${base_prefix}-${w}w.jpg"
    convert "$src_file" -strip -resize "${w}x>" -quality 80 "${base_prefix}-${w}w.webp"
    convert "$src_file" -strip -resize "${w}x>" -quality 65 "${base_prefix}-${w}w.avif"
  done
}

generate_cover_variants "$AISTUDIO_DIR/scholar-juice-cover.jpg" "$AISTUDIO_DIR/scholar-juice-cover"
generate_cover_variants "$AISTUDIO_DIR/book2_b40a45e1.jpeg" "$AISTUDIO_DIR/book2_b40a45e1"
generate_cover_variants "$AISTUDIO_DIR/lokshahi-cover.jpg" "$AISTUDIO_DIR/lokshahi-cover"

echo "Optimizing scholar-juice-spread.jpg..."
convert "$AISTUDIO_DIR/scholar-juice-spread.jpg" -strip -resize "1280x>" -quality 82 "$AISTUDIO_DIR/scholar-juice-spread.webp"
convert "$AISTUDIO_DIR/scholar-juice-spread.jpg" -strip -resize "1280x>" -quality 68 "$AISTUDIO_DIR/scholar-juice-spread.avif"
for w in 640 960 1280; do
  convert "$AISTUDIO_DIR/scholar-juice-spread.jpg" -strip -resize "${w}x>" -quality 80 "$AISTUDIO_DIR/scholar-juice-spread-${w}w.webp"
  convert "$AISTUDIO_DIR/scholar-juice-spread.jpg" -strip -resize "${w}x>" -quality 65 "$AISTUDIO_DIR/scholar-juice-spread-${w}w.avif"
done

echo "Optimizing ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.png..."
convert "$AISTUDIO_DIR/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.png" -strip -resize "1280x>" -quality 82 "$AISTUDIO_DIR/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.webp"
convert "$AISTUDIO_DIR/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.png" -strip -resize "1280x>" -quality 68 "$AISTUDIO_DIR/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.avif"

echo "Optimizing akath-logo.png..."
convert "$AKATH_DIR/akath-logo.png" -strip -resize "512x512>" -quality 85 "$AKATH_DIR/akath-logo.webp"
convert "$AKATH_DIR/akath-logo.png" -strip -resize "512x512>" -quality 72 "$AKATH_DIR/akath-logo.avif"
convert "$AKATH_DIR/akath-logo.png" -strip -resize "256x256>" -quality 85 "$AKATH_DIR/akath-logo-256w.webp"
convert "$AKATH_DIR/akath-logo.png" -strip -resize "256x256>" -quality 72 "$AKATH_DIR/akath-logo-256w.avif"

echo "=== 2. Rendering 360-Frame 3D Motion-Picture Brand Film (16:9 & 9:16) ==="
node "$ROOT_DIR/scripts/render-cinematic-brand-film.mjs"

echo "=== Media Asset Build Complete ==="
ls -lh "$AISTUDIO_DIR" "$AKATH_DIR"
