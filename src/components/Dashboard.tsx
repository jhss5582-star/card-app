'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@/lib/types'
import CsvUploader from './CsvUploader'
import SummaryCards from './SummaryCards'
import MonthlyBarChart from './MonthlyBarChart'
import CategoryDonutChart from './CategoryDonutChart'
import TransactionList from './TransactionList'

const STORAGE_KEY = 'card-transactions-v1'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTransactions(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  function addTransactions(newTxns: Transaction[]) {
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.id))
      const fresh = newTxns.filter((t) => !existingIds.has(t.id))
      const merged = [...prev, ...fresh].sort((a, b) => b.date.localeCompare(a.date))
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)) } catch {}
      return merged
    })
  }

  function clearAll() {
    if (!confirm('모든 거래 내역을 삭제하시겠습니까?')) return
    setTransactions([])
    localStorage.removeItem(STORAGE_KEY)
  }

  // SSR 하이드레이션 전에는 렌더링 스킵 (localStorage 불일치 방지)
  if (!hydrated) return null

  return (
    <div className="flex flex-col gap-6">
      <CsvUploader onParsed={addTransactions} />

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <span className="text-6xl mb-4">💳</span>
          <p className="text-lg font-medium text-gray-500">카드사 내역 파일을 업로드하세요</p>
          <p className="text-sm mt-1">CSV 또는 엑셀 파일을 드래그하거나 클릭하여 선택</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">전체 {transactions.length}건</p>
            <button
              onClick={clearAll}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              전체 삭제
            </button>
          </div>

          <SummaryCards transactions={transactions} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MonthlyBarChart transactions={transactions} />
            <CategoryDonutChart transactions={transactions} />
          </div>

          <TransactionList transactions={transactions} />
        </>
      )}
    </div>
  )
}
