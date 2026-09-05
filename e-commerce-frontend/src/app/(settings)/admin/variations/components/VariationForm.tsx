/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { extractConsonants } from "@/lib/utils";
import { VariationUpdationPayload } from "@/types/domains/variation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import React, { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { ControllerFieldState, ControllerRenderProps, useForm, UseFormStateReturn } from "react-hook-form";
import { z } from "zod";

const variationSchema = z.object({
    name: z.string().nonempty("Variation name is required."),
    variationOptions: z.array(
        z.object({
            id: z.number().optional(),
            key: z.number(),
            name: z.string().nonempty("Variation option name is required."),
            code: z.string().nonempty("Variation option code is required.")
        })
    ).min(1, "There must be at least one variation option.")
});

const defaultFieldValues = {
    name: "",
    variationOptions: [{
        key: 0,
        name: "",
        code: ""
    }]
};

type FieldValues = z.infer<typeof variationSchema>;

export default function VariationForm({
    variation,
    loading,
    onSubmit
}: {
    variation: VariationUpdationPayload,
    loading: boolean,
    onSubmit: (data: VariationUpdationPayload) => void
} | {
    variation?: undefined,
    loading: boolean,
    onSubmit: (data: FieldValues) => void
}) {
    const firstRender = useRef(true);
    const defaultValues = useMemo(() => variation ? {
        name: variation.name,
        variationOptions: variation.variationOptions.map((opt, i) => ({
            id: opt.variationOptionId,
            key: i,
            name: opt.name,
            code: opt.code
        }))
    }: defaultFieldValues, [variation]);

    const variationForm = useForm<FieldValues>({
        resolver: zodResolver(variationSchema),
        defaultValues
    });

    useEffect(() => {
        if (!firstRender.current)
            return variationForm.reset(defaultValues);

        firstRender.current = false;
    }, [defaultValues]);

    const renderVariationOptionNameField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <input className="w-full" placeholder="Enter variation option name"
                    {...field}
                    onChange={e => {
                        const newValue = e.target.value;
                        field.onChange(newValue);
                        variationForm.setValue(
                            field.name.replace(".name", ".code") as `variationOptions.${number}.code`,
                            extractConsonants(newValue).toUpperCase(),
                            { shouldDirty: true }
                        );
                    }}
                    onBlur={e => {
                        field.onBlur();
                        field.onChange(e.target.value.trim());
                    }}
                />
            </FormControl>
            <FormMessage className="w-full whitespace-normal" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `variationOptions.${number}.name`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    const renderVariationOptionCodeField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <input className="w-full" placeholder="Enter variation option code"
                    {...field}
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                    onBlur={e => {
                        field.onBlur();
                        field.onChange(e.target.value.trim());
                    }}
                />
            </FormControl>
            <FormMessage className="w-full whitespace-normal" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `variationOptions.${number}.code`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    return <Form {...variationForm}>
        <form className="space-y-6" onSubmit={variationForm.handleSubmit(data => {
            const erroneousIndices: number[] = [];
            const codeSet = new Set<string>();
            data.variationOptions.forEach((opt, i) => {
                if (codeSet.has(opt.code)) {
                    erroneousIndices.push(i);
                } else {
                    codeSet.add(opt.code);
                }
            });
            for (const i of erroneousIndices) { 
                variationForm.setError(`variationOptions.${i}.code`, {
                    message: "Code must be unique."
                });
            }
            if (erroneousIndices.length)
                return;

            if (variation)
                onSubmit({
                    name: data.name,
                    variationOptions: data.variationOptions.map(opt => ({
                        variationOptionId: opt.id,
                        name: opt.name,
                        code: opt.code
                    }))
                });
            else
                onSubmit(data);
        })}>
            <div className="space-y-4">
                <FormField
                    control={variationForm.control}
                    name="name"
                    disabled={loading}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Variation Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter variation name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={variationForm.control}
                    name="variationOptions"
                    disabled={loading}
                    render={({ field }) => {
                        return <FormItem>
                            <FormLabel>Variation Options</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div
                                        data-slot="table-container"
                                        className="relative w-full h-64 overflow-auto"
                                    >
                                        <Table className="border-separate border-spacing-0">
                                            <TableHeader className="sticky top-0">
                                                <TableRow>
                                                    <TableHead className="border-y border-x rounded-tl-md bg-background">Name</TableHead>
                                                    <TableHead className="border-y border-r bg-background">Code</TableHead>
                                                    <TableHead className="border-y border-r rounded-tr-md bg-background" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {field.value.map((opt, i) => <TableRow key={opt.key}>
                                                    <TableCell className={`border-b border-x ${i === field.value.length - 1 ? "rounded-bl-md": ""}`}>
                                                        <FormField
                                                            control={variationForm.control}
                                                            name={`variationOptions.${i}.name`}
                                                            disabled={field.disabled}
                                                            render={renderVariationOptionNameField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="border-b border-r">
                                                        <FormField
                                                            control={variationForm.control}
                                                            name={`variationOptions.${i}.code`}
                                                            disabled={field.disabled}
                                                            render={renderVariationOptionCodeField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className={`border-b border-r ${i === field.value.length - 1 ? "rounded-br-md": ""}`}>
                                                        {field.value.length === 1 ?
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="h-min">
                                                                        <Button variant="ghost" disabled>
                                                                            <Minus />
                                                                        </Button>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>At least one option must be there</p>
                                                                </TooltipContent>
                                                            </Tooltip> :
                                                            <Button variant="ghost"
                                                                type="button"
                                                                disabled={field.disabled || field.value.length === 1}
                                                                onClick={() => {
                                                                    const currentValue = variationForm.getValues("variationOptions");
                                                                    currentValue.splice(i, 1);
                                                                    field.onChange([...currentValue]);
                                                                }}
                                                            >
                                                                <Minus />
                                                            </Button>
                                                        }
                                                    </TableCell>
                                                </TableRow>)}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <FormMessage />
                                    <Button variant="outline"
                                        type="button"
                                        disabled={field.disabled}
                                        className="w-full justify-start gap-1"
                                        onClick={() => {
                                            const currentValue = variationForm.getValues("variationOptions");
                                            const key = currentValue.length ? currentValue[currentValue.length - 1]?.key + 1 : 1;
                                            field.onChange([...currentValue, { key, name: "", code: "" }]);
                                        }}
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                        <div className="font-medium text-sm text-gray-600">Add Variation</div>
                                    </Button>
                                </div>
                            </FormControl>
                        </FormItem>
                    }}
                />
            </div>
            <Button disabled={loading || !variationForm.formState.isDirty}
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
