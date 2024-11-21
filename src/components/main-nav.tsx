import Link from 'next/link'

export function MainNav() {
  return (
    <nav className="hidden md:flex gap-6">
      <Link href="#features" className="text-sm font-medium hover:underline">
        Features
      </Link>
      <Link href="#pricing" className="text-sm font-medium hover:underline">
        Pricing
      </Link>
      <Link href="#about" className="text-sm font-medium hover:underline">
        About
      </Link>
    </nav>
  )
}
