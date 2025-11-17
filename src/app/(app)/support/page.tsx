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

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    );
}

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
                    <div className="flex items-center gap-4">
                        <WhatsAppIcon className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">WhatsApp Support</p>
                            <a href="https://wa.me/6379319121" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">+91 63793 19121</a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
