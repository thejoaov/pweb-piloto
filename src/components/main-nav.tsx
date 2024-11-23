import Link from 'next/link'
import { ModeToggle } from './theme-toggle'

export function MainNav() {
  return (
    <nav className="hidden md:flex gap-6 items-center">
      <Link
        href="https://github.com/thejoaov"
        className="text-sm font-medium hover:underline"
      >
        Outros projetos
      </Link>
      <Link
        href="https://thejoaov.github.io"
        className="text-sm font-medium hover:underline"
      >
        Portfolio
      </Link>
      <Link
        href="https://linkedin.com/in/thejoaov"
        className="text-sm font-medium hover:underline"
      >
        Linkedin
      </Link>
      <img
        src="https://github.com/thejoaov.png"
        alt="Avatar"
        className="w-8 h-8 rounded-full"
      />
      <ModeToggle />
    </nav>
  )
}
