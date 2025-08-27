"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, PlusCircle, Download, Trash2, XCircle } from 'lucide-react';
import { extractSubscriptionsFromPdf } from '@/ai/flows/extract-subscriptions-from-pdf';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { ExtractedSubscriptionSchema, Subscription, SubscriptionCategory, BillingCycle } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useSubscription } from '@/context/SubscriptionContext';
import { formatISO } from 'date-fns';
import { saveSubscriptionsToSupabase } from "@/lib/supabase/save-subscriptions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const FormSchema = z.object({
  subscriptions: z.array(ExtractedSubscriptionSchema.extend({
      id: z.string().optional(),
  })),
});

export function ImportSubscriptions({ isOnboarding = false }: { isOnboarding?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSubscriptions } = useSubscription();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      subscriptions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subscriptions",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      form.reset({ subscriptions: [] });
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    form.reset({ subscriptions: [] });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const pdfDataUri = reader.result as string;
        const result = await extractSubscriptionsFromPdf({ pdfDataUri });
        
        const subscriptionsWithIds = result.subscriptions.map(sub => ({
            ...sub,
            id: `sub-${Math.random().toString(36).substr(2, 9)}`,
        }));

        form.reset({ subscriptions: subscriptionsWithIds });

      } catch (e) {
        console.error(e);
        setError('Failed to extract subscriptions from the PDF. Please try another file.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsLoading(false);
    };
  };
  
  const resetState = () => {
    setFile(null);
    setError(null);
    setIsLoading(false);
    form.reset({ subscriptions: [] });
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to import subscriptions.");
      setIsLoading(false);
      return;
    }

    const newSubscriptions: Subscription[] = data.subscriptions.map((sub, index) => ({
      ...sub,
      id: sub.id || `manual-sub-${index}`,
      vendorUrl: '#',
      loginUrl: '#',
      supportUrl: '#',
      accountEmail: user.email ?? 'imported@example.com',
      ownerUserId: user.id,
      owner: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? '', // or another fallback
        avatarUrl: user.user_metadata?.avatar_url ?? '', // or another fallback
      },
      plan: 'Standard',
      seats: 1,
      seatUtilizationPct: 100,
      autoRenew: true,
      paymentMethodMask: 'Imported',
      trialEnds: null,
      discount: null,
      cancelUrl: null,
      notes: 'Imported from PDF.',
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date()),
    }));

    const error = await saveSubscriptionsToSupabase(newSubscriptions, user.id);

    if (error) {
      setError("Failed to save subscriptions to database.");
    } else {
      setIsOpen(false);
      setSubscriptions(newSubscriptions); // update local state if needed
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            resetState();
        }
    }}>
      <DialogTrigger asChild>
        {isOnboarding ? (
            <Button className="w-full sm:w-auto text-lg p-6"><Upload className="mr-2 h-5 w-5" />Import from PDF</Button>
        ) : (
            <div className="flex items-center space-x-2">
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Subscription
                </Button>
            </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Subscriptions from PDF</DialogTitle>
          <DialogDescription>
            Upload a PDF to automatically extract your subscriptions. You can review and edit them before importing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pdf-file">1. Upload PDF</Label>
                    <Input id="pdf-file" type="file" accept="application/pdf" onChange={handleFileChange} />
                </div>
                <Button onClick={handleExtract} disabled={!file || isLoading} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    {isLoading ? 'Processing...' : 'Extract Subscriptions'}
                </Button>
                {isLoading && (
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <p className="text-sm text-center text-muted-foreground">AI is reading your PDF...</p>
                    </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Import Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="md:col-span-2">
                <Label>2. Review & Edit</Label>
                <ScrollArea className="h-[400px] mt-2">
                    <div className="pr-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {fields.length === 0 && !isLoading && (
                                    <div className="flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-lg">
                                        <p className="text-muted-foreground">Extracted subscriptions will appear here.</p>
                                    </div>
                                )}
                                {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`subscriptions.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Name</Label>
                                                    <FormControl><Input {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`subscriptions.${index}.category`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Category</Label>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {Object.values(SubscriptionCategory).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`subscriptions.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Price</Label>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`subscriptions.${index}.currency`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Currency</Label>
                                                    <FormControl><Input {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`subscriptions.${index}.billingCycle`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Cycle</Label>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                          {Object.values(BillingCycle).map(cyc => <SelectItem key={cyc} value={cyc} className="capitalize">{cyc}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`subscriptions.${index}.nextChargeDate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Next Charge</Label>
                                                    <FormControl><Input type="date" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormMessage />
                                </div>
                                ))}
                                <Button 
                                type="button" 
                                variant="outline"
                                className="w-full"
                                onClick={() => append({ id: `manual-sub-${fields.length}`, name: '', category: 'Other', price: 0, currency: 'USD', billingCycle: 'monthly', nextChargeDate: '', status: 'active' })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Another Subscription
                              </Button>
                              <DialogFooter>
                                <Button type="submit" disabled={isLoading || fields.length === 0}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Import {fields.length > 0 ? `${fields.length} Subscriptions` : ''}
                                </Button>
                              </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}