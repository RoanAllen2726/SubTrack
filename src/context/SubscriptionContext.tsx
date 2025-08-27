"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { Subscription } from "@/lib/types";
import { fetchUserSubscriptions } from "@/lib/supabase/fetch-subscriptions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const SubscriptionContext = createContext<{
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
}>({
  subscriptions: [],
  setSubscriptions: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && mounted) {
        const subs = await fetchUserSubscriptions(user.id);
        setSubscriptions(subs);
      }
    }

    load();

    // Optionally, listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserSubscriptions(session.user.id).then(setSubscriptions);
      } else {
        setSubscriptions([]);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscriptions, setSubscriptions }}>
      {children}
    </SubscriptionContext.Provider>
  );
}