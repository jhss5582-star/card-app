import { Category } from './types'

export const CATEGORY_KEYWORDS: Record<Exclude<Category, '기타'>, string[]> = {
  카페: ['스타벅스', '투썸', '이디야', '메가커피', '커피빈', '파스쿠찌'],
  식비: ['맥도날드', '버거킹', '배달의민족', '요기요', '롯데리아', 'KFC', '서브웨이'],
  쇼핑: ['쿠팡', '올리브영', '무신사', 'GS25', 'CU', '세븐일레븐', '이마트', '홈플러스'],
  교통: ['지하철', '카카오T', '티머니', 'T머니', 'KTX', '고속버스'],
  엔터: ['넷플릭스', 'CGV', '멜론', '롯데시네마', '메가박스', '유튜브', '스포티파이'],
}

export const CATEGORY_COLORS: Record<Category, string> = {
  카페: '#f59e0b',
  식비: '#ef4444',
  쇼핑: '#8b5cf6',
  교통: '#3b82f6',
  엔터: '#10b981',
  기타: '#6b7280',
}

export const CATEGORIES: Category[] = ['카페', '식비', '쇼핑', '교통', '엔터', '기타']

export function classifyTransaction(merchant: string): Category {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => merchant.includes(kw))) {
      return category as Category
    }
  }
  return '기타'
}
