'use client';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { handleAskAgronomist, handleTextToSpeech } from '@/app/actions';
import { Bot, User, Send, Loader2, Mic, StopCircle, Volume2, MessageSquare, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

let currentAudio: HTMLAudioElement | null = null;
let recognition: any = null;

export default function AIAssistantWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        stopListening();
        setTimeout(() => {
            document.getElementById('ai-agent-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 300);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: event.error === 'not-allowed' ? 'Microphone access was denied.' : `An error occurred: ${event.error}`,
        });
        stopListening();
      };
    }

    return () => {
      if(recognition) {
        recognition.abort();
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    }
  }, [toast]);
  
  const startListening = () => {
    if (!recognition) {
        toast({
          variant: 'destructive',
          title: 'Unsupported Feature',
          description: 'Your browser does not support speech recognition.',
        });
        return;
    }
    if (isListening) return;
    try {
        recognition.start();
        setIsListening(true);
    } catch (e) {
        console.error("Could not start recognition", e);
        toast({
          variant: 'destructive',
          title: 'Could not start listening',
          description: 'Please ensure microphone permissions are enabled.',
        });
    }
  };

  const stopListening = () => {
    if (!isListening || !recognition) return;
    recognition.stop();
    setIsListening(false);
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const playAudio = async (text: string) => {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
    }
    try {
        const audioResponse = await handleTextToSpeech(text);
        if (audioResponse.data?.audioUrl) {
            const audio = new Audio(audioResponse.data.audioUrl);
            currentAudio = audio;
            audio.play().catch(e => console.error("Audio playback failed", e));
        } else {
             throw new Error(audioResponse.message || 'Failed to generate audio.');
        }
    } catch (error) {
        console.error('TTS Error:', error);
        toast({
            variant: 'destructive',
            title: 'Text-to-Speech Failed',
            description: 'Could not play the assistant\'s response.',
        })
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await handleAskAgronomist(input);
      if (response.data) {
        const assistantMessage: Message = { role: 'assistant', content: response.data.answer };
        setMessages(prev => [...prev, assistantMessage]);
        await playAudio(response.data.answer);
      } else {
        const errorMessage: Message = { role: 'assistant', content: response.message || 'Sorry, I had trouble getting an answer. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: 'An unexpected error occurred. Please check the console.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    )
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Card className="w-[400px] h-[600px] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className='flex items-center gap-2'>
            <MessageSquare className="text-primary" />
            <CardTitle className="font-headline text-xl">
                AI Voice Assistant
            </CardTitle>
          </div>
           <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-0">
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                  <Bot className="mx-auto h-12 w-12 text-gray-400"/>
                  <p className="mt-4 text-sm">Ask me anything about farming!</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : '')}>
                   {message.role === 'assistant' && (
                     <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                     </Avatar>
                   )}
                  <div className={cn('max-w-xs rounded-lg p-3 relative group', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => playAudio(message.content)}
                        >
                           <Volume2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                     </Avatar>
                   )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs rounded-lg p-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form id="ai-agent-form" onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type or click the mic..."
                disabled={isLoading || isListening}
                className="flex-grow"
              />
               <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={isListening ? stopListening : startListening} disabled={isLoading}>
                    {isListening ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5"/>}
                    <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                </Button>
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
                 <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
