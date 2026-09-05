/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
  userId: number;
  fullName: string;
  totalSpent: number;
  orderedItems: number;
  phoneNo: string;
  email: string;
  address: any;
}

interface TopCustomersTableProps {
  customers: Customer[];
  isLoading?: boolean;
}

export function TopCustomersTable({ customers, isLoading = false }: TopCustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Top Customers
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No customer data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.userId}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{customer.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phoneNo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.email}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {customer.orderedItems}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${customer.totalSpent.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}