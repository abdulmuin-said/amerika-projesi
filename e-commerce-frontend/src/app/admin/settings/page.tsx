"use client";
import { useState } from "react";
import { Globe, Bell, CreditCard, Lock, Mail, ShieldCheck, Save } from "lucide-react";

const tabs = [
    { id: "general",       label: "General",       icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment",       label: "Payment",       icon: CreditCard },
    { id: "security",      label: "Security",      icon: Lock },
    { id: "email",         label: "Email",         icon: Mail },
    { id: "privacy",       label: "Privacy",       icon: ShieldCheck },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
        </div>
    );
}

const inputClass = "block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm">
                {/* Tab bar */}
                <div className="border-b border-gray-100 px-6 overflow-x-auto">
                    <nav className="flex gap-0 -mb-px">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-1.5 px-4 py-3.5 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeTab === id
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === "general" && (
                        <div className="max-w-lg space-y-6">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-4">Store Information</h3>
                                <div className="space-y-4">
                                    <Field label="Store Name">
                                        <input type="text" defaultValue="NovaCanvas Studios" className={inputClass} />
                                    </Field>
                                    <Field label="Store Description">
                                        <textarea rows={3} defaultValue="Museum-Grade Panoramic & Fine Canvas Wall Art." className={inputClass} />
                                    </Field>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <Field label="Email Address">
                                        <input type="email" defaultValue="concierge@novacanvas.com" className={inputClass} />
                                    </Field>
                                    <Field label="Phone Number">
                                        <input type="tel" defaultValue="+1 234 567 8900" className={inputClass} />
                                    </Field>
                                    <Field label="Address">
                                        <textarea rows={2} defaultValue="123 Store Street, City, Country" className={inputClass} />
                                    </Field>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-colors">
                                    <Save className="h-4 w-4" /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="max-w-lg space-y-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                            {["Order Notifications", "Customer Sign-ups", "Low Stock Alerts", "Revenue Reports"].map((label) => (
                                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <p className="text-sm font-medium text-gray-700">{label}</p>
                                    <button className="relative inline-flex h-5 w-9 rounded-full bg-gray-900 transition-colors">
                                        <span className="translate-x-4 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!["general", "notifications"].includes(activeTab) && (
                        <p className="text-sm text-gray-500">This section is under construction.</p>
                    )}
                </div>
            </div>
        </>
    );
}
