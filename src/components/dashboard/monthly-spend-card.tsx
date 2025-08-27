
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

export function MonthlySpendCard() {
  const { subscriptions } = useSubscription();

  const monthlySpend = subscriptions.reduce((acc, sub) => {
    if (sub.status === 'active') {
      const monthlyPrice = sub.billingCycle === 'annual' ? sub.price / 12 : sub.price;
      // Simple currency conversion mock, assuming USD is ~1.5 NZD
      const priceInNzd = sub.currency === 'USD' ? monthlyPrice * 1.64 : monthlyPrice;
      return acc + priceInNzd;
    }
    return acc;
  }, 0);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">This Month's Spend</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${monthlySpend.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <p className="text-xs text-muted-foreground">+5.2% from last month</p>
      </CardContent>
    </Card>
  );
}
