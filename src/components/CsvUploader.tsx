'use client'

import { useState, useRef, DragEvent } from 'react'
import { parseFile } from '@/lib/csvParsers'
import { Transaction, CardCompany } from '@/lib/types'
import { CARD_COMPANIES } from '@/lib/cardCompanies'

interface Props {
  onParsed: (transactions: Transaction[]) => void
}

type Status = { type: 'success' | 'error'; msg: string }

export default function CsvUploader({ onParsed }: Props) {
  const [company, setCompany] = useState<CardCompany>('kb')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setStatus({ type: 'error', msg: 'CSV 또는 엑셀 파일(.xlsx, .xls, .csv)만 지원합니다.' })
      return
    }

    setProcessing(true)
    setStatus(null)
    try {
      const result = await parseFile(file, company)
      onParsed(result.transactions)
      const name = CARD_COMPANIES.find((c) => c.id === company)?.name ?? company
      setStatus({
        type: 'success',
        msg: `${name}: ${result.transactions.length}건 추가됨${result.skipped > 0 ? ` (${result.skipped}건 건너뜀)` : ''}`,
      })
    } catch (e) {
      setStatus({ type: 'error', msg: e instanceof Error ? e.message : String(e) })
    } finally {
      setProcessing(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">카드 내역 불러오기</h2>

      {/* 카드사 선택 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {CARD_COMPANIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCompany(c.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              company === c.id
                ? 'border-transparent text-white shadow-sm'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
            style={company === c.id ? { backgroundColor: c.color === '#FFBC00' ? '#f59e0b' : c.color } : {}}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: c.color === '#FFBC00' ? '#f59e0b' : c.color }}
            >
              {c.logo}
            </span>
            {c.name}
          </button>
        ))}
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        } ${processing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={onInputChange}
        />
        <p className="text-4xl mb-3">{processing ? '⏳' : '📂'}</p>
        <p className="text-sm font-medium text-gray-700">
          {processing
            ? '파일 파싱 중...'
            : 'CSV 또는 엑셀 파일을 드래그하거나 클릭하여 업로드'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {CARD_COMPANIES.find((c) => c.id === company)?.name} 형식으로 파싱합니다
        </p>
      </div>

      {/* 결과 메시지 */}
      {status && (
        <div
          className={`mt-3 px-4 py-2.5 rounded-lg text-sm ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.type === 'success' ? '✓ ' : '✗ '}
          {status.msg}
        </div>
      )}

      {/* 다운로드 방법 안내 */}
      <details className="mt-4">
        <summary className="text-xs text-gray-400 cursor-pointer select-none hover:text-gray-600">
          카드사별 파일 내보내기 방법 ▾
        </summary>
        <ul className="mt-2 text-xs text-gray-500 space-y-1 pl-3 leading-relaxed">
          <li>• KB국민카드: KB Pay 앱 → 이용내역 → 우측 상단 내보내기 → 엑셀 다운로드</li>
          <li>• 현대카드: 현대카드 앱 → 이용내역 → 기간 선택 → 파일 저장</li>
          <li>• 롯데카드: 롯데카드 앱 → 이용내역 → 엑셀 다운로드</li>
          <li>• 삼성카드: 삼성카드 홈페이지 → 이용내역 → 엑셀 저장</li>
        </ul>
      </details>
    </div>
  )
}
