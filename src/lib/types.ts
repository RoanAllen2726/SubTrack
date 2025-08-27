import { z } from 'zod';

export const SubscriptionCategory = {
  Media: "Media",
  Cloud: "Cloud",
  DevTool: "DevTool",
  Productivity: "Productivity",
  Other: "Other",
} as const;
export type SubscriptionCategory = typeof SubscriptionCategory[keyof typeof SubscriptionCategory];

export const BillingCycle = {
  monthly: "monthly",
  annual: "annual",
} as const;
export type BillingCycle = typeof BillingCycle[keyof typeof BillingCycle];

export type SubscriptionStatus = "active" | "paused" | "canceled";

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  vendorUrl: string;
  loginUrl: string;
  supportUrl: string;
  accountEmail: string;
  ownerUserId: string;
  owner: User;
  plan: string;
  seats: number;
  seatUtilizationPct: number | null;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextChargeDate: string;
  autoRenew: boolean;
  paymentMethodMask: string;
  trialEnds: string | null;
  discount: string | null;
  cancelUrl: string | null;
  notes: string | null;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  number: string;
  taxAmount: number | null;
  gstVatCountry: string | null;
  fileUrl: string;
  createdAt: string;
}

export type AlertRuleType = "TrialEnding" | "RenewalDue" | "CardExpiring" | "PriceChange" | "LowUtilization";

export interface AlertRule {
  id: string;
  subscriptionId: string;
  type: AlertRuleType;
  thresholdDays: number;
  enabled: boolean;
  params: Record<string, any>;
}

export type AlertEventStatus = "sent" | "suppressed" | "error";
export type AlertEventChannel = "Email" | "Teams" | "Slack" | "SMS";

export interface AlertEvent {
  id: string;
  subscriptionId: string;
  ruleId: string;
  firedAt: string;
  status: AlertEventStatus;
  channel: AlertEventChannel;
  details: {
    title: string;
    message: string;
  };
}

export const ExtractedSubscriptionSchema = z.object({
    name: z.string().describe('The name of the subscription service.'),
    category: z.nativeEnum(SubscriptionCategory).describe('The category of the subscription.'),
    price: z.number().describe('The price of the subscription.'),
    currency: z.string().describe('The currency of the price (e.g., USD, NZD).'),
    billingCycle: z.nativeEnum(BillingCycle).describe('The billing cycle (monthly or annual).'),
    nextChargeDate: z.string().describe('The next charge date in YYYY-MM-DD format.'),
    status: z.enum(['active', 'paused', 'canceled']).default('active').describe('The status of the subscription.'),
});
export type ExtractedSubscription = z.infer<typeof ExtractedSubscriptionSchema>;
