/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react/no-unescaped-entities */
"use client";

import useDataFetch from "@/hooks/use-data-fetch";
import * as paymentServices from "@/services/paymentMethod";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogRef,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { PaymentMethodDTO, PaymentMethod } from "@/types/domains/payment_method";
import { PaymentForm } from "./component/PaymentForm";
import { PaymentTable } from "./component/PaymentTable";

export default function PaymentsPage() {
   const paymentData = useDataFetch(paymentServices.getAllPaymentMethods, { defaultLoading: true });
   const createPaymentMethod = useDataFetch(paymentServices.createPaymentMethod);
   const deletePaymentMethod = useDataFetch(paymentServices.deletePaymentMethod);
   const updatePaymentMethod = useDataFetch(paymentServices.updatePaymentMethod);

   const createDialog = useRef<DialogRef>(null);
   const editDialog = useRef<DialogRef>(null);
   const deleteDialog = useRef<DialogRef>(null);
   const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
   const [deletingPayment, setDeletingPayment] = useState<PaymentMethod | null>(null);

   useEffect(() => {
      paymentData.request();
   }, []);

   const handleEdit = (method: PaymentMethod) => {
      setEditingPayment(method);
      editDialog.current?.open();
   };

   const handleEditSubmit = (data: any) => {
      if (editingPayment) {
         const submitData: PaymentMethodDTO = {
            last4: data.last4,
            providerToken: data.providerToken,
            expiryMonth: data.expiryMonth,
            expiryYear: data.expiryYear,
            isDefault: data.isDefault || false,
            cardHolderName: data.cardHolderName,
         };
         updatePaymentMethod
            .request(editingPayment.paymentMethodId, submitData)
            .onSuccess(() => {
               toast.success("Payment method updated successfully");
               paymentData.request();
               editDialog.current?.close();
               setEditingPayment(null);
            })
            .onError(() => {
               toast.error("Failed to update payment method");
            });
      }
   };

   const handleDelete = (paymentMethodId: number) => {
      const method = paymentData.data?.find((m: PaymentMethod) => m.paymentMethodId === paymentMethodId);
      if (method) {
         setDeletingPayment(method);
         deleteDialog.current?.open();
      }
   };

   const confirmDelete = () => {
      if (deletingPayment) {
         deletePaymentMethod
            .request(deletingPayment.paymentMethodId)
            .onSuccess(() => {
               toast.success("Payment method deleted successfully");
               paymentData.request();
               deleteDialog.current?.close();
               setDeletingPayment(null);
            })
            .onError(() => {
               toast.error("Failed to delete payment method: Server error");
            });
      }
   };

   const setDefaultPaymentMethod = (paymentMethodId: number) => {
      const method = paymentData.data?.find((m: PaymentMethod) => m.paymentMethodId === paymentMethodId);
      if (method) {
         const updatedMethod: PaymentMethodDTO = {
            last4: method.last4,
            providerToken: method.providerToken,
            expiryMonth: method.expiryMonth,
            expiryYear: method.expiryYear,
            isDefault: !method.isDefault,
            cardHolderName: method.cardHolderName,
         };
         updatePaymentMethod
            .request(paymentMethodId, updatedMethod)
            .onSuccess(() => {
               toast.success("Payment method updated successfully");
               paymentData.request();
            })
            .onError(() => {
               toast.error("Failed to update payment method");
            });
      }
   };

   return (
      <div className="space-y-8">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
            <div className="flex justify-between items-center gap-4">
               <Button variant="default" onClick={() => createDialog.current?.open()}>
                  Add Payment Method
               </Button>
            </div>
         </div>

         <div className="py-2">
            <PaymentTable
               isLoading={paymentData.isLoading}
               paymentData={paymentData.data || []}
               onEdit={handleEdit}
               onDelete={handleDelete}
               onSetDefault={setDefaultPaymentMethod}
            />
         </div>

         {/* Create Dialog */}
         <Dialog ref={createDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
               <DialogHeader className="mb-4">
                  <DialogTitle>Create Payment Method</DialogTitle>
                  <DialogDescription>Add a new payment method for your store</DialogDescription>
               </DialogHeader>
               <PaymentForm
                  mode="create"
                  loading={createPaymentMethod.isLoading}
                  onSubmit={(data) => {
                     const submitData: PaymentMethodDTO = {
                        last4: data.last4!,
                        providerToken: data.providerToken!,
                        expiryMonth: data.expiryMonth,
                        expiryYear: data.expiryYear,
                        isDefault: data.isDefault || false,
                        cardHolderName: data.cardHolderName,
                     };
                     createPaymentMethod
                        .request(submitData)
                        .onSuccess(() => {
                           toast.success("Payment method created successfully");
                           paymentData.request();
                           createDialog.current?.close();
                        })
                        .onError(() => {
                           toast.error("Create payment method failed");
                        });
                  }}
                  onCancel={() => createDialog.current?.close()}
               />
            </DialogContent>
         </Dialog>

         {/* Edit Dialog */}
         <Dialog ref={editDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
               <DialogHeader className="mb-4">
                  <DialogTitle>Edit Payment Method</DialogTitle>
                  <DialogDescription>Update the payment method details</DialogDescription>
               </DialogHeader>
               <PaymentForm
                  mode="edit"
                  loading={updatePaymentMethod.isLoading}
                  onSubmit={handleEditSubmit}
                  onCancel={() => editDialog.current?.close()}
                  paymentData={
                     editingPayment
                        ? {
                             cardNumber: "",
                             last4: editingPayment.last4,
                             providerToken: editingPayment.providerToken,
                             expiryMonth: editingPayment.expiryMonth,
                             expiryYear: editingPayment.expiryYear,
                             isDefault: editingPayment.isDefault || false,
                             cardHolderName: editingPayment.cardHolderName,
                          }
                        : undefined
                  }
               />
            </DialogContent>
         </Dialog>

         {/* Delete Dialog */}
         <Dialog ref={deleteDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Delete Payment Method</DialogTitle>
                  <DialogDescription>
                     Are you sure you want to delete "{deletingPayment?.cardHolderName}"? This action cannot be undone.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => deleteDialog.current?.close()}>
                     Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete} disabled={deletePaymentMethod.isLoading}>
                     {deletePaymentMethod.isLoading ? "Deleting..." : "Delete"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
