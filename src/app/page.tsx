import Link from 'next/link'
import { FeatureSection } from '~/components/feature-section'
import { FooterSection } from '~/components/footer-section'
import { HeroSection } from '~/components/hero-section'
import { MainNav } from '~/components/main-nav'
import { ModeToggle } from '~/components/theme-toggle'
import { Button } from '~/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <img src="/logo-ifpi.png" alt="Logo" />
          </Link>
          <MainNav />
        </div>
      </header>

      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
      </main>

      <FooterSection />
    </div>
  )
}
