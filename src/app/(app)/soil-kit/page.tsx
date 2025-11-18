
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
import { Input } from '@/components/ui/input';

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

function OrderDialog() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card'>('UPI');

    const createOrderInFirestore = async () => {
        if (!user || !firestore) return; // Should be checked before calling

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

    const handleConfirmOrder = async () => {
        if (!user || !firestore) {
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
            title: 'Processing Order...',
            description: 'Please wait while we prepare your order.',
        });

        if (paymentMethod === 'UPI') {
            // Construct UPI payment link
            const payeeAddress = 'sahanagowdasahana8746@okaxis';
            const payeeName = 'CropTrade';
            const amount = '500.00';
            const note = 'Soil Test Kit Order';
            const upiUrl = `upi://pay?pa=${payeeAddress}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;

            // Simulate redirection for non-mobile environments
            if (typeof window !== 'undefined') {
                console.log('Redirecting to UPI:', upiUrl);
                toast({
                    title: "Redirecting to UPI",
                    description: "Opening UPI app to complete payment. Creating order after payment...",
                });
                
                // In a real mobile scenario, this would open the UPI app.
                // Here, we simulate the process for a web environment.
                // We'll create the order after a short delay to simulate payment completion.
                setTimeout(() => {
                    createOrderInFirestore();
                }, 3000); // Simulate 3 second payment time

            }
        } else {
            // For 'Card' payment, create the order directly as before
            await createOrderInFirestore();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full mt-6">Buy Now</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Your Order</DialogTitle>
                    <DialogDescription>
                        Please provide your delivery address and confirm your payment method to complete the purchase.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
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
                         <RadioGroup defaultValue="upi" value={paymentMethod} onValueChange={(value: 'UPI' | 'Card') => setPaymentMethod(value)} className="mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="UPI" id="upi" />
                                <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                                    <Send className="h-5 w-5 text-primary" />
                                    UPI
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Card" id="card" />
                                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Card (Credit/Debit)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleConfirmOrder}>Confirm and Pay ₹500</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SoilKitPage() {
    const { setPageTitle } = useAppContext();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

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
