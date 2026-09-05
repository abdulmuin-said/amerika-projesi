


export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// API Response Types based on your documentation
export interface SalesReportResponse {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByPeriod: {
    period: string;
    sales: number;
  }[];
}

export interface CategoriesPerformanceResponse {
  totalRevenue: number;
  totalUnitsSold: number;
  categories: {
    categoryId: number;
    categoryName: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export interface OrdersReportResponse {
  status: string;
  count: number;
}

export interface CustomersReportResponse {
  customersOnboarded: number;
  activeCustomers: number;
  topCustomers: {
    userId: number;
    fullName: string;
    totalSpent: number;
    orderedItems: number;
    phoneNo: string;
    email: string;
    address: unknown;
  }[];
}

export interface ProductsPerformanceResponse {
  totalViews: number;
  totalPurchases: number;
  totalRevenue: number;
  averageConversionRate: number;
  averageReturnRate: number;
  averageOrderValue: number;
  products: {
    productId: number;
    productTitle: string;
    views: number;
    purchases: number;
    conversionRate: number;
    returnRate: number;
    unitsSold: number;
    revenue: number;
  }[];
}

export interface DiscountsPerformanceResponse {
  totalRevenueInfluenced: number;
  averageOrderValue: number;
  discounts: {
    discountCode: string;
    timesUsed: number;
    revenueInfluenced: number;
    averageOrderValue: number;
  }[];
}

