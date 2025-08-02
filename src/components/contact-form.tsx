'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { sendContactEmail } from '@/ai/flows/send-contact-email';
import { useLanguage } from '@/hooks/use-language';

const createFormSchema = (dict: any) => z.object({
  name: z.string().min(2, { message: dict.contact.validation.nameRequired }),
  email: z.string().email({ message: dict.contact.validation.emailInvalid }),
  message: z.string().min(10, { message: dict.contact.validation.messageRequired }),
});


export function ContactForm() {
  const { dict } = useLanguage();
  const formSchema = createFormSchema(dict);
  type FormValues = z.infer<typeof formSchema>;

  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setFormStatus(null);
    try {
      const result = await sendContactEmail(values);
      if (result.success) {
        setFormStatus({ type: 'success', message: result.message });
        form.reset();
      } else {
        setFormStatus({ type: 'error', message: result.message || dict.contact.error.generic });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      const errorMessage = error instanceof z.ZodError 
        ? error.errors.map(e => e.message).join(' ') 
        : dict.contact.error.generic;
      setFormStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Mail className="h-6 w-6 text-primary"/>
            {dict.contact.title}
        </CardTitle>
        <CardDescription className="font-body">{dict.contact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-body">
          <div className="space-y-2">
            <Label htmlFor="name">{dict.contact.nameLabel}</Label>
            <Input id="name" {...form.register('name')} placeholder={dict.contact.namePlaceholder} disabled={isLoading} />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{dict.contact.emailLabel}</Label>
            <Input id="email" type="email" {...form.register('email')} placeholder={dict.contact.emailPlaceholder} disabled={isLoading} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{dict.contact.messageLabel}</Label>
            <Textarea id="message" {...form.register('message')} placeholder={dict.contact.messagePlaceholder} className="min-h-[120px]" disabled={isLoading} />
            {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
          </div>

          {formStatus && (
            <Alert variant={formStatus.type === 'error' ? 'destructive' : 'default'} className={formStatus.type === 'success' ? 'border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-500' : ''}>
                {formStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{formStatus.type === 'success' ? dict.contact.success.title : dict.contact.error.title}</AlertTitle>
                <AlertDescription>{formStatus.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isLoading ? dict.contact.sending : dict.contact.sendButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}