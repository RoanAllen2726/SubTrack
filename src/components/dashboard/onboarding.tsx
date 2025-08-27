
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImportSubscriptions } from "@/components/subscriptions/import-subscriptions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function Onboarding() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to SubTrack</CardTitle>
          <CardDescription>
            Get started by adding your first subscription. You can import from a
            PDF or add one manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 mt-4">
            <ImportSubscriptions isOnboarding={true} />
            <div className="flex items-center w-full">
                <div className="flex-grow border-t border-muted"></div>
                <span className="mx-4 text-xs uppercase text-muted-foreground">Or</span>
                <div className="flex-grow border-t border-muted"></div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subscription Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
