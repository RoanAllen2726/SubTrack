
"use client";

import { invoices as allInvoices } from "@/lib/data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, Pencil, Trash2, Calendar, Mail, User, Tag, Layers, Repeat, CreditCard, Receipt } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { NotesAnalyzer } from "@/components/subscriptions/notes-analyzer";
import { InvoicesTable } from "@/components/subscriptions/invoices-table";
import { useSubscription } from "@/context/SubscriptionContext";

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const { subscriptions, isLoading } = useSubscription();
  const subscription = subscriptions.find((s) => s.id === params.id);

  if (isLoading) {
    return (
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="text-center text-muted-foreground py-10">Loading subscription details...</div>
        </main>
    )
  }

  if (!subscription) {
    notFound();
  }

  const invoices = allInvoices.filter(inv => inv.subscriptionId === subscription.id);

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">{subscription.name}</h2>
          <Badge
            variant={subscription.status === 'active' ? 'secondary' : (subscription.status === 'paused' ? 'outline' : 'destructive')}
            className={`capitalize text-base ${subscription.status === 'active' && 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'}`}
          >
            {subscription.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          <a href={subscription.vendorUrl} target="_blank" rel="noopener noreferrer">
            <Button><ExternalLink className="mr-2 h-4 w-4" /> Visit Vendor</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3"><User className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Owner</span><div className="flex items-center gap-2 mt-1"><Avatar className="h-6 w-6"><AvatarImage src={subscription.owner.avatarUrl} /><AvatarFallback>{subscription.owner.name.charAt(0)}</AvatarFallback></Avatar>{subscription.owner.name}</div></div></div>
                <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Account Email</span><p>{subscription.accountEmail}</p></div></div>
                <div className="flex items-start gap-3"><Layers className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Plan</span><p>{subscription.plan}</p></div></div>
                <div className="flex items-start gap-3"><Tag className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Category</span><p>{subscription.category}</p></div></div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3"><Receipt className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Price</span><p className="text-base font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: subscription.currency }).format(subscription.price)} <span className="text-xs text-muted-foreground capitalize">/{subscription.billingCycle.replace('ly', '')}</span></p></div></div>
                <div className="flex items-start gap-3"><Repeat className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Billing Cycle</span><p className="capitalize">{subscription.billingCycle}</p></div></div>
                <div className="flex items-start gap-3"><Calendar className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Next Charge</span><p>{format(new Date(subscription.nextChargeDate), "dd MMMM, yyyy")}</p></div></div>
                <div className="flex items-start gap-3"><CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" /><div><span className="font-medium">Payment Method</span><p>{subscription.paymentMethodMask}</p></div></div>
            </CardContent>
          </Card>
          
          <NotesAnalyzer notes={subscription.notes || ''} />

        </div>

        <div className="lg:col-span-1 space-y-6">
            <InvoicesTable invoices={invoices} currency={subscription.currency} />
        </div>
      </div>
    </main>
  );
}
