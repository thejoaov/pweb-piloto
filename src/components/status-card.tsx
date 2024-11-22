import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface StatusCardProps {
  title: string
  value: number
  icon: React.ReactNode
}

export function StatusCard({ title, value, icon }: StatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
