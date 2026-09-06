/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useLocalization } from '@/lib/useLocalization';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { t, locale } = useLocalization();

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
                message: locale === 'tr' ? 'Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.' : 'Failed to send reset email. Please try again.'
            });
        }
    };

    if (isEmailSent) {
        return (
            <div className="container mx-auto py-10">
                <Card className="max-w-md mx-auto shadow-sm border-stone-200">
                    <CardHeader>
                        <CardTitle className="font-serif text-2xl">{locale === 'tr' ? 'E-Postanızı Kontrol Edin' : 'Check Your Email'}</CardTitle>
                        <CardDescription>
                            {locale === 'tr'
                                ? 'Şifrenizi sıfırlamanız için gerekli talimatları e-posta adresinize gönderdik. Lütfen gelen kutunuzu kontrol edin.'
                                : "We've sent you instructions to reset your password. Please check your email inbox."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                onClick={() => router.push('/auth/login')}
                            >
                                {locale === 'tr' ? 'Girişe Dön' : 'Return to Login'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsEmailSent(false);
                                    form.reset();
                                }}
                            >
                                {locale === 'tr' ? 'Başka bir e-posta dene' : 'Try another email'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-md mx-auto shadow-sm border-stone-200">
                <CardHeader>
                    <CardTitle className="font-serif text-2xl">{t("auth.resetPasswordTitle")}</CardTitle>
                    <CardDescription>
                        {locale === 'tr'
                            ? 'Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısını hemen gönderelim.'
                            : "Enter your email address and we'll send you instructions to reset your password."}
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
                                        <FormLabel>{t("auth.emailLabel")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t("auth.emailPlaceholder")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    {isLoading ? (locale === 'tr' ? 'Gönderiliyor...' : 'Sending...') : t("auth.sendResetLink")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push('/auth/login')}
                                >
                                    {locale === 'tr' ? 'Girişe Dön' : 'Back to Login'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}