
"use client"

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Subscription } from "@/lib/types";
import { add, differenceInDays, format, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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

export function RenewalsList({ subscriptions }: { subscriptions: Subscription[] }) {
  const now = new Date();

  const filterSubscriptions = (days: number) => {
    const limitDate = add(now, { days });
    return subscriptions
      .filter(sub => sub.autoRenew && sub.status === 'active')
      .map(sub => ({
        ...sub,
        nextChargeDateObj: parseISO(sub.nextChargeDate),
      }))
      .filter(sub => sub.nextChargeDateObj > now && sub.nextChargeDateObj <= limitDate)
      .sort((a, b) => a.nextChargeDateObj.getTime() - b.nextChargeDateObj.getTime());
  };

  const tabs = [
    { value: "7", label: "Next 7 Days", data: filterSubscriptions(7) },
    { value: "30", label: "Next 30 Days", data: filterSubscriptions(30) },
    { value: "90", label: "Next 90 Days", data: filterSubscriptions(90) },
  ];

  return (
    <Card>
        <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>Subscriptions set to auto-renew soon.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="30">
                <TabsList>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
                </TabsList>
                {tabs.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <div className="space-y-4">
                            {tab.data.length > 0 ? (
                                tab.data.map(sub => {
                                    const logoUrl = getLogoUrl(sub.vendorUrl);
                                    return (
                                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                {logoUrl && <AvatarImage src={logoUrl} alt={sub.name} />}
                                                <AvatarFallback>{sub.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/subscriptions/${sub.id}`} className="font-medium hover:underline">{sub.name}</Link>
                                                <p className="text-sm text-muted-foreground">Owned by {sub.owner.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: sub.currency }).format(sub.price)}</p>
                                            <p className="text-sm text-muted-foreground">in {differenceInDays(sub.nextChargeDateObj, now)} days ({format(sub.nextChargeDateObj, 'MMM d')})</p>
                                        </div>
                                    </div>
                                    )
                                })
                            ) : (
                                <div className="text-center text-muted-foreground py-10">No renewals in this period.</div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
      </CardContent>
    </Card>
  );
}
