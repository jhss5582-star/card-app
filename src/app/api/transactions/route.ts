import { NextResponse } from 'next/server'

// 거래 내역은 클라이언트에서 CSV/엑셀 파싱으로 처리됩니다.
export async function GET() {
  return NextResponse.json({ message: 'Use client-side CSV upload' }, { status: 410 })
}
