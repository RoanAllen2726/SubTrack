
"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { SubscriptionCategory } from "@/lib/types"
import { useSubscription } from "@/context/SubscriptionContext"

const chartConfig = {
  spend: {
    label: "Spend",
  },
  Media: {
    label: "Media",
    color: "hsl(var(--chart-1))",
  },
  Cloud: {
    label: "Cloud",
    color: "hsl(var(--chart-2))",
  },
  DevTool: {
    label: "DevTool",
    color: "hsl(var(--chart-3))",
  },
  Productivity: {
    label: "Productivity",
    color: "hsl(var(--chart-4))",
  },
  Other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies Record<string, any>

export function CategorySpendChart() {
  const { subscriptions } = useSubscription();
  const [activeCategory, setActiveCategory] =
    React.useState<SubscriptionCategory | null>(null)

  const categorySpend = React.useMemo(() => {
    const spend = subscriptions.reduce((acc, sub) => {
      if (sub.status === 'active') {
        const annualPrice = sub.billingCycle === 'monthly' ? sub.price * 12 : sub.price;
        const priceInNzd = sub.currency === 'USD' ? annualPrice * 1.64 : annualPrice;

        if (!acc[sub.category]) {
          acc[sub.category] = 0;
        }
        acc[sub.category] += priceInNzd;
      }
      return acc;
    }, {} as Record<SubscriptionCategory, number>);

    return Object.entries(spend).map(([category, total]) => ({
      category: category as SubscriptionCategory,
      spend: total,
      fill: chartConfig[category as SubscriptionCategory]?.color,
    }));
  }, [subscriptions]);

  const totalSpend = React.useMemo(() => {
    return categorySpend.reduce((acc, curr) => acc + curr.spend, 0)
  }, [categorySpend])
  
  const activeIndex = React.useMemo(
    () => categorySpend.findIndex((item) => item.category === activeCategory),
    [activeCategory, categorySpend]
  )

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-start pb-0">
        <CardTitle>Spend by Category</CardTitle>
        <CardDescription>Annualized spend distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={categorySpend}
              dataKey="spend"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius}
                    innerRadius={outerRadius - 8}
                  />
                </g>
              )}
              onMouseOver={(_, index) => {
                setActiveCategory(categorySpend[index].category)
              }}
              onMouseLeave={() => setActiveCategory(null)}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardHeader className="flex-col items-center gap-2 text-center">
        <CardTitle className="text-2xl font-bold">
          ${totalSpend.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}
        </CardTitle>
        <CardDescription>Total Annual Spend</CardDescription>
      </CardHeader>
    </Card>
  )
}
