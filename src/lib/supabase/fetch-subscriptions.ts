import { createSupabaseBrowserClient } from "./client";
import { Subscription } from "@/lib/types";

export async function fetchUserSubscriptions(userId: string): Promise<Subscription[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
  return data as Subscription[];
}