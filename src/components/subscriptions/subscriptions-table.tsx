"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Subscription } from "@/lib/types";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Helper to map snake_case from Supabase to camelCase for UI
function mapSubscriptionFromDb(dbSub: any): Subscription {
  return {
    ...dbSub,
    id: dbSub.id,
    name: dbSub.name,
    category: dbSub.category,
    price: dbSub.price,
    currency: dbSub.currency,
    billingCycle: dbSub.billing_cycle,
    nextChargeDate: dbSub.next_charge_date,
    status: dbSub.status,
    vendorUrl: dbSub.vendor_url,
    loginUrl: dbSub.login_url,
    supportUrl: dbSub.support_url,
    accountEmail: dbSub.account_email,
    ownerUserId: dbSub.owner_user_id,
    owner: dbSub.owner,
    plan: dbSub.plan,
    seats: dbSub.seats,
    seatUtilizationPct: dbSub.seat_utilization_pct,
    autoRenew: dbSub.auto_renew,
    paymentMethodMask: dbSub.payment_method_mask,
    trialEnds: dbSub.trial_ends,
    discount: dbSub.discount,
    cancelUrl: dbSub.cancel_url,
    notes: dbSub.notes,
    createdAt: dbSub.created_at,
    updatedAt: dbSub.updated_at,
  };
}

type SortKey = keyof Subscription | 'owner.name';

export function SubscriptionsTable({ data }: { data: any[] }) {
  // Map data from Supabase to camelCase for UI
  const mappedData: Subscription[] = React.useMemo(
    () => data.map(mapSubscriptionFromDb),
    [data]
  );

  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const sortedData = React.useMemo(() => {
    let sortableItems = [...mappedData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'owner.name') {
          aValue = a.owner?.name || "";
          bValue = b.owner?.name || "";
        } else {
          aValue = a[sortConfig.key as keyof Subscription];
          bValue = b[sortConfig.key as keyof Subscription];
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [mappedData, sortConfig]);

  const filteredData = sortedData.filter((item) =>
    (item.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
    (item.category?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('name')}>
                  Name {getSortIndicator('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('status')}>
                  Status {getSortIndicator('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('owner.name')}>
                  Owner {getSortIndicator('owner.name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('billingCycle')}>
                  Cycle {getSortIndicator('billingCycle')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort('price')}>
                  Price {getSortIndicator('price')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort('nextChargeDate')}>
                  Next Charge {getSortIndicator('nextChargeDate')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <Link href={`/subscriptions/${item.id}`} className="hover:underline">
                    {item.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">{item.category}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === 'active' ? 'secondary' : (item.status === 'paused' ? 'outline' : 'destructive')}
                    className={`capitalize ${item.status === 'active' && 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'}`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={item.owner?.avatarUrl} data-ai-hint="person portrait" />
                      <AvatarFallback>{item.owner?.name?.charAt(0) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <span>{item.owner?.name ?? "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{item.billingCycle}</TableCell>
                <TableCell className="text-right">
                  {typeof item.price === "number"
                    ? item.price.toLocaleString("en-US", { style: "currency", currency: item.currency || "USD" })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {item.nextChargeDate
                    ? format(new Date(item.nextChargeDate), "dd MMM yyyy")
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}