'use client'

import { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Transaction } from '@/lib/types'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/categories'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  transactions: Transaction[]
}

export default function CategoryDonutChart({ transactions }: Props) {
  const { labels, amounts, colors, total } = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
    }

    const filtered = CATEGORIES.filter((c) => (map.get(c) ?? 0) > 0)
    const amounts = filtered.map((c) => map.get(c) ?? 0)
    const total = amounts.reduce((s, v) => s + v, 0)

    return {
      labels: filtered,
      amounts,
      colors: filtered.map((c) => CATEGORY_COLORS[c]),
      total,
    }
  }, [transactions])

  const data = {
    labels,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { font: { size: 12 }, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) => {
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0'
            return ` ${ctx.label}: ${ctx.parsed.toLocaleString()}원 (${pct}%)`
          },
        },
      },
    },
  }

  if (labels.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-64 text-gray-400 text-sm">
        데이터 없음
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">카테고리별 지출</h2>
      <p className="text-sm text-gray-400 mb-4">
        합계 <span className="font-semibold text-gray-700">{total.toLocaleString()}원</span>
      </p>
      <Doughnut data={data} options={options} />
    </div>
  )
}
