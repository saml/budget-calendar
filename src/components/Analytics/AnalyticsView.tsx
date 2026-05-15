import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import type { Budget } from '../../types'
import { formatNumber } from '../../utils/budgetUtils'
import { computeCategorySummary } from '../../utils/categorySummary'

type Props = {
  budget: Budget
}

type PieDatum = {
  name: string
  value: number
  percentage: number
  fill: string
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: PieDatum }>
}) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="rounded border border-neutral-200 bg-white px-3 py-2 text-sm shadow dark:border-neutral-700 dark:bg-neutral-900">
      <div className="font-medium">{item.name}</div>
      <div>
        {formatNumber(item.value)} · {item.percentage.toFixed(1)}%
      </div>
    </div>
  )
}

export function AnalyticsView({ budget }: Props) {
  const summary = computeCategorySummary(budget)

  if (summary.length === 0) {
    return <div className="p-4 text-sm text-neutral-500">No activities yet</div>
  }

  const data: PieDatum[] = summary.map((row) => ({
    name: row.categoryName,
    value: row.totalCost,
    percentage: row.percentage,
    fill: row.color,
  }))

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-center">
        <PieChart width={320} height={320}>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={120} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<TooltipContent />} />
        </PieChart>
      </div>
      <ul className="space-y-2 text-sm">
        {summary.map((row) => (
          <li key={row.categoryName} className="grid grid-cols-[1fr_auto_auto] gap-4">
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {row.categoryName}
            </span>
            <span className="text-right tabular-nums">{formatNumber(row.totalCost)}</span>
            <span className="text-right tabular-nums">{row.percentage.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
