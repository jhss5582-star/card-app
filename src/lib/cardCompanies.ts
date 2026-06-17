import { CardCompany, CardCompanyInfo } from './types'

export const CARD_COMPANIES: CardCompanyInfo[] = [
  { id: 'kb', name: 'KB국민카드', color: '#FFBC00', logo: 'KB' },
  { id: 'hyundai', name: '현대카드', color: '#000000', logo: '현' },
  { id: 'lotte', name: '롯데카드', color: '#ED1C24', logo: '롯' },
  { id: 'samsung', name: '삼성카드', color: '#1428A0', logo: '삼' },
]

export function getCardCompany(id: CardCompany): CardCompanyInfo {
  return CARD_COMPANIES.find((c) => c.id === id) ?? CARD_COMPANIES[0]
}
