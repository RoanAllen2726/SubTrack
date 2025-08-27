// app/page.tsx
"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { MonthlySpendCard } from "@/components/dashboard/monthly-spend-card";
import { SpendForecastCard } from "@/components/dashboard/spend-forecast-card";
import { TopVendorsCard } from "@/components/dashboard/top-vendors-card";
import { CategorySpendChart } from "@/components/dashboard/category-spend-chart";
import { AlertsSummaryCard } from "@/components/dashboard/alerts-summary-card";
import { useSubscription } from "@/context/SubscriptionContext";
import { Onboarding } from "@/components/dashboard/onboarding";

export default function Page() {
  const supabase = React.useMemo(createSupabaseBrowserClient, []);
  const [user, setUser] = React.useState<User | null>(null);
  const [checkingSession, setCheckingSession] = React.useState(true);

  // Check current user + react to auth state changes
  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (checkingSession) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-muted-foreground">Checking session…</p>
      </main>
    );
  }

  // Not signed in → show Supabase Auth (email/password only)
  if (!user) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/confirm`
        : undefined;

    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to SubTrack</h1>
            <p className="text-muted-foreground">Sign in or create an account to continue.</p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}                 // no OAuth
            onlyThirdPartyProviders={false}
            magicLink={false}              // optional: disable magic links
            view="sign_up"                 // optional: land on sign-up tab
            redirectTo={redirectTo}        // IMPORTANT: /auth/confirm so you get token_hash & type
          />
        </div>
      </main>
    );
  }

  // Signed in → render your original dashboard
  return <DashboardContent />;
}

/** Your original dashboard content, unchanged */
function DashboardContent() {
  const { subscriptions, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </main>
    );
  }

  if (subscriptions.length === 0) {
    return <Onboarding />;
  }

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MonthlySpendCard />
        <SpendForecastCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <CategorySpendChart />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <TopVendorsCard />
        </div>
      </div>

      <AlertsSummaryCard />
    </main>
  );
}
