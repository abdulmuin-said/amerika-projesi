import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Discount {
  discountCode: string;
  timesUsed: number;
  revenueInfluenced: number;
  averageOrderValue: number;
}

interface DiscountsTableProps {
  discounts: Discount[];
  isLoading?: boolean;
}

export function DiscountsTable({ discounts, isLoading = false }: DiscountsTableProps) {
  const getUsageBadgeVariant = (timesUsed: number) => {
    if (timesUsed >= 200) return "default";
    if (timesUsed >= 100) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Discount Performance
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No discount data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discount Code</TableHead>
                <TableHead>Times Used</TableHead>
                <TableHead>Revenue Influenced</TableHead>
                <TableHead>Avg Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.discountCode}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{discount.discountCode}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getUsageBadgeVariant(discount.timesUsed)}>
                      {discount.timesUsed}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${discount.revenueInfluenced.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    ${discount.averageOrderValue.toLocaleString()}
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