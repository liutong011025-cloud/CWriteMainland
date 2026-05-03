"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type DailySignup = { date: string; count: number }

type WorkDistribution = {
  stories: number
  reviews: number
  letters: number
  dramas: number
  poetries: number
}

type DashboardChartProps = {
  dailySignups: DailySignup[]
  workDistribution: WorkDistribution
}

/** 管理后台：近 30 日注册柱状图（workDistribution 由外层卡片展示，此处仅占位入参以兼容调用） */
export function DashboardChart({ dailySignups }: DashboardChartProps) {
  const data = dailySignups.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }))

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No signup data in this range.</p>
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Signups" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
