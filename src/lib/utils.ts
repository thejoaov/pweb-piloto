import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-br', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
}

export function currencyToFloat(currency: string) {
  const number = Number.parseFloat(
    currency
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, ''),
  )

  return number
}

export function capitalize(text: string) {
  // Capitalize all words in a string
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const currencyFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const creditCardFormat = {
  format: (value: number) => {
    return value
      .toString()
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  },
}

export const expiryFormat = {
  format: (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2')
  },
}

export const cpfFormat = {
  format: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },
}
