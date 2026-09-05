import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  iconColor, 
  className,
  isLoading = false 
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("p-2 rounded-full", iconColor || "bg-gray-100 text-gray-600")}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              icon
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            value
          )}
        </div>
        {change !== undefined && !isLoading && (
          <p className="text-xs text-gray-500">
            <span
              className={cn(
                "font-medium",
                isPositive && "text-green-600",
                isNegative && "text-red-600"
              )}
            >
              {isPositive ? "+" : ""}{change}%
            </span>{" "}
            {changeLabel || "from last month"}
          </p>
        )}
        {isLoading && (
          <div className="animate-pulse mt-1">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}