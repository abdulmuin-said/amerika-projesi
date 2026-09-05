/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, saveMyInformation } from "@/store/slices/authSlice";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import useDataFetch from "@/hooks/use-data-fetch";
import { changePassword, deleteAccount } from "@/services/auth";

const accountInfoSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNo: z.string().min(10, "Phone number must be at least 10 digits"),
    street: z.string().min(5, "Street address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
    pincode: z.string().min(6, "PIN code must be at least 6 characters"),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters"),
        // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        // .regex(/[0-9]/, "Password must contain at least one number")
        // .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

const deleteAccountSchema = z.object({
    password: z.string().nonempty("Please enter your password.")
});

export default function AccountSettings() {
    const dispatch = useAppDispatch();
    const { user, loading, authenticated } = useAppSelector(state => state.auth);
    const passwordChange = useDataFetch(changePassword);
    const accountDelete = useDataFetch(deleteAccount);

    const accountInfoForm = useForm<z.infer<typeof accountInfoSchema>>({
        resolver: zodResolver(accountInfoSchema),
        defaultValues: {
            fullName: user?.fullName || "",
            email: user?.email || "",
            phoneNo: user?.phoneNo || "",
            street: user?.address?.street || "",
            city: user?.address?.city || "",
            country: user?.address?.country || "",
            pincode: user?.address?.pincode ? String(user.address.pincode) : "",
        },
    });

    const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    const deleteAccountForm = useForm<z.infer<typeof deleteAccountSchema>>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            password: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof accountInfoSchema>) => {
        const formattedValues = {
            ...values,
            address: {
                street: values.street,
                city: values.city,
                country: values.country,
                pincode: Number(values.pincode),
            },
        };
        const res = await dispatch(saveMyInformation(formattedValues));
        if (res.meta.requestStatus === "fulfilled")
            toast.success("Profile updated successfully");
        else
            toast.error(res.payload as string);
    };

    const onPasswordSubmit = (values: z.infer<typeof changePasswordSchema>) => {
        passwordChange.request({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
        }).onSuccess(() => {
            toast.success("Password updated successfully");
            passwordForm.reset();
            dispatch(logout());
        });
    };

    const handleDeleteAccount = (values: z.infer<typeof deleteAccountSchema>) => {
        accountDelete.request(values).onSuccess(() => {
            toast.success("Your account has been successfully deleted!");
        });
    };

    useEffect(() => {
        if (!loading && authenticated) {
            accountInfoForm.reset({
                fullName: user?.fullName || "",
                email: user?.email || "",
                phoneNo: user?.phoneNo || "",
                street: user?.address?.street || "",
                city: user?.address?.city || "",
                country: user?.address?.country || "",
                pincode: user?.address?.pincode ? String(user.address.pincode) : "",
            });
        }
    }, [loading, authenticated]);

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl">
            <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 shadow-sm">
                <Form {...accountInfoForm}>
                    <form onSubmit={accountInfoForm.handleSubmit(onSubmit)} className="space-y-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={accountInfoForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={accountInfoForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={accountInfoForm.control}
                                name="phoneNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={accountInfoForm.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your street address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={accountInfoForm.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your city" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={accountInfoForm.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={accountInfoForm.control}
                                name="pincode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PIN Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your PIN code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-black text-white font-medium shadow-md hover:from-gray-900 hover:to-black transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8 max-w-full md:max-w-1/2 pr-3">
                        <div className="space-y-6">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter current password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel >New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter new password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Confirm new password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-black text-white font-medium shadow-md hover:from-gray-900 hover:to-black transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Update Password
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-2xl font-semibold text-red-600 mb-6">Delete Account</h2>
                <Form {...deleteAccountForm}>
                    <form onSubmit={deleteAccountForm.handleSubmit(handleDeleteAccount)} className="space-y-6 max-w-full md:max-w-1/2 pr-3">
                        <FormField
                            control={deleteAccountForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                            // className="mb-4"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        >
                        </FormField>
                        <p className="text-gray-600 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button
                            type="submit"
                            variant="destructive"
                            className="px-6 py-2.5 text-white font-medium shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Delete Account
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}