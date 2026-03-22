import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface Stat {
  label: string
  value: number
  icon: LucideIcon
  color: string
}

interface StatsBarProps {
  stats: Stat[]
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`p-3 rounded-lg bg-slate-100 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
