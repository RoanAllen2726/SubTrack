import { createSupabaseBrowserClient } from "./client";
import { Subscription } from "@/lib/types";

export async function saveSubscriptionsToSupabase(subs: Subscription[], userId: string) {
  const supabase = createSupabaseBrowserClient();

  const dataToInsert = subs.map(sub => ({
    user_id: userId,
    name: sub.name,
    category: sub.category,
    price: sub.price,
    currency: sub.currency,
    billing_cycle: sub.billingCycle,
    next_charge_date: sub.nextChargeDate,
    status: sub.status,
    vendor_url: sub.vendorUrl,
    login_url: sub.loginUrl,
    support_url: sub.supportUrl,
    account_email: sub.accountEmail,
    owner_user_id: sub.ownerUserId,
    owner: sub.owner,
    plan: sub.plan,
    seats: sub.seats,
    seat_utilization_pct: sub.seatUtilizationPct,
    auto_renew: sub.autoRenew,
    payment_method_mask: sub.paymentMethodMask,
    trial_ends: sub.trialEnds,
    discount: sub.discount,
    cancel_url: sub.cancelUrl,
    notes: sub.notes,
    created_at: sub.createdAt,
    updated_at: sub.updatedAt,
    // Do NOT include fields not in your table!
  }));

  console.log("Inserting subscriptions:", dataToInsert);
  const { error } = await supabase.from("subscriptions").insert(dataToInsert);
  console.log("Insert error:", error);
  return error;
}