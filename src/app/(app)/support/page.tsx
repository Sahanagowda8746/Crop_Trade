'use client';
import { useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LifeBuoy, Mail, Phone } from 'lucide-react';

const faqs = [
  {
    question: "How do I create a new crop listing?",
    answer: "Navigate to the Marketplace, and if you are registered as a Farmer, you will see a 'Create Listing' button. Click it and fill out the form with your crop details, including type, quantity, price, and an image."
  },
  {
    question: "How can I change my role from Farmer to Buyer?",
    answer: "Click on your user profile icon in the top-right corner. In the dropdown menu, under 'Switch Role', you can select 'Buyer'. The app interface will update to show you relevant options."
  },
  {
    question: "What happens when I place an order?",
    answer: "Once you place an order, it will appear in your 'My Orders' page with a 'pending' status. The farmer will be notified. For delivery, you can go to your order and click 'Request Transport' to open the job to transporters."
  },
  {
    question: "How do I report an issue with an order?",
    answer: "Please contact our support team directly using the contact information on this page. Include your order ID and a description of the issue."
  }
]

export default function SupportPage() {
  const { setPageTitle } = useAppContext();

  useEffect(() => {
    setPageTitle('Help & Support');
  }, [setPageTitle]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <LifeBuoy className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
            <p className="text-muted-foreground">We're here to help you with any questions or issues.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>
                        Can't find the answer you're looking for? Reach out to us directly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">Email Support</p>
                            <a href="mailto:support@croptrade.com" className="text-sm text-muted-foreground hover:underline">support@croptrade.com</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">Phone Support</p>
                            <p className="text-sm text-muted-foreground">+1 (800) 555-0123</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
