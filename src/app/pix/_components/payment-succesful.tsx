'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { formatCurrency } from '~/lib/utils'

interface CheckmarkProps {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: 'spring',
        duration: 1.5,
        bounce: 0.2,
        ease: 'easeInOut',
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
}

export function Checkmark({
  size = 100,
  strokeWidth = 2,
  color = 'currentColor',
  className = '',
}: CheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: 'round',
          fill: 'transparent',
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'transparent',
        }}
      />
    </motion.svg>
  )
}

export type PaymentSucessProps = {
  amount: number
  transactionId: string
}

const DEFAULT_TIMEOUT = 5
const DEFAULT_TIMEOUT_MS = DEFAULT_TIMEOUT * 1000

export function PaymentSucess({ amount, transactionId }: PaymentSucessProps) {
  const [closeTimeout, setCloseTimeout] = useState<number>(DEFAULT_TIMEOUT)

  useEffect(() => {
    document.title = 'Pagamento efetuado com sucesso'
  }, [])

  useEffect(() => {
    // Close in 10 seconds
    const timeout = setTimeout(() => {
      window.close()
    }, DEFAULT_TIMEOUT_MS)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    // Timer to show
    const timer = setInterval(() => {
      setCloseTimeout((prev) => prev - 1)
    }, DEFAULT_TIMEOUT_MS)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Card className="w-full max-w-sm mx-auto p-6 min-h-[300px] flex flex-col justify-center bg-zinc-900 dark:bg-white border-zinc-800 dark:border-zinc-200 backdrop-blur-sm">
      <CardContent className="space-y-4 flex flex-col items-center justify-center">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            scale: {
              type: 'spring',
              damping: 15,
              stiffness: 200,
            },
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 blur-xl bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: 'easeOut',
              }}
            />
            <Checkmark
              size={80}
              strokeWidth={4}
              color="rgb(16 185 129)"
              className="relative z-10 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            />
          </div>
        </motion.div>
        <motion.div
          className="space-y-2 text-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.h2
            className="text-lg text-zinc-100 dark:text-zinc-900 tracking-tighter font-semibold uppercase"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            Pagamento efetuado com sucesso
          </motion.h2>
          <div className="flex items-center gap-4">
            <motion.div
              className="flex-1 bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-3 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.2,
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="flex flex-col items-start gap-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 group transition-all">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white shadow-lg border border-zinc-700 dark:border-zinc-300 text-sm font-medium text-zinc-100 dark:text-zinc-900 group-hover:scale-105 transition-transform">
                      R$
                    </span>
                    <span className="font-medium text-zinc-100 dark:text-zinc-900 tracking-tight">
                      {formatCurrency(amount).replace('R$', '')}
                    </span>
                  </div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 dark:via-zinc-300 to-transparent" />
                <motion.div
                  className="w-full text-xs text-zinc-400 dark:text-zinc-400 mt-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                >
                  ID da transação: {transactionId}
                </motion.div>
              </div>
            </motion.div>
          </div>
          <motion.div
            className="w-full text-xs mt-8 text-zinc-400 dark:text-zinc-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            Esta janela será fechada automaticamente em {closeTimeout} segundos
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
