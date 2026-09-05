import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentMethod } from "@/types/domains/payment_method";
import { CreditCard, Edit, Trash2 } from "lucide-react";

interface PaymentTableProps {
   paymentData: PaymentMethod[];
   isLoading: boolean;
   onEdit?: (payment: PaymentMethod) => void;
   onDelete?: (paymentMethodId: number) => void;
   onSetDefault?: (paymentMethodId: number) => void;
}

export function PaymentTable({ paymentData, isLoading, onEdit, onDelete, onSetDefault }: PaymentTableProps) {
   const handleEdit = (payment: PaymentMethod) => {
      if (onEdit) {
         onEdit(payment);
      }
   };

   const handleDefaultChange = (paymentMethodId: number) => {
      if (onSetDefault) {
         onSetDefault(paymentMethodId);
      }
   };

   const getPaymentIcon = (paymentType: string) => {
      switch (paymentType.toLowerCase()) {
         case "credit card":
         case "debit card":
            return <CreditCard className="h-4 w-4" />;
         default:
            return <CreditCard className="h-4 w-4" />;
      }
   };

   return (
      <div>
         <Card>
            <CardContent className="p-0">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>
                           <div className="flex gap-4">
                              <div className="w-4"></div> Account Details{" "}
                           </div>
                        </TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                           <TableRow key={index}>
                              <TableCell className="py-3">
                                 <Skeleton className="h-6 w-full" />
                              </TableCell>
                              <TableCell className="py-3">
                                 <Skeleton className="h-6 w-full" />
                              </TableCell>
                              <TableCell className="py-3">
                                 <Skeleton className="h-6 w-full" />
                              </TableCell>
                           </TableRow>
                        ))
                     ) : paymentData.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                 <CreditCard className="h-8 w-8 text-muted-foreground" />
                                 <p className="text-muted-foreground">No payment methods configured</p>
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        paymentData.map((payment) => (
                           <TableRow key={payment.paymentMethodId}>
                              <TableCell className="font-medium">
                                 <div className="flex items-center gap-4">
                                    {getPaymentIcon("credit card")}
                                    <div>
                                       <div>{payment.cardHolderName}</div>
                                       <div className="text-gray-400">
                                          XXXX XXXX XXXX {payment.last4} <span className="mx-1">|</span> {payment.expiryMonth}/
                                          {payment.expiryYear}
                                       </div>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-2">
                                    <Switch
                                       className="cursor-pointer"
                                       checked={payment.isDefault}
                                       onCheckedChange={() => handleDefaultChange(payment.paymentMethodId)}
                                    />
                                    {payment.isDefault ? (
                                       <Badge variant={"default"}>{payment.isDefault ? "Default" : "Set as default"}</Badge>
                                    ) : null}
                                 </div>
                              </TableCell>
                              <TableCell className="text-right">
                                 <div className="flex gap-2 justify-end">
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleEdit(payment)}
                                       title="Edit payment method"
                                    >
                                       <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       className="text-red-600 hover:text-red-700"
                                       onClick={() => onDelete?.(payment.paymentMethodId)}
                                       title="Delete payment method"
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
   );
}
