'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Mic, Send, Volume2, Loader2, CornerDownLeft, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/context/app-context';
import { useUser } from '@/firebase';
import { handleAskAgronomist, handleTextToSpeech } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

type Message = {
  role: 'user' | 'model';
  content: string;
};

type SpeechRecognition = (typeof window)['SpeechRecognition'] | (typeof window)['webkitSpeechRecognition'];
let recognition: InstanceType<SpeechRecognition> | null = null;
if (typeof window !== 'undefined') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useAppContext();
  const { user } = useUser();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (!recognition) return;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSubmit(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error !== 'no-speech') {
            setError(`Speech Recognition Error: ${event.error}`);
        }
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };
  }, [handleSubmit]);
  
  const handleVoiceInput = () => {
    if (!recognition) {
        setError("Voice recognition is not supported by your browser.");
        return;
    }

    if (isListening) {
        recognition.stop();
        setIsListening(false);
    } else {
        setError(null);
        setIsListening(true);
        recognition.lang = languageToLocale(language);
        recognition.start();
    }
  };


  const playAudio = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
        const response = await handleTextToSpeech({ text });
        if (response.data?.audioDataUri) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(response.data.audioDataUri);
            audioRef.current = audio;
            audio.play();
            audio.onended = () => setIsSpeaking(false);
        } else {
            throw new Error(response.message || 'Failed to generate audio.');
        }
    } catch (e: any) {
        setError(`Text-to-speech failed: ${e.message}`);
        setIsSpeaking(false);
    }
  }, []);

  const handleSubmit = useCallback(async (value: string) => {
    if (!value.trim() || !user) return;
    
    setError(null);
    const newMessages: Message[] = [...messages, { role: 'user', content: value }];
    setMessages(newMessages);
    setInput('');
    setIsPending(true);
    
    const historyForAI = newMessages.map(msg => ({
      role: msg.role,
      content: [{ text: msg.content }]
    }));

    const response = await handleAskAgronomist({
      question: value,
      language: language,
      userId: user.uid,
      history: JSON.stringify(historyForAI),
    });
    
    if (response.data?.answer) {
      const aiResponse = response.data.answer;
      setMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
      await playAudio(aiResponse);
    } else {
      setError(response.message.replace('error:', ''));
    }
    
    setIsPending(false);
  }, [messages, user, language, playAudio]);
  
  const languageToLocale = (lang: string) => {
      const locales: { [key: string]: string } = {
          'English': 'en-US',
          'Hindi': 'hi-IN',
          'Kannada': 'kn-IN',
          'Tamil': 'ta-IN',
          'Telugu': 'te-IN',
          'Malayalam': 'ml-IN',
      };
      return locales[lang] || 'en-US';
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl flex flex-col z-50 animate-in fade-in-25 slide-in-from-bottom-5">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="font-headline">Agri, your AI Agronomist</CardTitle>
          <CardDescription>Ask me anything about farming!</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close chat</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-0">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                {message.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                <div className={cn("p-3 rounded-lg max-w-[80%]", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isPending && (
                <div className="flex items-start gap-3">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="p-3 rounded-lg bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(input); }}
              placeholder="Ask a question..."
              className="pr-20"
              disabled={isPending}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button variant="ghost" size="icon" onClick={handleVoiceInput} disabled={!recognition || isPending}>
                <Mic className={cn("h-5 w-5", isListening && "text-destructive animate-pulse")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleSubmit(input)} disabled={isPending}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
