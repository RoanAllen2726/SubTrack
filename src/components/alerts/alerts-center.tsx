
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alertRules, alertEvents } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Switch } from "../ui/switch";
import Link from "next/link";
import { useSubscription } from "@/context/SubscriptionContext";

export function AlertsCenter() {
  const { subscriptions } = useSubscription();
  const subscriptionIds = subscriptions.map(s => s.id);

  const filteredAlertEvents = alertEvents.filter(event => subscriptionIds.includes(event.subscriptionId));
  const filteredAlertRules = alertRules.filter(rule => subscriptionIds.includes(rule.subscriptionId));

  return (
    <Tabs defaultValue="events">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
        </TabsList>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      <TabsContent value="events" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Event History</CardTitle>
            <CardDescription>A log of all triggered alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Fired At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlertEvents.length > 0 ? (
                    filteredAlertEvents.map(event => {
                    const sub = subscriptions.find(s => s.id === event.subscriptionId);
                    return (
                        <TableRow key={event.id}>
                        <TableCell className="font-medium">
                            <Link href={`/subscriptions/${sub?.id}`} className="hover:underline">{sub ? sub.name : 'N/A'}</Link>
                        </TableCell>
                        <TableCell>{event.details.title}</TableCell>
                        <TableCell>
                            <Badge variant={event.status === 'sent' ? 'secondary' : 'outline'} className="capitalize">{event.status}</Badge>
                        </TableCell>
                        <TableCell>{event.channel}</TableCell>
                        <TableCell className="text-right" title={format(new Date(event.firedAt), 'Pp')}>
                            {formatDistanceToNow(new Date(event.firedAt), { addSuffix: true })}
                        </TableCell>
                        </TableRow>
                    );
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No alert events found for your subscriptions.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rules" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Alert Rules</CardTitle>
            <CardDescription>Configure when to be notified about your subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Rule Type</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead className="text-right">Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlertRules.length > 0 ? (
                    filteredAlertRules.map(rule => {
                    const sub = subscriptions.find(s => s.id === rule.subscriptionId);
                    return (
                        <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                            <Link href={`/subscriptions/${sub?.id}`} className="hover:underline">{sub ? sub.name : 'N/A'}</Link>
                        </TableCell>
                        <TableCell>{rule.type}</TableCell>
                        <TableCell>{rule.thresholdDays > 0 ? `${rule.thresholdDays} days` : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <Switch checked={rule.enabled} />
                        </TableCell>
                        </TableRow>
                    );
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No alert rules found for your subscriptions.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
