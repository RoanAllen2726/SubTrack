"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { analyzeSubscriptionNotes } from "@/ai/flows/analyze-subscription-notes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function NotesAnalyzer({ notes }: { notes: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await analyzeSubscriptionNotes({ notes });
      setSummary(result.summary);
    } catch (e) {
      setError("Failed to analyze notes. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!notes) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">No notes for this subscription.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Internal notes and important details.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{notes}</p>
        <Button onClick={handleAnalyze} disabled={isLoading}>
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? "Analyzing..." : "Analyze with AI"}
        </Button>

        {isLoading && <Skeleton className="h-20 mt-4" />}
        {error && (
            <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {summary && (
          <div className="mt-4 p-4 bg-secondary rounded-lg border">
            <h4 className="font-semibold mb-2 text-secondary-foreground">AI Summary</h4>
            <p className="text-sm text-secondary-foreground">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
