
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscription } from "@/context/SubscriptionContext";

function getLogoUrl(vendorUrl: string) {
    try {
        const url = new URL(vendorUrl);
        if (url.hostname) {
            return `https://logo.clearbit.com/${url.hostname}`;
        }
    } catch (e) {
        // Invalid URL, fall through to return null
    }
    return null;
}

export function TopVendorsCard() {
  const { subscriptions } = useSubscription();

  const vendorSpend = subscriptions.reduce((acc, sub) => {
    const annualPrice = sub.billingCycle === 'monthly' ? sub.price * 12 : sub.price;
    const priceInNzd = sub.currency === 'USD' ? annualPrice * 1.64 : annualPrice;

    const vendorName = sub.name.split(' ')[0];
    if (!acc[vendorName]) {
      acc[vendorName] = { spend: 0, name: vendorName, url: sub.vendorUrl };
    }
    acc[vendorName].spend += priceInNzd;
    return acc;
  }, {} as Record<string, { spend: number; name: string; url: string }>);

  const topVendors = Object.values(vendorSpend)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
        <CardDescription>Your highest spending subscriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topVendors.map((vendor) => {
            const logoUrl = getLogoUrl(vendor.url);
            const hostname = logoUrl ? new URL(vendor.url).hostname : 'N/A';
            return (
                <div className="flex items-center" key={vendor.name}>
                    <Avatar className="h-9 w-9">
                        {logoUrl && <AvatarImage src={logoUrl} alt={vendor.name} />}
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{hostname}</p>
                    </div>
                    <div className="ml-auto font-medium">${vendor.spend.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}/yr</div>
                </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
