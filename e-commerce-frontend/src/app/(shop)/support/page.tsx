/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createSupportTicket } from '@/services/supportTicket';
import { SupportTicketDTO } from '@/types/domains/support_ticket';

const formSchema = z.object({
    subject: z.string().min(1, 'Subject is required').max(100, 'Subject is too long'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
});

export default function SupportPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: '',
            description: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true);
            const supportTicketDto: SupportTicketDTO = {
                subject: values.subject,
                description: values.description,
                status: 'OPEN',
            };

            await createSupportTicket(supportTicketDto);

            setMessage({ type: 'success', text: 'Your support ticket has been submitted successfully.' });
            form.reset();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit support ticket. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Support</CardTitle>
                    <CardDescription>
                        Submit a support ticket and we'll get back to you as soon as possible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {message && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter the subject of your inquiry" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your issue in detail"
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}