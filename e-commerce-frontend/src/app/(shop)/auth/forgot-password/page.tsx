/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useDataFetch from '@/hooks/use-data-fetch';
import { forgotPassword } from '@/services/auth';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isEmailSent, setIsEmailSent] = useState(false);

    const { request, isLoading } = useDataFetch(forgotPassword);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
        try {
            request(values).onSuccess(() => {
                setIsEmailSent(true);
            });
        } catch (error) {
            form.setError('email', {
                type: 'manual',
                message: 'Failed to send reset email. Please try again.'
            });
        }
    };

    if (isEmailSent) {
        return (
            <div className="container mx-auto py-10">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent you instructions to reset your password.
                            Please check your email inbox.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                onClick={() => router.push('/auth/login')}
                            >
                                Return to Login
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsEmailSent(false);
                                    form.reset();
                                }}
                            >
                                Try another email
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you instructions
                        to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between items-center">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push('/auth/login')}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}