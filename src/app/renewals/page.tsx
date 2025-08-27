
"use client";

import { RenewalsList } from "@/components/renewals/renewals-list";
import { useSubscription } from "@/context/SubscriptionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenewalsCalendar } from "@/components/renewals/renewals-calendar";
import { List, Calendar as CalendarIcon } from "lucide-react";

export default function RenewalsPage() {
  const { subscriptions, isLoading } = useSubscription();

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Renewals Calendar</h2>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">Loading subscriptions...</div>
      ) : (
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <RenewalsList subscriptions={subscriptions} />
          </TabsContent>
          <TabsContent value="calendar">
            <RenewalsCalendar subscriptions={subscriptions} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
