/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as txServices from "@/services/paymentTransaction";
import { PaymentTransaction, PaymentSummary, PaymentTransactionStatus } from "@/types/domains/payment_transaction";
import { PageResponse } from "@/types/api";
import { format } from "date-fns";
import {
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// ─── Status helpers ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentTransactionStatus }) {
    const config: Record<PaymentTransactionStatus, { label: string; className: string; icon: React.ReactNode }> = {
        SUCCESS: { label: "Success", className: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle2 className="h-3 w-3" /> },
        FAILURE: { label: "Failed", className: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="h-3 w-3" /> },
        PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="h-3 w-3" /> },
    };
    const { label, className, icon } = config[status] ?? config.PENDING;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${className}`}>
            {icon}{label}
        </span>
    );
}

function FraudBadge({ fraudStatus }: { fraudStatus: number | null }) {
    if (fraudStatus === null || fraudStatus === undefined) return <span className="text-gray-400">—</span>;
    if (fraudStatus === 1) return <span className="text-green-600 text-xs font-medium">Clean</span>;
    return <span className="text-red-600 text-xs font-medium">Flagged</span>;
}

// ─── Summary cards ───────────────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: PaymentSummary | null }) {
    const cards = [
        {
            title: "Total Revenue",
            value: summary ? `$${summary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—",
            icon: <TrendingUp className="h-5 w-5 text-green-600" />,
            bg: "bg-green-50",
        },
        {
            title: "Successful",
            value: summary?.totalSuccessful?.toString() ?? "—",
            icon: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
            bg: "bg-blue-50",
        },
        {
            title: "Failed",
            value: summary?.totalFailed?.toString() ?? "—",
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            bg: "bg-red-50",
        },
        {
            title: "Pending",
            value: summary?.totalPending?.toString() ?? "—",
            icon: <Clock className="h-5 w-5 text-yellow-600" />,
            bg: "bg-yellow-50",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardContent className={`p-4 rounded-lg ${card.bg}`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                            {card.icon}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── Detail dialog ───────────────────────────────────────────────────────────

function TransactionDetailDialog({
    tx,
    open,
    onClose,
}: {
    tx: PaymentTransaction | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!tx) return null;

    const rows: Array<{ label: string; value: React.ReactNode }> = [
        { label: "Transaction ID", value: tx.paymentTransactionId },
        { label: "Order ID", value: <Link href={`/admin/orders-shipping?orderId=${tx.orderId}`} className="text-blue-600 hover:underline flex items-center gap-1">#{tx.orderId} <ExternalLink className="h-3 w-3" /></Link> },
        { label: "Customer", value: tx.customerName },
        { label: "Email", value: tx.customerEmail },
        { label: "Status", value: <StatusBadge status={tx.status} /> },
        { label: "Amount", value: tx.paidPrice != null ? `$${tx.paidPrice.toFixed(2)}` : "—" },
        { label: "Currency", value: tx.currency },
        { label: "Installments", value: tx.installment ?? 1 },
        { label: "Card", value: tx.lastFourDigits ? `${tx.cardFamily ?? ""} •••• ${tx.lastFourDigits}` : "—" },
        { label: "Card Association", value: tx.cardAssociation ?? "—" },
        { label: "BIN Number", value: tx.binNumber ?? "—" },
        { label: "Auth Code", value: tx.authCode ?? "—" },
        { label: "Fraud Status", value: <FraudBadge fraudStatus={tx.fraudStatus} /> },
        { label: "Stripe Payment ID", value: <span className="font-mono text-xs break-all">{tx.stripePaymentIntentId ?? "—"}</span> },
        { label: "Conversation ID", value: <span className="font-mono text-xs break-all">{tx.conversationId}</span> },
        { label: "Date", value: format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm:ss") },
        ...(tx.status === "FAILURE" ? [
            { label: "Error Code", value: tx.errorCode ?? "—" },
            { label: "Error Message", value: <span className="text-red-600">{tx.errorMessage ?? "—"}</span> },
        ] : []),
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Transaction #{tx.paymentTransactionId}
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <div className="space-y-3 pt-2">
                    {rows.map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start gap-4">
                            <span className="text-sm text-gray-500 font-medium min-w-32 shrink-0">{label}</span>
                            <span className="text-sm text-right">{value}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function PaymentsPage() {
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

    const transactionsData = useDataFetch(txServices.getAllTransactions);
    const summaryData = useDataFetch(txServices.getPaymentSummary);

    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState<PaymentSummary | null>(null);

    const fetchTransactions = () => {
        const status = statusFilter === "ALL" ? undefined : statusFilter;
        transactionsData
            .request(status, fromDate || undefined, toDate || undefined, page, 20)
            .onSuccess((data: PageResponse<PaymentTransaction>) => {
                setTransactions(data.content);
                setTotalPages(data.totalPages);
            });
    };

    useEffect(() => {
        summaryData.request().onSuccess((data: PaymentSummary) => setSummary(data));
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [page, statusFilter]);

    const handleSearch = () => {
        setPage(0);
        fetchTransactions();
    };

    const clearFilters = () => {
        setStatusFilter("ALL");
        setFromDate("");
        setToDate("");
        setPage(0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Transactions</h1>
                <p className="text-gray-500 text-sm mt-1">All Stripe payment records — real-time from your database</p>
            </div>

            {/* Summary cards */}
            <SummaryCards summary={summary} />

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="SUCCESS">Success</SelectItem>
                                    <SelectItem value="FAILURE">Failed</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">From Date</label>
                            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">To Date</label>
                            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
                        </div>
                        <Button onClick={handleSearch} className="flex items-center gap-2">
                            <Search className="h-4 w-4" /> Search
                        </Button>
                        <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                            <X className="h-4 w-4" /> Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {["ID", "Customer", "Card", "Amount", "Installments", "Fraud", "Status", "Date", ""].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactionsData.isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                            No payment transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.paymentTransactionId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-gray-600">#{tx.paymentTransactionId}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{tx.customerName || "—"}</div>
                                                <div className="text-xs text-gray-500">{tx.customerEmail || ""}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {tx.lastFourDigits ? (
                                                    <div>
                                                        <span className="font-medium">{tx.cardFamily}</span>
                                                        <span className="text-gray-500 ml-1">•••• {tx.lastFourDigits}</span>
                                                    </div>
                                                ) : <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {tx.paidPrice != null ? `$${tx.paidPrice.toFixed(2)}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {tx.installment ?? 1}x
                                            </td>
                                            <td className="px-4 py-3">
                                                <FraudBadge fraudStatus={tx.fraudStatus} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={tx.status} />
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail dialog */}
            <TransactionDetailDialog
                tx={selectedTx}
                open={!!selectedTx}
                onClose={() => setSelectedTx(null)}
            />
        </div>
    );
}
