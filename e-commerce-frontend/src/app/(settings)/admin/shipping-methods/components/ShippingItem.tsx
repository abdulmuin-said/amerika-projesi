"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pen, Trash, MapPin, Truck, DollarSign, Clock, Globe, Mail } from "lucide-react";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";

function ShippingItem({ shippingMethod, onEdit, onDelete }: {
    shippingMethod: ShippingMethod;
    onEdit: (shippingMethod: ShippingMethod) => void;
    onDelete: (shippingMethod: ShippingMethod) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);

    return <div className="border rounded-lg overflow-hidden">
        <div className="bg-background hover:bg-accent/50 transition-colors duration-200">
            <div className="pr-2.5 flex items-center justify-between">
                <div className="pl-2.5 min-w-0 flex items-center gap-3 py-2">
                    {shippingMethod.shippingOptions.length === 0 ?
                        <Tooltip>
                            <TooltipTrigger className="p-1 opacity-50">
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>No shipping options added</p>
                            </TooltipContent>
                        </Tooltip>:
                        <Button variant="ghost"
                            size={"none" as Parameters<typeof Button>[0]["size"]}
                            className="px-1 py-1"
                            onClick={() => setCollapsed(prev => !prev)}
                        >
                            {collapsed ?
                                <ChevronRight className="w-4 h-4 text-gray-600" /> :
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            }
                        </Button>
                    }
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 overflow-hidden whitespace-nowrap overflow-ellipsis">
                            {shippingMethod.name}
                        </span>
                        <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {shippingMethod.originCountry}
                            </span>
                            <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {shippingMethod.originPostalCode}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {shippingMethod.processingTimeMin}-{shippingMethod.processingTimeMax} days processing
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost"
                        size={"none" as Parameters<typeof Button>[0]["size"]}
                        className="px-2 h-6 text-sm"
                        onClick={() => onEdit(shippingMethod)}
                    >
                        <Pen style={{ width: '0.85rem', height: '0.85rem' }} className="text-gray-600" />
                        <span className="text-gray-600">Edit</span>
                    </Button>
                    <Button variant="ghost"
                        size={"none" as Parameters<typeof Button>[0]["size"]}
                        className="px-1 h-6"
                        onClick={() => onDelete(shippingMethod)}
                    >
                        <Trash className="w-4 h-4 text-gray-600" />
                    </Button>
                </div>
            </div>
        </div>

        {!!shippingMethod.shippingOptions.length && <div hidden={collapsed} className="bg-gray-50 px-6 py-3">
            <div className="space-y-2">
                {shippingMethod.shippingOptions.map((option, index) => (
                    <div key={option.id || index} className="bg-white border rounded-md px-4 py-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-6 overflow-hidden flex-1">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="font-medium text-gray-700">{option.destinationCountry}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-gray-600">{option.carrier}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600">
                                        First: <span className="font-semibold">${(option.costFirstItem ?? 0).toFixed(2)}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600">
                                        Additional: <span className="font-semibold">${(option.costAdditionalItem ?? 0).toFixed(2)}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                <span className="text-gray-600">
                                    {option.estimatedDeliveryMin}-{option.estimatedDeliveryMax} days delivery
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>}
    </div>;
};

export default React.memo(ShippingItem);


