/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogRef } from '@/components/ui/dialog';
import ShippingForm from './components/ShippingForm';
import { ShippingMethod, ShippingMethodDTO } from '@/types/domains/shipping_method';
import * as shippingServices from '@/services/shippingMethod';
import useDataFetch from '@/hooks/use-data-fetch';
import { Button } from '@/components/ui/button';
import ShippingItem from './components/ShippingItem';
import { toast } from "sonner";

export default function ShippingMethodsPage() {
    const addShippingMethodRef = useRef<DialogRef>(null);
    const editShippingMethodRef = useRef<DialogRef>(null);
    const deleteDialogRef = useRef<DialogRef>(null);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
    const [deleteShippingMethodId, setDeleteShippingMethodId] = useState<number | null>(null);
    
    const shippingMethodsData = useDataFetch(shippingServices.getAllShippingMethods);
    const addShippingMethod = useDataFetch(shippingServices.createShippingMethod);
    const editShippingMethod = useDataFetch(shippingServices.updateShippingMethod);
    const deleteShippingMethod = useDataFetch(shippingServices.deleteShippingMethod);

    useEffect(() => {
        shippingMethodsData.request();
    }, []);

  
    return <>
        <div className="h-full space-y-8 flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Shipping Methods</h1>
                <div className="flex justify-between items-center gap-4">
                    <Button variant="default" onClick={() => addShippingMethodRef.current?.open()}>
                        Add Shipping Method
                    </Button>
                </div>
            </div>
            {shippingMethodsData.hasError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                    Failed to load shipping methods. Please try again.
                </div>
            )}
            <div className="py-2 space-y-2">
                {shippingMethodsData.isLoading ?
                    <div className="space-y-2">
                        <div className="border rounded-md h-16 bg-gray-100 animate-pulse"></div>
                        <div className="border rounded-md h-16 bg-gray-100 animate-pulse"></div>
                        <div className="border rounded-md h-16 bg-gray-100 animate-pulse"></div>
                    </div> :
                    (!shippingMethodsData.hasError && (shippingMethodsData.data as ShippingMethod[])?.length) ? 
                        (shippingMethodsData.data as ShippingMethod[]).map((item, index) => 
                            <ShippingItem 
                                key={`shipping-method-${item.shippingMethodId}-${index}`}
                                shippingMethod={item}
                                onEdit={shippingMethod => {
                                    setSelectedShippingMethod(shippingMethod);
                                    editShippingMethodRef.current?.open();
                                }}
                                onDelete={shippingMethod => {
                                    setDeleteShippingMethodId(shippingMethod.shippingMethodId);
                                    deleteDialogRef.current?.open();
                                }}
                            />
                        ) :
                    !shippingMethodsData.hasError ? (
                        <div className="border rounded-md h-16 bg-background px-3.5 flex items-center text-gray-400">
                            No shipping methods created! Click the button above to create one now.
                        </div>
                    ) : null
                }
            </div>
        </div>

        <Dialog ref={addShippingMethodRef}>
            <DialogContent className="sm:max-w-[900px] max-w-[95vw] ">
                <DialogHeader className="mb-4">
                    <DialogTitle>Add Shipping Method</DialogTitle>
                    <DialogDescription>
                        Create a new shipping method with delivery options
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    <ShippingForm
                        loading={addShippingMethod.isLoading}
                        onSubmit={data => addShippingMethod.request(data)
                            .onSuccess(res => {
                                toast.success("Shipping method created successfully");
                                shippingMethodsData.request(); // Refresh the list
                                addShippingMethodRef.current?.close();
                            }).onError(() => {
                                toast.error("Failed to create shipping method");
                            })
                        }
                    />
                </div>
            </DialogContent>
        </Dialog>

        <Dialog ref={editShippingMethodRef}>
            <DialogContent className="sm:max-w-[900px] max-w-[95vw] ">
                <DialogHeader className="mb-4">
                    <DialogTitle>Edit Shipping Method</DialogTitle>
                    <DialogDescription>
                        Update the shipping method details and options
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    <ShippingForm
                        shippingMethod={selectedShippingMethod ? {
                            name: selectedShippingMethod.name,
                            originCountry: selectedShippingMethod.originCountry,
                            originPostalCode: selectedShippingMethod.originPostalCode,
                            processingTimeMin: selectedShippingMethod.processingTimeMin,
                            processingTimeMax: selectedShippingMethod.processingTimeMax,
                            shippingOptions: selectedShippingMethod.shippingOptions
                        } : undefined}
                        loading={editShippingMethod.isLoading}
                        onSubmit={(data: ShippingMethodDTO) => {
                            if (!selectedShippingMethod?.shippingMethodId) {
                                toast.error("No shipping method selected");
                                return;
                            }

                            editShippingMethod
                                .request(selectedShippingMethod.shippingMethodId, data)
                                .onSuccess(res => {
                                    toast.success("Shipping method updated successfully");
                                    shippingMethodsData.request(); // Refresh the list
                                    setSelectedShippingMethod(null);
                                    editShippingMethodRef.current?.close();
                                }).onError(() => {
                                    toast.error("Failed to update shipping method");
                                });
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>

        <Dialog ref={deleteDialogRef}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Shipping Method</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this shipping method? This action will also delete all its shipping options and cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => deleteDialogRef.current?.close()}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={deleteShippingMethod.isLoading}
                        onClick={() => {
                            if (!deleteShippingMethodId) {
                                toast.error("No shipping method selected for deletion");
                                return;
                            }

                            deleteShippingMethod.request(deleteShippingMethodId)
                                .onSuccess(() => {
                                    toast.success("Shipping method deleted successfully");
                                    shippingMethodsData.request(); // Refresh the list
                                    setDeleteShippingMethodId(null);
                                    deleteDialogRef.current?.close();
                                }).onError(() => {
                                    toast.error("Failed to delete shipping method");
                                });
                        }}
                    >
                        {deleteShippingMethod.isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>;
};