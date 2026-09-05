/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react/display-name */
"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShippingMethodDTO } from "@/types/domains/shipping_method";
import { zodResolver } from "@hookform/resolvers/zod";
import { COUNTRY_OPTIONS, normalizeStoredCountryCode } from "@/lib/countries";
import { Minus, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ControllerFieldState, ControllerRenderProps, useForm, UseFormStateReturn } from "react-hook-form";
import { z } from "zod";

const shippingSchema = z.object({
    name: z.string().nonempty("Shipping method name is required."),
    originCountry: z.string().nonempty("Origin country is required."),
    originPostalCode: z.string().nonempty("Origin postal code is required."),
    processingTimeMin: z.number().min(0, "Processing time must be 0 or greater."),
    processingTimeMax: z.number().min(0, "Processing time must be 0 or greater."),
    shippingOptions: z.array(
        z.object({
            id: z.number().optional(),
            key: z.number(),
            destinationCountry: z.string().nonempty("Destination country is required."),
            carrier: z.string().nonempty("Carrier is required."),
            costFirstItem: z.number().min(0, "Cost must be 0 or greater."),
            costAdditionalItem: z.number().min(0, "Additional cost must be 0 or greater."),
            estimatedDeliveryMin: z.number().min(1, "Delivery time must be at least 1 day."),
            estimatedDeliveryMax: z.number().min(1, "Delivery time must be at least 1 day.")
        })
    ).min(1, "There must be at least one shipping option.")
}).refine((data) => data.processingTimeMax >= data.processingTimeMin, {
    message: "Max processing time must be greater than or equal to min processing time",
    path: ["processingTimeMax"]
});

const defaultFieldValues = {
    name: "",
    originCountry: "",
    originPostalCode: "",
    processingTimeMin: 1,
    processingTimeMax: 3,
    shippingOptions: [{
        key: 0,
        destinationCountry: "",
        carrier: "",
        costFirstItem: 0,
        costAdditionalItem: 0,
        estimatedDeliveryMin: 1,
        estimatedDeliveryMax: 5
    }]
};

type FieldValues = z.infer<typeof shippingSchema>;

/** Compact country picker: smaller box, default text size. */
const countrySelectTriggerClass =
    "h-8 w-full max-w-[9rem] px-2 text-sm gap-1 [&_svg:not([class*='size-'])]:size-4";
const countrySelectContentClass = "max-h-48";
const countrySelectItemClass = "py-1";

export default function ShippingForm({
    shippingMethod,
    loading,
    onSubmit
}: {
    shippingMethod?: ShippingMethodDTO,
    loading: boolean,
    onSubmit: (data: ShippingMethodDTO) => void
}) {
    const firstRender = useRef(true);
    const defaultValues = useMemo(() => shippingMethod ? {
        name: shippingMethod.name || "",
        originCountry: normalizeStoredCountryCode(shippingMethod.originCountry),
        originPostalCode: shippingMethod.originPostalCode || "",
        processingTimeMin: shippingMethod.processingTimeMin ?? 1,
        processingTimeMax: shippingMethod.processingTimeMax ?? 3,
        shippingOptions: shippingMethod.shippingOptions.map((opt, i) => ({
            id: opt.id,
            key: i,
            destinationCountry: normalizeStoredCountryCode(opt.destinationCountry),
            carrier: opt.carrier || "",
            costFirstItem: opt.costFirstItem ?? 0,
            costAdditionalItem: opt.costAdditionalItem ?? 0,
            estimatedDeliveryMin: opt.estimatedDeliveryMin ?? 1,
            estimatedDeliveryMax: opt.estimatedDeliveryMax ?? 5
        }))
    } : defaultFieldValues, [shippingMethod]);

    const shippingForm = useForm<FieldValues>({
        resolver: zodResolver(shippingSchema),
        defaultValues
    });

    useEffect(() => {
        if (!firstRender.current)
            return shippingForm.reset(defaultValues);

        firstRender.current = false;
    }, [defaultValues]);

    const renderDestinationCountryField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                >
                    <SelectTrigger className={countrySelectTriggerClass}>
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent className={countrySelectContentClass}>
                        {COUNTRY_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value} className={countrySelectItemClass}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormControl>
            <FormMessage className="w-full whitespace-normal text-xs" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `shippingOptions.${number}.destinationCountry`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    const renderCarrierField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <Input
                    placeholder="Enter carrier"
                    {...field}
                    value={field.value || ""}
                />
            </FormControl>
            <FormMessage className="w-full whitespace-normal text-xs" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `shippingOptions.${number}.carrier`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    const renderNumberField = useCallback(
        (placeholder: string, step: string = "0.01") => {
            return ({
                field,
            }: {
                field: ControllerRenderProps<FieldValues, any>;
            }) => (
                <FormItem>
                    <FormControl>
                        <Input
                            type="number"
                            step={step}
                            min="0"
                            placeholder={placeholder}
                            className="w-full"
                            {...field}
                            value={field.value === 0 ? '' : (field.value ?? '')}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                    </FormControl>
                    <FormMessage className="w-full whitespace-normal text-xs" />
                </FormItem>
            );
        },
        []
    );

    return <Form {...shippingForm}>
        <form className="space-y-6" onSubmit={shippingForm.handleSubmit(data => {
            // Check for duplicate country-carrier combinations
            const erroneousIndices: number[] = [];
            const combinationSet = new Set<string>();
            data.shippingOptions.forEach((opt, i) => {
                const combination = `${opt.destinationCountry}-${opt.carrier}`;
                if (combinationSet.has(combination)) {
                    erroneousIndices.push(i);
                } else {
                    combinationSet.add(combination);
                }
            });
            
            // Validate delivery times
            data.shippingOptions.forEach((opt, i) => {
                if (opt.estimatedDeliveryMax < opt.estimatedDeliveryMin) {
                    shippingForm.setError(`shippingOptions.${i}.estimatedDeliveryMax`, {
                        message: "Max >= Min"
                    });
                }
            });
            
            for (const i of erroneousIndices) { 
                shippingForm.setError(`shippingOptions.${i}.destinationCountry`, {
                    message: "Duplicate"
                });
                shippingForm.setError(`shippingOptions.${i}.carrier`, {
                    message: "Duplicate"
                });
            }
            if (erroneousIndices.length)
                return;

            onSubmit({
                name: data.name,
                originCountry: data.originCountry,
                originPostalCode: data.originPostalCode,
                processingTimeMin: data.processingTimeMin,
                processingTimeMax: data.processingTimeMax,
                shippingOptions: data.shippingOptions.map(opt => ({
                    destinationCountry: opt.destinationCountry,
                    carrier: opt.carrier,
                    costFirstItem: opt.costFirstItem,
                    costAdditionalItem: opt.costAdditionalItem,
                    estimatedDeliveryMin: opt.estimatedDeliveryMin,
                    estimatedDeliveryMax: opt.estimatedDeliveryMax
                }))
            });
        })}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <FormField
                    control={shippingForm.control}
                    name="name"
                    disabled={loading}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Method Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Express International Shipping"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={shippingForm.control}
                        name="originCountry"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Origin Country</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className={countrySelectTriggerClass}>
                                            <SelectValue placeholder="Select origin country" />
                                        </SelectTrigger>
                                        <SelectContent className={countrySelectContentClass}>
                                            {COUNTRY_OPTIONS.map(({ value, label }) => (
                                                <SelectItem key={value} value={value} className={countrySelectItemClass}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={shippingForm.control}
                        name="originPostalCode"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Origin Postal Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 10001"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={shippingForm.control}
                        name="processingTimeMin"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Processing Time (days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="1"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={shippingForm.control}
                        name="processingTimeMax"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Processing Time (days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="3"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={shippingForm.control}
                    name="shippingOptions"
                    disabled={loading}
                    render={({ field }) => {
                        return <FormItem>
                            <FormLabel>Shipping Options</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div
                                        data-slot="table-container"
                                        className="relative w-full max-w-full h-48 overflow-auto border rounded-md"
                                    >
                                        <Table className="w-full">
                                            <TableHeader className="sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="bg-background">Country</TableHead>
                                                    <TableHead className="bg-background">Carrier</TableHead>
                                                    <TableHead className="bg-background">First ($)</TableHead>
                                                    <TableHead className="bg-background">Add. ($)</TableHead>
                                                    <TableHead className="bg-background">Min Days</TableHead>
                                                    <TableHead className="bg-background">Max Days</TableHead>
                                                    <TableHead className="bg-background w-10"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {field.value.map((opt, i) => (
                                                    <TableRow key={opt.key}>
                                                        <TableCell className="p-1">
                                                            <FormField
                                                                control={shippingForm.control}
                                                                name={`shippingOptions.${i}.destinationCountry`}
                                                                disabled={field.disabled}
                                                                render={renderDestinationCountryField}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1">
                                                            <FormField
                                                                control={shippingForm.control}
                                                                name={`shippingOptions.${i}.carrier`}
                                                                disabled={field.disabled}
                                                                render={renderCarrierField}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1">
                                                            <FormField
                                                                control={shippingForm.control}
                                                                name={`shippingOptions.${i}.costFirstItem`}
                                                                disabled={field.disabled}
                                                                render={renderNumberField("0.00")}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1">
                                                            <FormField
                                                                control={shippingForm.control}
                                                                name={`shippingOptions.${i}.costAdditionalItem`}
                                                                disabled={field.disabled}
                                                                render={renderNumberField("0.00")}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1">
                                                            <FormField
                                                                control={shippingForm.control}
                                                                name={`shippingOptions.${i}.estimatedDeliveryMin`}
                                                                disabled={field.disabled}
                                                                render={renderNumberField("1", "1")}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1">
                                                            <FormField
                                                                control={shippingForm.control}
                                                                name={`shippingOptions.${i}.estimatedDeliveryMax`}
                                                                disabled={field.disabled}
                                                                render={renderNumberField("5", "1")}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-1">
                                                            {field.value.length === 1 ?
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="h-min">
                                                                            <Button variant="ghost" disabled size="sm">
                                                                                <Minus className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>At least one option required</p>
                                                                    </TooltipContent>
                                                                </Tooltip> :
                                                                <Button variant="ghost"
                                                                    type="button"
                                                                    size="sm"
                                                                    disabled={field.disabled || field.value.length === 1}
                                                                    onClick={() => {
                                                                        const currentValue = shippingForm.getValues("shippingOptions");
                                                                        currentValue.splice(i, 1);
                                                                        field.onChange([...currentValue]);
                                                                    }}
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </Button>
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <FormMessage />
                                    <Button variant="outline"
                                        type="button"
                                        disabled={field.disabled}
                                        className="w-full justify-start gap-1"
                                        onClick={() => {
                                            const currentValue = shippingForm.getValues("shippingOptions");
                                            const key = currentValue.length ? currentValue[currentValue.length - 1]?.key + 1 : 1;
                                            field.onChange([...currentValue, { 
                                                key, 
                                                destinationCountry: "", 
                                                carrier: "", 
                                                costFirstItem: 0,
                                                costAdditionalItem: 0,
                                                estimatedDeliveryMin: 1,
                                                estimatedDeliveryMax: 5
                                            }]);
                                        }}
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                        <div className="font-medium text-sm text-gray-600">Add Shipping Option</div>
                                    </Button>
                                </div>
                            </FormControl>
                        </FormItem>
                    }}
                />
            </div>
            <Button disabled={loading || !shippingForm.formState.isDirty}
                variant="default"
                type="submit" size="sm"
                className="w-full"
            >
                {loading && <Spinner />}
                Save
            </Button>
        </form>
    </Form>
};