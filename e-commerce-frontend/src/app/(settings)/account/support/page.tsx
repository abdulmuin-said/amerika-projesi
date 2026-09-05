"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Plus } from "lucide-react";
import { toast } from "sonner";

interface CustomerContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface Ticket {
    ticketId: number;
    subject: string;
    description: string;
    status: string;
    customer: CustomerContact;
}

export default function SupportTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([
        {
            ticketId: 1001,
            subject: "Order Delivery Question",
            description: "I haven't received any updates about my order delivery.",
            status: "Open",
            customer: {
                id: "1",
                name: "John Doe",
                email: "john@example.com",
                phone: "+1234567890"
            }
        }
    ]);

    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: "",
        description: ""
    });

    const handleSubmitTicket = () => {
        if (!newTicket.subject || !newTicket.description) {
            toast.error("Please fill in all fields");
            return;
        }

        const ticket: Ticket = {
            ticketId: Math.floor(1000 + Math.random() * 9000),
            subject: newTicket.subject,
            description: newTicket.description,
            status: "Open",
            customer: {
                id: "1", // Replace with actual user ID
                name: "John Doe", // Replace with actual user name
                email: "john@example.com", // Replace with actual user email
                phone: "+1234567890" // Replace with actual user phone
            }
        };

        setTickets([ticket, ...tickets]);
        setNewTicket({ subject: "", description: "" });
        setShowNewTicketForm(false);

        toast.success("Support ticket created successfully");
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Support Tickets</h2>
                <Button
                    onClick={() => setShowNewTicketForm(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </Button>
            </div>

            {showNewTicketForm && (
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-medium text-gray-900">Create New Ticket</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Subject</label>
                            <Input
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border-gray-200 focus:ring-2 focus:ring-gray-800"
                                placeholder="Enter ticket subject"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Description</label>
                            <Textarea
                                value={newTicket.description}
                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                className="w-full rounded-xl border-gray-200 px-4 py-2 focus:ring-2 focus:ring-gray-800"
                                placeholder="Describe your issue"
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowNewTicketForm(false)}
                                className="px-4 py-2 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitTicket}
                                className="px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200"
                            >
                                Submit Ticket
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.ticketId}
                        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <LifeBuoy className="w-6 h-6 text-gray-700 mt-1" />
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                                        <span className="text-sm text-gray-500">#{ticket.ticketId}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="text-sm text-gray-500">
                                            <span className="font-medium">{ticket.customer.name}</span> ·{" "}
                                            <span>{ticket.customer.email}</span>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${ticket.status === "Open" ? "bg-green-100 text-green-800" :
                                                    ticket.status === "Closed" ? "bg-gray-100 text-gray-800" :
                                                        "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}