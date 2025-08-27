
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

export function SpendForecastCard() {
  const { subscriptions } = useSubscription();
  
  const annualSpend = subscriptions.reduce((acc, sub) => {
    if (sub.status === 'active') {
      const annualPrice = sub.billingCycle === 'monthly' ? sub.price * 12 : sub.price;
      const priceInNzd = sub.currency === 'USD' ? annualPrice * 1.64 : annualPrice;
      return acc + priceInNzd;
    }
    return acc;
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Annual Forecast</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${annualSpend.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <p className="text-xs text-muted-foreground">Projected spend for the next 12 months</p>
      </CardContent>
    </Card>
  );
}
