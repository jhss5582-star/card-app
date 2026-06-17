'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { Transaction } from '@/lib/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  transactions: Transaction[]
}

export default function MonthlyBarChart({ transactions }: Props) {
  const { labels, barData, trendData } = useMemo(() => {
    const monthMap = new Map<string, number>()

    for (const t of transactions) {
      const month = t.date.slice(0, 7)
      monthMap.set(month, (monthMap.get(month) ?? 0) + t.amount)
    }

    const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b))
    const labels = sorted.map(([m]) => {
      const [y, mo] = m.split('-')
      return `${y}.${mo}`
    })
    const barData = sorted.map(([, v]) => Math.round(v / 1000))

    // 3개월 이동평균 추세선
    const trendData = barData.map((_, i) => {
      const slice = barData.slice(Math.max(0, i - 2), i + 1)
      return Math.round(slice.reduce((s, v) => s + v, 0) / slice.length)
    })

    return { labels, barData, trendData }
  }, [transactions])

  const data = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: '월 지출 (천원)',
        data: barData,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
        order: 2,
      },
      {
        type: 'line' as const,
        label: '추세 (3개월 이동평균)',
        data: trendData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4,
        fill: false,
        order: 1,
      },
    ],
  }

  const options: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()}천원`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `${v}천`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
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
      <h2 className="text-lg font-semibold text-gray-800 mb-4">월별 지출</h2>
      <Chart type="bar" data={data} options={options} />
    </div>
  )
}
