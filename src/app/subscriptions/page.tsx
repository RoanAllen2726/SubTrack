
"use client";

import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table";
import { ImportSubscriptions } from "@/components/subscriptions/import-subscriptions";
import { useSubscription } from "@/context/SubscriptionContext";

export default function SubscriptionsPage() {
  const { subscriptions, isLoading } = useSubscription();
  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
        <ImportSubscriptions />
      </div>
      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">Loading subscriptions...</div>
      ) : (
        <SubscriptionsTable data={subscriptions} />
      )}
    </main>
  );
}
