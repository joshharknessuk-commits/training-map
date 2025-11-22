#!/bin/bash

# Script to improve card readability by making text darker
# This applies stronger contrast across all pages and components

echo "Improving card readability across all files..."

# Find all TypeScript/TSX files in app, packages/network, and components
FILES=$(find apps/grapplemap-web packages/network/src packages/ui/src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*")

for file in $FILES; do
  # Text color improvements
  sed -i 's/text-neutral-700\([^0-9]\)/text-neutral-800\1/g' "$file"
  sed -i 's/text-neutral-600\([^0-9]\)/text-neutral-700\1/g' "$file"
  sed -i 's/text-neutral-500\([^0-9]\)/text-neutral-600\1/g' "$file"
  sed -i 's/text-neutral-400\([^0-9]\)/text-neutral-500\1/g' "$file"

  # Brand colors - make more vibrant
  sed -i 's/text-brand-600\([^0-9]\)/text-brand-700\1/g' "$file"
  sed -i 's/text-brand-500\([^0-9]\)/text-brand-600\1/g' "$file"

  # Card backgrounds - simplify to pure white
  sed -i 's/bg-gradient-to-br from-neutral-50 via-white to-brand-50\/30/bg-white/g' "$file"
  sed -i 's/bg-gradient-to-br from-white via-neutral-50 to-brand-50\/30/bg-white/g' "$file"
  sed -i 's/bg-gradient-to-b from-white via-neutral-50 to-brand-50\/40/bg-white/g' "$file"

  # Strengthen borders
  sed -i 's/border border-neutral-200\([^0-9]\)/border-2 border-neutral-200\1/g' "$file"
done

echo "✓ Readability improvements complete!"
