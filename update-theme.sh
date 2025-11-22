#!/bin/bash

# Script to update all remaining page files to light theme
# This applies consistent color transformations across all pages

FILES=(
  "apps/grapplemap-web/app/auth/signup/page.tsx"
  "apps/grapplemap-web/app/auth/error/page.tsx"
  "apps/grapplemap-web/app/auth/signout/page.tsx"
  "apps/grapplemap-web/app/discover/page.tsx"
  "apps/grapplemap-web/app/gym-dashboard/page.tsx"
  "apps/grapplemap-web/app/classes/page.tsx"
  "apps/grapplemap-web/app/bookings/page.tsx"
  "packages/network/src/routes/page.tsx"
  "packages/network/src/routes/members/page.tsx"
  "packages/network/src/routes/checkout/page.tsx"
  "packages/network/src/routes/checkout/success/page.tsx"
  "packages/network/src/routes/checkout/cancelled/page.tsx"
  "packages/network/src/routes/dashboard/page.tsx"
  "packages/network/src/routes/gyms/page.tsx"
  "packages/network/src/routes/signup/gym/page.tsx"
  "packages/network/src/routes/checkin/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    # Background colors
    sed -i 's/bg-slate-950/bg-white/g' "$file"
    sed -i 's/bg-slate-900/bg-neutral-50/g' "$file"
    sed -i 's/bg-slate-800/bg-neutral-100/g' "$file"

    # Text colors
    sed -i 's/text-slate-100/text-neutral-900/g' "$file"
    sed -i 's/text-slate-300/text-neutral-700/g' "$file"
    sed -i 's/text-slate-400/text-neutral-600/g' "$file"
    sed -i 's/text-slate-500/text-neutral-500/g' "$file"
    sed -i 's/text-emerald-200/text-brand-600/g' "$file"
    sed -i 's/text-emerald-300/text-brand-500/g' "$file"
    sed -i 's/text-emerald-400/text-brand-500/g' "$file"
    sed -i 's/text-white/text-neutral-900/g' "$file"
    sed -i 's/text-rose-300/text-error-DEFAULT/g' "$file"

    # Borders
    sed -i 's/border-white\/10/border-neutral-200/g' "$file"
    sed -i 's/border-white\/15/border-neutral-300/g' "$file"
    sed -i 's/border-white\/20/border-neutral-300/g' "$file"
    sed -i 's/border-emerald-400\/60/border-brand-400/g' "$file"
    sed -i 's/border-emerald-400\/30/border-brand-300/g' "$file"

    # Button backgrounds
    sed -i 's/bg-emerald-500/bg-brand-500/g' "$file"
    sed -i 's/bg-emerald-600/bg-brand-600/g' "$file"
    sed -i 's/bg-emerald-400/bg-brand-400/g' "$file"
    sed -i 's/bg-white\/10/bg-neutral-100/g' "$file"
    sed -i 's/bg-white\/5/bg-neutral-50/g' "$file"
    sed -i 's/bg-white\/20/bg-neutral-200/g' "$file"

    # Hover states
    sed -i 's/hover:bg-emerald-400/hover:bg-brand-400/g' "$file"
    sed -i 's/hover:bg-emerald-500/hover:bg-brand-500/g' "$file"
    sed -i 's/hover:bg-emerald-600/hover:bg-brand-600/g' "$file"
    sed -i 's/hover:bg-white\/10/hover:bg-neutral-100/g' "$file"
    sed -i 's/hover:bg-white\/20/hover:bg-neutral-200/g' "$file"

    # Ring/focus colors
    sed -i 's/ring-emerald-400/ring-brand-500/g' "$file"
    sed -i 's/ring-sky-400/ring-brand-400/g' "$file"
    sed -i 's/focus:ring-emerald-400/focus:ring-brand-500/g' "$file"
    sed -i 's/focus:ring-sky-400/focus:ring-brand-400/g' "$file"
    sed -i 's/focus:border-emerald-400/focus:border-brand-500/g' "$file"

    # Placeholder text
    sed -i 's/placeholder:text-slate-500/placeholder:text-neutral-500/g' "$file"

    # Gradient transformations
    sed -i 's/from-emerald-400 via-emerald-500 to-sky-500/from-brand-500 via-brand-600 to-accent-500/g' "$file"
    sed -i 's/from-emerald-500 to-sky-500/from-brand-500 to-accent-500/g' "$file"
    sed -i 's/from-slate-950\/80 via-slate-950\/60 to-emerald-950\/30/from-white via-neutral-50 to-brand-50\/40/g' "$file"

    echo "✓ Updated $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "Theme update complete!"
