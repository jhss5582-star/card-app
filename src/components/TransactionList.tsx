'use client'

import { useState, useMemo } from 'react'
import { Transaction, Category, CardCompany } from '@/lib/types'
import { CATEGORIES } from '@/lib/categories'
import { CARD_COMPANIES } from '@/lib/cardCompanies'
import CategoryBadge from './CategoryBadge'
import CardCompanyBadge from './CardCompanyBadge'

interface Props {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [companyFilter, setCompanyFilter] = useState<CardCompany | 'all'>('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (companyFilter !== 'all' && t.cardCompany !== companyFilter) return false
      return true
    })
  }, [transactions, categoryFilter, companyFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalAmount = filtered.reduce((s, t) => s + t.amount, 0)

  function handleFilterChange() {
    setPage(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* 필터 */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center">
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as Category | 'all')
            handleFilterChange()
          }}
        >
          <option value="all">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={companyFilter}
          onChange={(e) => {
            setCompanyFilter(e.target.value as CardCompany | 'all')
            handleFilterChange()
          }}
        >
          <option value="all">전체 카드사</option>
          {CARD_COMPANIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-gray-500">
          {filtered.length}건 &middot; 합계{' '}
          <span className="font-semibold text-gray-800">
            {totalAmount.toLocaleString()}원
          </span>
        </span>
      </div>

      {/* 목록 */}
      <div className="divide-y divide-gray-50">
        {paged.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">내역이 없습니다</div>
        ) : (
          paged.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <CardCompanyBadge company={t.cardCompany} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{t.merchant}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
              <CategoryBadge category={t.category} />
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {t.amount.toLocaleString()}원
              </span>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            이전
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1 text-sm rounded-lg border ${
                  page === n
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            )
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
