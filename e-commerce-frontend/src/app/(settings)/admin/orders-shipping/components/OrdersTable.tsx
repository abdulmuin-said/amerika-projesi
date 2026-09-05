"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Edit, Package, User, Calendar, DollarSign, Eye } from "lucide-react";
import { OrderPreviewDTO, OrderStatus } from "@/types/domains/order";

interface OrdersTableProps {
  ordersData: OrderPreviewDTO[];
  isLoading?: boolean;
  onEdit?: (order: OrderPreviewDTO) => void;
  onViewDetails?: (orderId: number) => void;
}

export default function OrdersTable({
  ordersData,
  isLoading = false,
  onEdit,
  onViewDetails
}: OrdersTableProps) {

  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case OrderStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case OrderStatus.PROCESSING:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case OrderStatus.SHIPPED:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case OrderStatus.OUT_FOR_DELIVERY:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      case OrderStatus.RETURNED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case OrderStatus.REFUNDED:
        return "bg-pink-100 text-pink-800 border-pink-200";
      case OrderStatus.FAILED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStatus = (status: OrderStatus | string) => {
    return String(status).replaceAll('_', ' ');
  };

  // Loading skeleton rows
  if (isLoading) {
    return (
      <div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">No orders found</p>
                      <p className="text-sm text-muted-foreground">Orders will appear here once customers place them.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ordersData.map((order) => (
                  <TableRow key={order.orderId} className="hover:bg-muted/50 transition-colors">
                    {/* Order ID */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">#{order.orderId}</span>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium">{order.customer?.customerName ?? "—"}</p>
                          <p className="text-sm text-muted-foreground">{order.customer?.email ?? "—"}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Order Date */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(order.orderDate)}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} border text-xs font-medium`}>
                        {formatStatus(order.status)}
                      </Badge>
                    </TableCell>



                    {/* Total */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{order.totalPrice != null ? order.totalPrice.toFixed(2) : "—"}</span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails?.(order.orderId)}
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(order)}
                          title="Edit order"
                        >
                          <Edit className="h-4 w-4" />
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