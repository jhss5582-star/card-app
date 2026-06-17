export type CardCompany = 'samsung' | 'hyundai' | 'kb' | 'lotte'

export type Category = '카페' | '식비' | '쇼핑' | '교통' | '엔터' | '기타'

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  merchant: string
  amount: number
  category: Category
  cardCompany: CardCompany
}

export interface CardCompanyInfo {
  id: CardCompany
  name: string
  color: string
  logo: string
}
