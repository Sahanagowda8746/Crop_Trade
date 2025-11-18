
'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard, FlaskConical, Package, TestTube, Truck, XCircle, Send } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const features = [
    "Professional lab analysis of N, P, K, pH, and organic matter.",
    "Personalized fertilizer and crop recommendations.",
    "Digital report accessible anytime on the AgriLink platform.",
    "Easy-to-use sample collection and mail-in kit."
];

const instructions = [
    "Collect around 200-300g of soil.",
    "Take samples from 5-10 random points in the area.",
    "Sample from a depth of 0-15cm.",
    "Ensure the soil is air-dried before packing.",
    "Do not mix any fertilizer or extra water.",
    "Use only the provided container and seal it tightly.",
    "Attach the unique QR code label to the container.",
    "Place the sealed container in the provided zip-lock bag.",
    "Insert the completed submission form into the package.",
    "Ship the sample using the pre-paid return pouch."
];

const requirements = [
    { parameter: 'Soil Weight', requirement: '200-300g', compliant: true },
    { parameter: 'Moisture', requirement: '<10% (air dried)', compliant: true },
    { parameter: 'Container', requirement: 'Provided one only', compliant: true },
    { parameter: 'Sun Drying', requirement: 'Not allowed', compliant: false },
    { parameter: 'Water Added', requirement: 'Not allowed', compliant: false },
    { parameter: 'Foreign Material', requirement: 'None (stones, roots)', compliant: false },
];


function GooglePayIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M10.187 10.518c0 .323-.043.64-.127.95h4.94v-3.83h-4.94c.084.31.127.627.127.95zm-1.803 2.822c-.633-.51-1.03-1.28-1.03-2.148s.397-1.638 1.03-2.148v4.296zm8.616-2.148c0-2.32-1.27-4.322-3.15-5.41v1.898c.95.733 1.543 1.883 1.543 3.162s-.593 2.43-1.542 3.162v1.898c1.88-1.088 3.15-3.09 3.15-5.41zm-6.813 5.318V20c4.133 0 7.5-3.367 7.5-7.5s-3.367-7.5-7.5-7.5-7.5 3.367-7.5 7.5c0 1.53.46 2.953 1.258 4.14l1.83-1.22c-.417-.733-.654-1.566-.654-2.448h5.066v3.78h-5.066c.266.93.766 1.753 1.433 2.39z" fill="#4285F4"/>
        </svg>
    )
}

function PhonePeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
         <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.32 14.16c-1.03.35-2.1.53-3.21.53-2.6 0-5.01-.8-7.01-2.22l1.65-1.18c1.55 1.1 3.34 1.7 5.25 1.7.92 0 1.8-.13 2.62-.4l.9 1.57zM8.52 9.11c.9-1.2 2.35-1.99 3.98-1.99 1.15 0 2.22.37 3.08.99l.9-1.57c-1.22-.85-2.73-1.37-4.35-1.37-2.1 0-3.99.73-5.5 2.02l1.9 1.92z" fill="#5f259f"/>
        </svg>
    )
}

function PaytmIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
           <path d="M14.39.46l-11.3 7.29a.57.57 0 00-.28.5v8.11c0 .22.13.43.34.52l4.13 1.95L18.6 12zm-9.35 15.3l-2.45-1.16V8.5l9.2-5.93 5.46 11.72z" fill="#00baf2"/>
           <path d="M1.34 8.7l.28-.18 9.35-6-7.82 5.02a.57.57 0 00-.28.5zM12.98 20.35l7.97-3.77c.2-.1.33-.3.33-.52V7.93a.57.57 0 00-.85-.5l-7.45 13.4z" fill="#0d2e6e"/>
        </svg>
    )
}


function OrderDialog() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card'>('UPI');

    const createOrderInFirestore = async () => {
        if (!user || !firestore) return;

        const newOrder = {
            userId: user.uid,
            status: 'ordered' as const,
            orderDate: new Date().toISOString(),
            trackingId: null,
            soilKitQr: `SK-${user.uid.slice(0, 5)}-${Date.now()}`,
            labReportUrl: null,
            deliveryAddress: address,
            paymentMethod: paymentMethod,
        };

        const ordersCollection = collection(firestore, 'soilKitOrders');
        await addDocumentNonBlocking(ordersCollection, newOrder);

        toast({
            title: 'Order Placed!',
            description: 'Your Soil Test Kit has been ordered successfully.',
        });

        setIsOpen(false);
        router.push('/my-soil-tests');
    };
    
    const handleUpiPayment = async (appName: string) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'You are not logged in',
                description: 'Please log in to purchase a soil kit.',
            });
            return;
        }

        if (!address.trim()) {
            toast({
                variant: 'destructive',
                title: 'Address Required',
                description: 'Please enter a delivery address.',
            });
            return;
        }

        const payeeAddress = 'sahanagowdasahana8746@okaxis';
        const payeeName = 'CropTrade';
        const amount = '500.00';
        const note = 'Soil Test Kit Order';
        
        let upiUrl = `upi://pay?pa=${payeeAddress}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
        
        // In a real mobile web scenario, you might add app-specific prefixes, but the generic URL is often sufficient.
        // For example: `google-pay://...`
        
        toast({
            title: `Redirecting to ${appName}`,
            description: "Opening UPI app to complete payment. Your order will be created upon successful payment.",
        });

        // This simulates the payment process. In a real app, you'd wait for a callback.
        // For this demo, we'll create the order after a short delay.
        setTimeout(() => {
            createOrderInFirestore();
        }, 3000);
        
        // This will attempt to open the UPI app on mobile. It won't do anything on desktop.
        window.location.href = upiUrl;
    };
    
    const handleCardPayment = async () => {
         if (!user) {
            toast({
                variant: 'destructive',
                title: 'You are not logged in',
                description: 'Please log in to purchase a soil kit.',
            });
            return;
        }

        if (!address.trim()) {
            toast({
                variant: 'destructive',
                title: 'Address Required',
                description: 'Please enter a delivery address.',
            });
            return;
        }

        toast({
            title: 'Processing Card Payment...',
            description: 'Please wait while we process your order.',
        });
        
        await createOrderInFirestore();
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full mt-6">Buy Now</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Your Order</DialogTitle>
                    <DialogDescription>
                        Provide your delivery address and confirm your payment method to complete the purchase.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <Label htmlFor="address">Delivery Address</Label>
                        <Textarea 
                            id="address" 
                            placeholder="Enter your full shipping address..." 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                     <div>
                        <Label>Payment Method</Label>
                         <RadioGroup defaultValue="UPI" value={paymentMethod} onValueChange={(value: 'UPI' | 'Card') => setPaymentMethod(value)} className="mt-2">
                            <div className="flex items-center space-x-2 p-2 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                                <RadioGroupItem value="UPI" id="upi" />
                                <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-grow">
                                    <Send className="h-5 w-5 text-primary" />
                                    UPI
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-2 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                                <RadioGroupItem value="Card" id="card" />
                                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-grow">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Card (Credit/Debit)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {paymentMethod === 'UPI' && (
                        <div className="space-y-3 pt-2 animate-in fade-in-50">
                            <h4 className="font-medium text-sm text-center text-muted-foreground">Choose your UPI app</h4>
                            <div className="grid grid-cols-3 gap-2">
                                 <Button variant="outline" className="flex flex-col h-auto py-2" onClick={() => handleUpiPayment('Google Pay')}>
                                     <GooglePayIcon />
                                     <span className="mt-1 text-xs">Google Pay</span>
                                 </Button>
                                 <Button variant="outline" className="flex flex-col h-auto py-2" onClick={() => handleUpiPayment('PhonePe')}>
                                    <PhonePeIcon />
                                    <span className="mt-1 text-xs">PhonePe</span>
                                 </Button>
                                 <Button variant="outline" className="flex flex-col h-auto py-2" onClick={() => handleUpiPayment('Paytm')}>
                                    <PaytmIcon />
                                    <span className="mt-1 text-xs">Paytm</span>
                                 </Button>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                     {paymentMethod === 'Card' && (
                        <Button onClick={handleCardPayment}>Confirm and Pay ₹500</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SoilKitPage() {
    const { setPageTitle } = useAppContext();

    useEffect(() => {
        setPageTitle('Professional Soil Test Kit');
    }, [setPageTitle]);


    return (
        <div className="max-w-5xl mx-auto space-y-8">
             <Card className="overflow-hidden shadow-lg">
                <div className="grid md:grid-cols-2">
                    <div className="p-8 flex flex-col justify-center">
                        <CardHeader className="p-0">
                             <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <FlaskConical className="text-primary"/>
                                AgriLink Soil Test Kit
                            </CardTitle>
                            <CardDescription className="text-lg pt-2">
                                Get precise, lab-accurate results for your soil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-6">
                            <ul className="space-y-3">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-4xl font-bold mt-6 text-primary">₹500</p>
                            <p className="text-sm text-muted-foreground">Includes shipping and all lab fees.</p>
                            <OrderDialog />
                        </CardContent>
                    </div>
                     <div className="relative min-h-[300px] md:min-h-0">
                         <Image
                            src="https://picsum.photos/seed/soilkit/800/800"
                            alt="Soil Test Kit"
                            fill
                            className="object-cover"
                            data-ai-hint="soil test kit"
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-8 text-center">
                     <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                            <Package className="h-8 w-8" />
                        </div>
                        <p className="font-semibold">1. Order Your Kit</p>
                        <p className="text-sm text-muted-foreground">We ship a complete soil collection kit to your address.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                            <Truck className="h-8 w-8" />
                        </div>
                        <p className="font-semibold">2. Collect & Ship</p>
                        <p className="text-sm text-muted-foreground">Follow the simple instructions to collect your soil and mail it back using the pre-paid return pouch.</p>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                            <TestTube className="h-8 w-8" />
                        </div>
                        <p className="font-semibold">3. Get Your Report</p>
                        <p className="text-sm text-muted-foreground">Our lab analyzes your sample and you get a notification when your detailed report is ready on your dashboard.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Sample Collection & Shipping Instructions</CardTitle>
                    <CardDescription>Follow these instructions carefully to ensure an accurate lab analysis.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        {instructions.map((instruction, i) => (
                             <li key={i} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{instruction}</span>
                            </li>
                        ))}
                    </div>
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Requirement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requirements.map(req => (
                                    <TableRow key={req.parameter}>
                                        <TableCell className="font-medium">{req.parameter}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {req.compliant ? <Check className="h-4 w-4 text-green-500"/> : <XCircle className="h-4 w-4 text-destructive"/>}
                                            {req.requirement}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
