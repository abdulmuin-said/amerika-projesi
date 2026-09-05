/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShippingMethod } from "@/types/domains/shipping_method";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CartItemPreview } from "@/types/domains/cart";
import { Address } from "@/types/domains/address";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { CreditCard, Truck, MapPin, Home, ShieldCheck, Sparkles, Lock } from "lucide-react";
import { CreatePaymentIntentRequest } from "@/services/stripe";
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon } from "@/app/components/PaymentBadges";

// ─── Validation schema ────────────────────────────────────────────────────────

const checkoutSchema = z.object({
    addressType: z.enum(["current", "custom"]),
    shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        pincode: z.string(),
        country: z.string(),
    }).optional(),
    cardHolderName: z.string().min(2, "Cardholder name is required"),
    cardNumber: z.string()
        .min(13, "Card number must be at least 13 digits")
        .max(19, "Card number too long")
        .regex(/^[\d\s]+$/, "Card number must contain only digits"),
    expireMonth: z.string()
        .length(2, "Enter 2-digit month")
        .regex(/^(0[1-9]|1[0-2])$/, "Invalid month (01-12)"),
    expireYear: z.string()
        .length(2, "Enter 2-digit year")
        .regex(/^\d{2}$/, "Invalid year"),
    cvc: z.string()
        .min(3, "CVC must be 3-4 digits")
        .max(4, "CVC must be 3-4 digits")
        .regex(/^\d+$/, "CVC must contain only digits"),
});

type FieldValues = z.infer<typeof checkoutSchema>;

// ─── Card type detection ──────────────────────────────────────────────────────

function detectCardType(cardNumber: string): { label: string; color: string } | null {
    const num = cardNumber.replace(/\s/g, "");
    if (/^4/.test(num)) return { label: "Visa", color: "text-blue-600 font-semibold" };
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return { label: "Mastercard", color: "text-orange-600 font-semibold" };
    if (/^3[47]/.test(num)) return { label: "Amex", color: "text-emerald-600 font-semibold" };
    if (/^6(?:011|5)/.test(num)) return { label: "Discover", color: "text-amber-600 font-semibold" };
    return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CheckoutFormSubmitData {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    intentRequest: CreatePaymentIntentRequest;
}

interface CheckoutFormProps {
    cartItems: CartItemPreview[];
    shippingMethods: Record<number, ShippingMethod>;
    loading: boolean;
    subtotalAmount: number;
    onSubmit: (data: CheckoutFormSubmitData) => void;
    currentAddress?: Address;
}

export default function CheckoutForm({
    cartItems,
    shippingMethods,
    loading,
    onSubmit,
    subtotalAmount,
    currentAddress,
}: CheckoutFormProps) {
    function calculateShipping(): number {
        let total = 0;
        cartItems.forEach((item) => {
            const method = shippingMethods[item.cartItemId];
            if (!method) return;
            const option = method.shippingOptions[0];
            if (!option) return;
            let charge = option.costFirstItem;
            if (option.costAdditionalItem > 0 && item.quantity > 1) {
                charge += (item.quantity - 1) * option.costAdditionalItem;
            }
            total += charge;
        });
        return total;
    }

    const shippingAmount = calculateShipping();
    const taxAmount = 0;
    const discountAmount = 0;
    const billTotal = subtotalAmount + shippingAmount + taxAmount - discountAmount;

    const form = useForm<FieldValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(checkoutSchema) as any,
        defaultValues: {
            addressType: "current",
            shippingAddress: { street: "", city: "", pincode: "", country: "United States" },
            cardHolderName: "",
            cardNumber: "",
            expireMonth: "",
            expireYear: "",
            cvc: "",
        },
    });

    const cardNumber = form.watch("cardNumber");
    const cardType = detectCardType(cardNumber);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\D/g, "").slice(0, 16);
        const parts: string[] = [];
        for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
        return parts.join(" ");
    };

    const handleAutoFillTestCard = () => {
        form.setValue("cardHolderName", "Jane Doe", { shouldValidate: true });
        form.setValue("cardNumber", "4242 4242 4242 4242", { shouldValidate: true });
        form.setValue("expireMonth", "12", { shouldValidate: true });
        form.setValue("expireYear", "28", { shouldValidate: true });
        form.setValue("cvc", "123", { shouldValidate: true });
        toast.success("Stripe 4242 test card details loaded!");
    };

    const handleSubmit = (data: FieldValues) => {
        if (data.addressType === "custom") {
            const s = data.shippingAddress;
            const missing: string[] = [];
            if (!s?.street?.trim()) missing.push("Street");
            if (!s?.city?.trim()) missing.push("City");
            if (!s?.pincode?.trim() || isNaN(Number(s.pincode))) missing.push("ZIP / Postal Code");
            if (!s?.country?.trim()) missing.push("Country");
            if (missing.length > 0) {
                toast.error(`Please fill: ${missing.join(", ")}`);
                return;
            }
        }

        const missingShipping = cartItems.filter(
            (item) => !shippingMethods[item.cartItemId]?.shippingMethodId
        );
        if (missingShipping.length > 0) {
            toast.error("Shipping method loading. Please wait a moment and try again.");
            return;
        }

        let shippingAddressId: number | undefined;
        let shippingAddressObj: { street: string; city: string; pincode: number; country: string } | undefined;

        if (data.addressType === "current" && currentAddress) {
            if (currentAddress.addressId) {
                shippingAddressId = currentAddress.addressId;
            } else {
                shippingAddressObj = {
                    street: currentAddress.street ?? "",
                    city: currentAddress.city ?? "",
                    pincode: Number(currentAddress.pincode || 10001),
                    country: currentAddress.country ?? "United States",
                };
            }
        } else if (data.addressType === "custom" && data.shippingAddress) {
            shippingAddressObj = {
                street: data.shippingAddress.street,
                city: data.shippingAddress.city,
                pincode: Number(data.shippingAddress.pincode),
                country: data.shippingAddress.country,
            };
        } else {
            // Default demo address fallback
            shippingAddressObj = {
                street: "742 Evergreen Terrace",
                city: "New York",
                pincode: 10001,
                country: "United States",
            };
        }

        const intentRequest: CreatePaymentIntentRequest = {
            items: cartItems.map((item) => ({
                productVariantId: item.productVariantId,
                shippingMethodId: shippingMethods[item.cartItemId]?.shippingMethodId || 1,
                price: item.price,
                quantity: item.quantity,
                productName: (item as { productName?: string }).productName ?? "NovaCanvas Artwork",
                categoryName: "Canvas Prints",
            })),
            shippingAddressId,
            shippingAddress: shippingAddressObj,
            subtotalAmount,
            shippingAmount,
            taxAmount,
            discountAmount,
            totalAmount: billTotal,
        };

        onSubmit({
            cardHolderName: data.cardHolderName,
            cardNumber: data.cardNumber.replace(/\s/g, ""),
            expireMonth: data.expireMonth,
            expireYear: data.expireYear,
            cvc: data.cvc,
            intentRequest,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* ── Left Side ── */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">Checkout</h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">Stripe 256-Bit SSL Encrypted</span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">1. Shipping Address</h3>
                            <RadioGroup
                                value={form.watch("addressType")}
                                onValueChange={(v: "current" | "custom") => form.setValue("addressType", v)}
                                className="flex space-x-4"
                            >
                                <Label
                                    htmlFor="current"
                                    className={`flex items-center justify-center space-x-3 p-4 border rounded-xl bg-white hover:bg-gray-50 cursor-pointer flex-1 transition-colors ${
                                        form.watch("addressType") === "current" ? "border-black shadow-sm bg-gray-50" : "border-gray-200"
                                    }`}
                                >
                                    <RadioGroupItem value="current" id="current" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <Home className="h-4 w-4 text-gray-700" />
                                            Primary Address
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {currentAddress?.street
                                                ? `${currentAddress.street}, ${currentAddress.city}`
                                                : "742 Evergreen Terrace, New York, NY"}
                                        </p>
                                    </div>
                                </Label>

                                <Label
                                    htmlFor="custom"
                                    className={`flex items-center justify-center space-x-3 p-4 border rounded-xl bg-white hover:bg-gray-50 cursor-pointer flex-1 transition-colors ${
                                        form.watch("addressType") === "custom" ? "border-black shadow-sm bg-gray-50" : "border-gray-200"
                                    }`}
                                >
                                    <RadioGroupItem value="custom" id="custom" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <MapPin className="h-4 w-4 text-gray-700" />
                                            Alternate US Address
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Deliver to a new location</p>
                                    </div>
                                </Label>
                            </RadioGroup>

                            {form.watch("addressType") === "custom" && (
                                <div className="p-5 border rounded-xl bg-white space-y-4 shadow-sm">
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.street"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Gallery Ave, Suite 400" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl><Input placeholder="Los Angeles" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shippingAddress.pincode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ZIP / Postal Code</FormLabel>
                                                    <FormControl><Input placeholder="90001" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value || "United States"} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {COUNTRY_OPTIONS.map(({ value, label }) => (
                                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Payment Card */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">2. Payment Method</h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="font-semibold text-slate-700">Powered by</span>
                                    <span className="font-extrabold text-[#635BFF] text-sm tracking-tight">stripe</span>
                                </div>
                            </div>

                            <div className="p-6 border rounded-xl shadow-sm bg-white space-y-5">
                                {/* Demo Test Card Autofill Helper */}
                                <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-indigo-950 font-semibold text-sm">
                                            <Sparkles className="w-4 h-4 text-indigo-600" />
                                            Live Showcase Sandbox Card
                                        </div>
                                        <p className="text-xs text-indigo-700 mt-0.5">
                                            Test live checkout using standard Stripe card <span className="font-mono font-medium">4242 •••• •••• 4242</span>
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAutoFillTestCard}
                                        className="bg-white hover:bg-indigo-50 border-indigo-300 text-indigo-700 font-medium text-xs whitespace-nowrap shadow-sm"
                                    >
                                        Auto-Fill Test Card
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-gray-600" />
                                        <h4 className="font-medium text-gray-900">Card Information</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {cardType ? (
                                            <span className={`text-sm ${cardType.color}`}>
                                                {cardType.label}
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex items-center justify-center h-5 w-8 rounded bg-white shadow-2xs border border-stone-200 overflow-hidden" title="Visa"><VisaIcon className="h-3.5 w-auto" /></span>
                                                <span className="inline-flex items-center justify-center h-5 w-8 rounded bg-white shadow-2xs border border-stone-200 overflow-hidden" title="Mastercard"><MastercardIcon className="h-3.5 w-auto" /></span>
                                                <span className="inline-flex items-center justify-center h-5 w-8 rounded bg-white shadow-2xs border border-stone-200 overflow-hidden" title="American Express"><AmexIcon className="h-3.5 w-auto" /></span>
                                                <span className="inline-flex items-center justify-center h-5 w-8 rounded bg-white shadow-2xs border border-stone-200 overflow-hidden" title="Discover"><DiscoverIcon className="h-3.5 w-auto" /></span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="cardHolderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name on Card</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Jane Doe" autoComplete="off" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cardNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Card Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="4242 4242 4242 4242"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    className="font-mono tracking-widest text-base"
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                                                    maxLength={19}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="expireMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exp Month</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12" inputMode="numeric" autoComplete="off" className="font-mono text-center" maxLength={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expireYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exp Year</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="28" inputMode="numeric" autoComplete="off" className="font-mono text-center" maxLength={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cvc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CVC / CVV</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="123" inputMode="numeric" autoComplete="off" className="font-mono text-center" maxLength={4} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-3 text-xs text-gray-500 border-t">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                    <span>
                                        Protected with Stripe TLS encryption and PCI-DSS Level 1 certification. Card details are securely tokenized.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Side Summary ── */}
                    <div className="space-y-6">
                        <Card className="sticky top-20 shadow-md border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold font-serif">Order Summary</CardTitle>
                                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Truck className="h-4 w-4 text-slate-800" />
                                        <span className="font-semibold text-sm text-slate-900">FedEx Ground Delivery</span>
                                    </div>
                                    <p className="text-xs text-slate-600">Delivered within 3-5 business days with insured art packaging</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${subtotalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">US Standard Shipping</span>
                                    <span className="font-medium">
                                        {shippingAmount === 0 ? (
                                            <span className="text-emerald-600 font-semibold">FREE</span>
                                        ) : (
                                            `$${shippingAmount.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Estimated Sales Tax</span>
                                    <span className="font-medium">$0.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total Due</span>
                                    <span className="font-serif">${billTotal.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-950 hover:bg-slate-800 text-white py-6 text-base font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="mr-2 h-5 w-5" />
                                            Complete Order (${billTotal.toFixed(2)})
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
