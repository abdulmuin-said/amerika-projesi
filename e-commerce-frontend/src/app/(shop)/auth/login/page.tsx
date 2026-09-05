/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { TokenPayload } from '@/types/domains/auth';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loading, authenticated } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const returnUrl = useMemo(() => searchParams.get('returnUrl') || searchParams.get('redirect') || '/', [searchParams]);

    useEffect(() => {
        if (!loading && authenticated) {
            toast.success('You are logged in!', { icon: null, richColors: true });
            router.push(returnUrl);
        }
    }, [loading, authenticated, returnUrl, router]);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        try {
            const result = await dispatch(login(values));
            if (result.meta.requestStatus === 'fulfilled') {
                localStorage.setItem("expiresAt", String((result.payload as TokenPayload).expiresAt));
                router.push(returnUrl);
            } else {
                form.setError('root', {
                    type: 'manual',
                    message: result.payload as string
                });
            }
        } catch (error) {
            form.setError('root', {
                type: 'manual',
                message: 'An error occurred. Please check the credentials and try again.'
            });
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
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
                                            <Input type="email" placeholder="john@example.com" {...field} />
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
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.formState.errors.root && (
                                <div className="text-sm font-medium text-destructive">
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push('/auth/forgot-password')}
                                >
                                    Forgot password?
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push('/auth/register')}
                                >
                                    Create account
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto py-10 flex justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full animate-pulse bg-primary"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse bg-primary" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-4 h-4 rounded-full animate-pulse bg-primary" style={{ animationDelay: "0.4s" }}></div>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}