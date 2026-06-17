'use client'

import { Category } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/categories'

interface Props {
  category: Category
}

export default function CategoryBadge({ category }: Props) {
  const color = CATEGORY_COLORS[category]

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {category}
    </span>
  )
}
