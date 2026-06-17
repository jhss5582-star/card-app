'use client'

import { CardCompany } from '@/lib/types'
import { getCardCompany } from '@/lib/cardCompanies'

interface Props {
  company: CardCompany
  size?: 'sm' | 'md'
}

export default function CardCompanyBadge({ company, size = 'sm' }: Props) {
  const info = getCardCompany(company)
  const sz = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white ${sz}`}
      style={{ backgroundColor: info.color }}
      title={info.name}
    >
      {info.logo}
    </span>
  )
}
