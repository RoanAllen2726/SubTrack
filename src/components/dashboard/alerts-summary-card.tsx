
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";
import { alertEvents } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../ui/badge";
import { useSubscription } from "@/context/SubscriptionContext";

export function AlertsSummaryCard() {
  const { subscriptions } = useSubscription();
  const subscriptionIds = subscriptions.map(s => s.id);

  const recentAlerts = alertEvents
    .filter(event => subscriptionIds.includes(event.subscriptionId))
    .slice(0, 3);

  if (recentAlerts.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Summary of recent notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-4">No recent alerts.</div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>Summary of recent notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAlerts.map((alert) => {
            const subscription = subscriptions.find(s => s.id === alert.subscriptionId);
            return (
              <div key={alert.id} className="flex items-start space-x-4">
                <div className="p-2 bg-accent/50 rounded-full">
                  <Bell className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {alert.details.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(alert.firedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription ? subscription.name : 'Unknown Subscription'}
                  </p>
                </div>
                <Badge variant={alert.status === 'sent' ? 'secondary' : 'outline'}>{alert.status}</Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
