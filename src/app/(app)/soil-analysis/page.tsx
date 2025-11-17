'use client';
import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { handleSoilAnalysis } from '@/app/actions';
import { Leaf, FlaskConical, Lightbulb, Sprout } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const initialState = {
  message: '',
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? 'Analyzing...' : 'Analyze Soil'}
    </Button>
  );
}

export default function SoilAnalysisPage() {
  const { setPageTitle } = useAppContext();
  const [state, formAction] = useFormState(handleSoilAnalysis, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    setPageTitle('AI Soil Analysis');
  }, [setPageTitle]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lightbulb className="text-primary" />
            AI-Powered Soil Analysis
          </CardTitle>
          <CardDescription>
            Describe your soil's texture, color, and location, and our AI will provide crop recommendations and a fertilizer plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Textarea
              name="soilDescription"
              placeholder="e.g., Dark, crumbly loam soil from the central valley, feels slightly gritty. Good drainage after rain..."
              rows={6}
              className="text-base"
            />
            {state.errors?.soilDescription && (
              <p className="text-sm font-medium text-destructive">{state.errors.soilDescription[0]}</p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {pending && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="pt-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {state.message && !state.data && state.message !== 'Invalid form data.' && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <Card className="shadow-md animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <Sprout className="text-primary" /> Crop Recommendations
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.cropRecommendations}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <FlaskConical className="text-primary" /> Fertilizer Plan
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.fertilizerPlan}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
