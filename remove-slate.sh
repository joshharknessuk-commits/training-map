#!/bin/bash

# Remove all slate color references and replace with neutral equivalents

echo "Removing slate colors and replacing with neutral/blue scheme..."

# Find all TypeScript/TSX files
FILES=$(find apps/grapplemap-web packages/network/src packages/ui/src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*")

for file in $FILES; do
  # Replace slate text colors with neutral equivalents
  sed -i 's/text-slate-900/text-white/g' "$file"
  sed -i 's/text-slate-800/text-white/g' "$file"
  sed -i 's/text-slate-600/text-neutral-700/g' "$file"
  sed -i 's/text-slate-500/text-neutral-600/g' "$file"
  sed -i 's/text-slate-400/text-neutral-600/g' "$file"
  sed -i 's/text-slate-300/text-neutral-800/g' "$file"
  sed -i 's/text-slate-200/text-neutral-900/g' "$file"
  sed -i 's/text-slate-100/text-neutral-950/g' "$file"

  # Replace slate backgrounds
  sed -i 's/bg-slate-950/bg-neutral-900/g' "$file"
  sed -i 's/bg-slate-900/bg-neutral-800/g' "$file"
  sed -i 's/bg-slate-800/bg-neutral-700/g' "$file"

  # Replace slate borders
  sed -i 's/border-slate-/border-neutral-/g' "$file"

  # Replace placeholder slate
  sed -i 's/placeholder:text-slate-500/placeholder:text-neutral-500/g' "$file"

  # Replace slate in shadows
  sed -i 's/shadow-slate-/shadow-neutral-/g' "$file"
done

echo "✓ Slate colors removed and replaced!"
