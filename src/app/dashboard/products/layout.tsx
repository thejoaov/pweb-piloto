import { Suspense } from 'react'

export default function Layout({ children }: React.PropsWithChildren) {
  return <Suspense>{children}</Suspense>
}
