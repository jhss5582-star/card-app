import * as XLSX from 'xlsx'
import { Transaction, CardCompany } from './types'
import { classifyTransaction } from './categories'

export interface ParseResult {
  transactions: Transaction[]
  skipped: number
}

// ──────────────────────────────────────────────
// File → 2D string array
// ──────────────────────────────────────────────

async function fileToRows(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return excelToRows(file)
  }
  return csvToRows(file)
}

async function excelToRows(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellText: true, cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: false,
    dateNF: 'YYYY-MM-DD',
  })
  return (raw as string[][]).map((row) => row.map((cell) => String(cell ?? '').trim()))
}

async function csvToRows(file: File): Promise<string[][]> {
  // Try UTF-8; if no Korean found, try EUC-KR
  let text = await file.text()
  if (!/[가-힣]/.test(text)) {
    try {
      const buf = await file.arrayBuffer()
      text = new TextDecoder('euc-kr').decode(buf)
    } catch {}
  }
  text = text.replace(/^﻿/, '') // strip BOM
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map(parseCsvLine)
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuote = false
  for (const ch of line) {
    if (ch === '"') inQuote = !inQuote
    else if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = '' }
    else cur += ch
  }
  result.push(cur.trim())
  return result
}

// ──────────────────────────────────────────────
// Column detection
// ──────────────────────────────────────────────

const DATE_HINTS = ['이용일', '거래일', '승인일', '일자', '날짜']
// 청구금액·할부 제외, 국내이용금액 우선
const AMOUNT_HINTS = ['국내이용금액', '이용금액', '거래금액', '결제금액', '승인금액']
const MERCHANT_HINTS = ['가맹점명', '이용가맹점', '이용처', '상호', '거래처', '가맹점']

function findCol(headers: string[], hints: string[]): number {
  const norm = headers.map((h) => h.replace(/\s|\(.*?\)/g, ''))
  for (const h of hints) {
    const i = norm.findIndex((n) => n === h)
    if (i >= 0) return i
  }
  for (const h of hints) {
    const i = norm.findIndex((n) => n.includes(h))
    if (i >= 0) return i
  }
  return -1
}

// ──────────────────────────────────────────────
// Normalization helpers
// ──────────────────────────────────────────────

function normalizeDate(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
  }
  return ''
}

function normalizeAmount(raw: string): number {
  return parseInt(raw.replace(/[,\s원]/g, ''), 10) || 0
}

// ──────────────────────────────────────────────
// Per-card-company header skip rules
// (some exports have metadata rows before the real header)
// ──────────────────────────────────────────────

const SKIP_ROWS: Record<CardCompany, number> = {
  kb: 0,
  hyundai: 0, // 현대카드는 파일마다 다름 — 자동 탐색으로 처리
  lotte: 0,
  samsung: 0,
}

// ──────────────────────────────────────────────
// Main parser
// ──────────────────────────────────────────────

export async function parseFile(
  file: File,
  company: CardCompany
): Promise<ParseResult> {
  const rows = await fileToRows(file)

  // Find header row: first row that has a date-like and merchant-like column
  let headerIdx = -1
  for (let i = SKIP_ROWS[company]; i < Math.min(rows.length, 20); i++) {
    const r = rows[i]
    const hasDate = DATE_HINTS.some((h) => r.some((c) => c.includes(h)))
    const hasMerchant = MERCHANT_HINTS.some((h) => r.some((c) => c.includes(h)))
    if (hasDate && hasMerchant) { headerIdx = i; break }
  }

  if (headerIdx < 0) {
    throw new Error(
      '헤더 행을 찾지 못했습니다. 파일 형식을 확인하거나 카드사를 올바르게 선택해 주세요.'
    )
  }

  const headers = rows[headerIdx]
  const dateCol = findCol(headers, DATE_HINTS)
  const merchantCol = findCol(headers, MERCHANT_HINTS)
  const amountCol = findCol(headers, AMOUNT_HINTS)

  if (dateCol < 0 || merchantCol < 0 || amountCol < 0) {
    throw new Error(
      `열을 찾지 못했습니다. (날짜:${dateCol}, 가맹점:${merchantCol}, 금액:${amountCol})`
    )
  }

  const transactions: Transaction[] = []
  let skipped = 0

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    const maxIdx = Math.max(dateCol, merchantCol, amountCol)
    if (row.length <= maxIdx) { skipped++; continue }

    const dateRaw = row[dateCol]
    const merchant = row[merchantCol]?.trim()
    const amountRaw = row[amountCol]

    if (!dateRaw || !merchant) { skipped++; continue }

    const date = normalizeDate(dateRaw)
    if (!date) { skipped++; continue }

    const amount = normalizeAmount(amountRaw)
    // 취소/환불(음수 또는 0)은 제외
    if (amount <= 0) { skipped++; continue }

    transactions.push({
      id: `${company}-${i}-${date}-${amount}-${merchant.slice(0, 4)}`,
      date,
      merchant,
      amount,
      category: classifyTransaction(merchant),
      cardCompany: company,
    })
  }

  if (transactions.length === 0) {
    throw new Error(
      '유효한 거래 내역이 없습니다. 취소/환불 건만 있거나 파일이 비어 있을 수 있습니다.'
    )
  }

  return { transactions, skipped }
}
