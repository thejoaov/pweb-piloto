import * as React from 'react'
import {
  cn,
  cpfFormat,
  creditCardFormat,
  currencyToFloat,
  currencyFormat as defaultCurrencyFormat,
  expiryFormat,
} from '~/lib/utils'

type InputType =
  | React.HTMLInputTypeAttribute
  | 'currency'
  | 'credit-card'
  | 'expiry'
  | 'cpf'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  currencyFormat?: Intl.NumberFormat
  type?: InputType
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      currencyFormat,
      onChange,
      onFocus,
      value,
      ...props
    },
    ref,
  ) => {
    const isCurrency = type === 'currency'
    const isCreditCard = type === 'credit-card'
    const isExpiry = type === 'expiry'
    const isCpf = type === 'cpf'
    const inputType = [isCpf, isExpiry, isCreditCard, isCurrency].some(Boolean)
      ? 'text'
      : type

    const formatCurrency = React.useCallback(
      (value: number) => {
        return (currencyFormat ?? defaultCurrencyFormat).format(value)
      },
      [currencyFormat],
    )

    const formatCreditCard = React.useCallback((value: number) => {
      return creditCardFormat.format(value)
    }, [])

    const formatExpiry = React.useCallback((value: string) => {
      return expiryFormat.format(value)
    }, [])

    const formatCpf = React.useCallback((value: string) => {
      return cpfFormat.format(value)
    }, [])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const target = e.currentTarget
        target.setSelectionRange(target.value.length, target.value.length)
      }
      onFocus?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const target = e.currentTarget
        const numericValue = Number(target.value.replace(/\D/g, '')) / 100
        target.value = formatCurrency(numericValue)
      }

      if (isCreditCard) {
        const target = e.currentTarget

        const numericValue = Number(target.value.replace(/\D/g, ''))
        target.value = formatCreditCard(numericValue)
      }

      if (isExpiry) {
        const target = e.currentTarget

        target.value = formatExpiry(target.value)
      }

      if (isCpf) {
        const target = e.currentTarget

        target.value = formatCpf(target.value)
      }

      onChange?.(e)
    }

    const defaultValue = React.useMemo(() => {
      if (isCurrency) {
        return formatCurrency(currencyToFloat(value?.toString() ?? '0'))
      }

      if (isCreditCard) {
        return creditCardFormat.format(Number(value?.toString() ?? ''))
      }

      if (isExpiry) {
        return expiryFormat.format(value?.toString() ?? '')
      }

      if (isCpf) {
        return cpfFormat.format(value?.toString() ?? '')
      }

      return value
    }, [value, isCurrency, isCreditCard, isExpiry, isCpf, formatCurrency])

    return (
      <input
        type={inputType}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base',
          'shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        maxLength={isCurrency ? 22 : undefined}
        onFocus={handleFocus}
        defaultValue={defaultValue}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
