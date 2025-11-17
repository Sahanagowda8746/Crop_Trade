'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sprout, UserPlus, LogIn } from 'lucide-react';
import { useAuth, useUser, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Separator } from '@/components/ui/separator';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.83 0-1.5.67-1.5 1.5V12h3l-.5 3h-2.5v6.95c5.05-.5 9-4.76 9-9.95z"/>
        </svg>
    );
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  async function onEmailSubmit(values: z.infer<typeof signupSchema>) {
    setIsEmailLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const newUser = userCredential.user;

      await updateProfile(newUser, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      if(firestore) {
        const userDocRef = doc(firestore, 'users', newUser.uid);
        setDocumentNonBlocking(userDocRef, {
            id: newUser.uid,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: 'Farmer',
            createdAt: serverTimestamp(),
        }, {});
      }

      toast({
        title: 'Account Created',
        description: "You've been successfully signed up!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unknown error occurred. Please try again.',
      });
    } finally {
        setIsEmailLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const [firstName, ...lastNameParts] = user.displayName?.split(' ') || ['', ''];
                const lastName = lastNameParts.join(' ');
                
                await setDocumentNonBlocking(userDocRef, {
                    id: user.uid,
                    firstName: firstName || 'New',
                    lastName: lastName || 'User',
                    email: user.email,
                    role: 'Farmer',
                    createdAt: serverTimestamp(),
                }, {});
            }
        }

        toast({
            title: 'Sign Up Successful',
            description: `Welcome, ${user.displayName || 'friend'}!`,
        });
        router.push('/dashboard');

    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Google Sign-Up Failed',
            description: error.message || 'An unknown error occurred. Please try again.',
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }
  
  if (isUserLoading || (!isUserLoading && user)) {
      return (
        <div className="flex h-screen items-center justify-center">
            <UserPlus className="h-8 w-8 animate-spin" />
        </div>
      )
  }
  
  const isLoading = isEmailLoading || isGoogleLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Sprout className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold">CropTrade</h1>
          </div>
          <p className="text-muted-foreground">Create an account to get started.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>It's quick and easy to join our community.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
                    {isGoogleLoading ? <LogIn className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                    Sign up with Google
                </Button>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                        </span>
                    </div>
                </div>

                <Form {...form}>
                <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isEmailLoading ? <UserPlus className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create Account
                    </Button>
                </form>
                </Form>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
    