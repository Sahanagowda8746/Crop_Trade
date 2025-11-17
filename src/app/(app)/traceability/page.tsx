'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/app-context';
import { traceHistory as mockTraceHistory } from '@/lib/data';
import { TraceEvent } from '@/lib/types';
import { FileCheck2, MapPin, Tractor, Package, Ship, Building2, CheckCircle, Leaf } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  traceHash: z.string().min(1, 'Please enter a trace hash.').default('A1B2C3D4E5'),
});

const eventIcons: Record<string, React.ElementType> = {
    'Planted': Tractor,
    'Fertilized': Leaf,
    'Harvested': Package,
    'Stored': Building2,
    'Shipped': Ship,
    'Delivered': CheckCircle
};

export default function TraceabilityPage() {
  const { setPageTitle } = useAppContext();
  const [history, setHistory] = useState<TraceEvent[] | null>(null);
  const [searchedHash, setSearchedHash] = useState<string>('');

  useEffect(() => {
    setPageTitle('Traceability Chain');
  }, [setPageTitle]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      traceHash: 'A1B2C3D4E5',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSearchedHash(values.traceHash);
    // In a real app, this would be a fetch to a backend/blockchain service.
    // For now, we simulate it with a lookup in our mock data.
    setHistory(mockTraceHistory[values.traceHash] || []);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <FileCheck2 className="text-primary"/>
            Track Your Crop's Journey
          </CardTitle>
          <CardDescription>
            Enter the trace hash found on your product to see its complete journey from farm to you. Try the demo hash below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="traceHash"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Trace Hash</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A1B2C3D4E5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                <FileCheck2 className="mr-2 h-4 w-4" />
                Trace
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchedHash && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Trace History for: {searchedHash}</CardTitle>
            </CardHeader>
            <CardContent>
                {history && history.length > 0 ? (
                    <div className="relative pl-6 before:absolute before:left-[35px] before:top-0 before:h-full before:w-0.5 before:bg-border before:-translate-x-1/2">
                        {history.map((item, index) => {
                            const Icon = eventIcons[item.event] || FileCheck2;
                            return (
                                <div key={index} className="relative mb-8 pl-8">
                                    <div className="absolute -left-1.5 top-1 flex items-center justify-center w-12 h-12 bg-card rounded-full ring-4 ring-primary">
                                       <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="pl-6">
                                        <p className="font-semibold text-lg">{item.event}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                        <div className="flex items-center text-sm mt-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4 mr-2"/>
                                            <p>{item.location}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 italic">"{item.details}"</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertTitle>Not Found</AlertTitle>
                        <AlertDescription>No history found for this trace hash. Please check the hash and try again.</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
