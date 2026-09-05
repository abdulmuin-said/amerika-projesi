/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import Chips from "@/components/ui/chips";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { Attribute, AttributeDTO, AttributeType } from "@/types/domains/attribute";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const attributeSchema = z.object({
    name: z.string().nonempty("Attribute name is required."),
    type: z.enum([AttributeType.CUSTOM, AttributeType.ENUMERATED]),
    allowedValues: z.array(z.string())
}).superRefine(
    (values, ctx) => {
        if ((values.type === "ENUMERATED" && values.allowedValues.length > 0) || (values.type === "CUSTOM"))
            return;

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Allowed values are required for enumerated attributes.",
            path: ["allowedValues"]
        });
    }
);

const defaultFieldValues = {
    name: "",
    type: AttributeType.CUSTOM,
    allowedValues: [] as string[]
};

type FieldValues = z.infer<typeof attributeSchema>;

export default function AttributeForm({
    attribute,
    loading,
    onSubmit
}: {
    attribute?: Attribute,
    loading: boolean,
    onSubmit: (data: AttributeDTO) => void
}) {
    const firstRender = useRef(true);
    const defaultValues = useMemo(() => attribute ? {
        name: attribute.name,
        type: attribute.type,
        allowedValues: attribute.allowedValues
    }: defaultFieldValues, [attribute]);

    const attributeForm = useForm<FieldValues>({
        resolver: zodResolver(attributeSchema),
        defaultValues
    });

    useEffect(() => {
        if (!firstRender.current)
            return attributeForm.reset(defaultValues);

        firstRender.current = false;
    }, [defaultValues]);

    return <Form {...attributeForm}>
        <form className="space-y-6" onSubmit={attributeForm.handleSubmit(data => {
            onSubmit({
                name: data.name,
                type: data.type,
                allowedValues: [...(data.type === AttributeType.CUSTOM? defaultValues: data).allowedValues]
            });
        })}>
            <div className="space-y-4">
                <FormField
                    control={attributeForm.control}
                    name="name"
                    disabled={loading}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attribute Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter attribute name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={attributeForm.control}
                    name="type"
                    disabled={loading}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attribute Type</FormLabel>
                            <FormControl>
                                <Select {...field} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select attribute type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={AttributeType.CUSTOM}>CUSTOM</SelectItem>
                                        <SelectItem value={AttributeType.ENUMERATED}>ENUMERATED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={attributeForm.control}
                    name="allowedValues"
                    disabled={loading || attributeForm.getValues().type !== AttributeType.ENUMERATED}
                    render={({ field }) => {
                        return <FormItem>
                            <FormLabel>Allowed Values</FormLabel>
                            <FormControl>
                                <Chips {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    }}
                />
            </div>
            <Button disabled={loading || !attributeForm.formState.isDirty}
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
