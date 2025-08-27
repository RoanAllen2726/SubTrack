
"use client";

import * as React from 'react';
import type { Subscription } from '@/lib/types';
import { subscriptions as initialSubscriptions } from '@/lib/data';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  isLoading: boolean;
}

const SubscriptionContext = React.createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // In a real app, you might fetch this from a database.
    // For now, we'll simulate an async load from our static data.
    setTimeout(() => {
        // Set to empty array to simulate no initial subscriptions for onboarding
        // setSubscriptions(initialSubscriptions);
        setSubscriptions([]);
        setIsLoading(false);
    }, 500);
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscriptions, setSubscriptions, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = React.useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
