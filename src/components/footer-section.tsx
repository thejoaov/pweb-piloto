import Link from 'next/link'

export function FooterSection() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-center items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 @thejoaov. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}
