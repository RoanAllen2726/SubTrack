
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import type { Subscription } from "@/lib/types";
import { format, parseISO, add, isSameDay } from "date-fns";
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

export function RenewalsCalendar({ subscriptions }: { subscriptions: Subscription[] }) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const renewalDates = React.useMemo(() => {
    return subscriptions
      .filter(sub => sub.autoRenew && sub.status === 'active')
      .map(sub => parseISO(sub.nextChargeDate));
  }, [subscriptions]);
  
  const upcomingRenewals = React.useMemo(() => {
    const now = new Date();
    const limitDate = add(now, { days: 90 });
    return subscriptions
      .filter(sub => sub.autoRenew && sub.status === 'active')
      .map(sub => ({
        ...sub,
        nextChargeDateObj: parseISO(sub.nextChargeDate),
      }))
      .filter(sub => sub.nextChargeDateObj > now && sub.nextChargeDateObj <= limitDate)
      .sort((a, b) => a.nextChargeDateObj.getTime() - b.nextChargeDateObj.getTime());
  }, [subscriptions]);


  const handleSubscriptionClick = (subscription: Subscription) => {
    const nextChargeDate = parseISO(subscription.nextChargeDate);
    setSelectedDate(nextChargeDate);
    setCurrentMonth(nextChargeDate);
  };
  
  const modifiers = {
    renewal: renewalDates,
  };

  const modifiersStyles = {
    renewal: {
      fontWeight: 'bold',
      border: '2px solid hsl(var(--primary))',
      borderRadius: '50%',
    },
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="p-4"
          />
          <div className="p-4 border-l">
            <h3 className="text-lg font-semibold mb-4">
                Upcoming Renewals (Next 90 Days)
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map(sub => {
                  const logoUrl = getLogoUrl(sub.vendorUrl);
                  const isSelected = selectedDate && isSameDay(sub.nextChargeDateObj, selectedDate);
                  return (
                    <div 
                      key={sub.id} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => handleSubscriptionClick(sub)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {logoUrl && <AvatarImage src={logoUrl} alt={sub.name} />}
                          <AvatarFallback>{sub.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/subscriptions/${sub.id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:underline">{sub.name}</Link>
                          <p className="text-sm text-muted-foreground">Owned by {sub.owner.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: sub.currency }).format(sub.price)}</p>
                        <p className="text-sm text-muted-foreground capitalize">{format(sub.nextChargeDateObj, 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-muted-foreground py-10">No upcoming renewals.</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
