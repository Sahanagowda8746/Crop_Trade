'use client';
import { useEffect, useState, useRef } from 'react';
import { useFormState } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/app-context';
import { handlePestDiagnosis } from '@/app/actions';
import { ScanSearch, Bug, ShieldCheck, Upload, Sparkles } from 'lucide-react';
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
    <Button type="submit" aria-disabled={pending} disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Diagnosing...
        </>
       ) : (
        <>
          <Bug className="mr-2 h-4 w-4" /> Diagnose Pest
        </>
      )}
    </Button>
  );
}

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function PestDetectionPage() {
  const { setPageTitle } = useAppContext();
  const [state, formAction] = useFormState(handlePestDiagnosis, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPageTitle('AI Pest Detection');
  }, [setPageTitle]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setPreview(dataUri);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <ScanSearch className="text-primary" />
            AI-Powered Pest Detection
          </CardTitle>
          <CardDescription>
            Upload an image of a crop leaf, and our AI will identify potential pests or diseases and recommend actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
             <div className="space-y-2">
                <label htmlFor="photo" className="font-medium">Upload Photo</label>
                <div className="flex gap-2">
                    <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-grow">
                        <Upload className="mr-2"/>
                        Choose File
                    </Button>
                </div>
                <input type="hidden" name="photoDataUri" value={preview || ''} />
             </div>

            {preview && (
              <div className="relative w-full h-64 rounded-md overflow-hidden border bg-muted">
                <Image src={preview} alt="Crop preview" fill className="object-contain" />
              </div>
            )}
            
            {state.errors?.photoDataUri && (
              <p className="text-sm font-medium text-destructive">{state.errors.photoDataUri[0]}</p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      {state.message && state.message.startsWith("pending:") && (
        <Card>
            <CardHeader>
                <CardTitle>Diagnosis in Progress</CardTitle>
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

      {state.message && state.message.startsWith("error:") && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message.replace('error:', '')}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <Card className="shadow-md animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Diagnosis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <Bug className="text-primary" /> Diagnosis
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.diagnosis}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                <ShieldCheck className="text-primary" /> Recommended Actions
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.recommendedActions}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
