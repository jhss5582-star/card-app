'use client'

import { useMemo } from 'react'
import { Transaction } from '@/lib/types'

interface Props {
  transactions: Transaction[]
}

export default function SummaryCards({ transactions }: Props) {
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })()

    const thisMonthTotal = transactions
      .filter((t) => t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0)
    const lastMonthTotal = transactions
      .filter((t) => t.date.startsWith(lastMonth))
      .reduce((s, t) => s + t.amount, 0)
    const diff = thisMonthTotal - lastMonthTotal
    const diffPct = lastMonthTotal > 0 ? ((diff / lastMonthTotal) * 100).toFixed(1) : null

    const avgMonthly = (() => {
      const months = new Set(transactions.map((t) => t.date.slice(0, 7)))
      if (months.size === 0) return 0
      const total = transactions.reduce((s, t) => s + t.amount, 0)
      return Math.round(total / months.size)
    })()

    return { thisMonthTotal, lastMonthTotal, diff, diffPct, avgMonthly }
  }, [transactions])

  const cards = [
    {
      label: '이번 달 지출',
      value: `${stats.thisMonthTotal.toLocaleString()}원`,
      sub:
        stats.diffPct !== null
          ? `전월 대비 ${stats.diff >= 0 ? '+' : ''}${Number(stats.diffPct)}%`
          : '—',
      subColor: stats.diff >= 0 ? 'text-red-500' : 'text-emerald-500',
      bg: 'from-blue-500 to-blue-600',
    },
    {
      label: '지난 달 지출',
      value: `${stats.lastMonthTotal.toLocaleString()}원`,
      sub: '',
      subColor: '',
      bg: 'from-purple-500 to-purple-600',
    },
    {
      label: '월 평균 지출',
      value: `${stats.avgMonthly.toLocaleString()}원`,
      sub: '최근 6개월',
      subColor: 'text-white/70',
      bg: 'from-emerald-500 to-emerald-600',
    },
    {
      label: '총 거래 건수',
      value: `${transactions.length}건`,
      sub: '',
      subColor: '',
      bg: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`bg-gradient-to-br ${c.bg} rounded-2xl p-5 text-white shadow-sm`}
        >
          <p className="text-sm font-medium text-white/80">{c.label}</p>
          <p className="mt-1 text-2xl font-bold">{c.value}</p>
          {c.sub && <p className={`mt-1 text-sm ${c.subColor}`}>{c.sub}</p>}
        </div>
      ))}
    </div>
  )
}
