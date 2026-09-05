"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderId
}: OrderSuccessModalProps) {
  const router = useRouter();

  if (!orderId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 text-center">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">🎉 Thank You for Your Purchase!</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Your order #{orderId} has been placed successfully.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/products")}
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
          <Button 
            onClick={() => router.push(`/orders/${orderId}`)}
            className="w-full sm:w-auto"
          >
            View Order Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}   