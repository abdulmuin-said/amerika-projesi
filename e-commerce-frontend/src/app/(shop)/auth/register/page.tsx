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
import { register as registerService } from '@/services/auth';
import type { RegistrationPayload } from '@/types/domains/auth';
import { useLocalization } from '@/lib/useLocalization';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNo: z.string().min(10, 'Phone number must be at least 10 characters'),
    address: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        country: z.string().min(1, 'Country is required'),
        zipCode: z.string().min(1, 'Zip code is required')
    })
});

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { t, locale } = useLocalization();

    const { request, isLoading } = useDataFetch(registerService);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            fullName: '',
            phoneNo: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            }
        }
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        setError(null);
        try {
            const payload: RegistrationPayload = {
                ...values,
                roleId: 3, // Customer role
                address: {
                    ...values.address,
                    pincode: Number(values.address.zipCode)
                }
            };
            request(payload).onSuccess(() => {
                router.push('/auth/login?registered=true');
            });
        } catch (err) {
            setError(locale === 'tr' ? 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.' : 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-lg mx-auto shadow-sm border-stone-200">
                <CardHeader>
                    <CardTitle className="font-serif text-2xl">{t("auth.registerTitle")}</CardTitle>
                    <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("auth.fullNameLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("auth.fullNamePlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("auth.emailLabel")}</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder={t("auth.emailPlaceholder")} {...field} />
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
                                        <FormLabel>{t("auth.passwordLabel")}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder={t("auth.passwordPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{locale === "tr" ? "Telefon Numarası" : "Phone Number"}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 555 019 2834" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">{t("checkout.shippingAddress")}</h3>
                                <FormField
                                    control={form.control}
                                    name="address.street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("checkout.street")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={locale === "tr" ? "Bağdat Cad. No: 12" : "123 Main St"} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address.city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("checkout.city")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={locale === "tr" ? "İstanbul" : "New York"} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{locale === "tr" ? "Eyalet / İl" : "State / Province"}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={locale === "tr" ? "Kadıköy" : "NY"} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("checkout.country")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={locale === "tr" ? "Türkiye" : "United States"} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.zipCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("checkout.pincode")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={locale === "tr" ? "34710" : "10001"} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm font-medium text-destructive">{error}</div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    {isLoading ? (locale === 'tr' ? 'Kayıt yapılıyor...' : 'Creating Account...') : t("auth.registerButton")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push('/auth/login')}
                                >
                                    {t("auth.alreadyHaveAccount")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}