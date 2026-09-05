/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Variation } from "@/types/domains/variation";
import { Attribute } from "@/types/domains/attribute";
import Spinner from "@/components/ui/spinner";
import FormMultiSelect from "./FormMultiSelect";

interface CategoryData {
    name: string;
    code: string;
    parentCategory?: CategoryData;
    variationIds: number[];
    attributeIds: number[];
};

const optionStates = ["present", "absent", "present_in_parent"] as const;
type OptionState = typeof optionStates[number];

const recordSchema = z.record(z.string().transform(k => Number(k)), z.enum(optionStates));

const categorySchema = z.object({
    name: z.string().nonempty("Category name is required."),
    code: z.string().nonempty("Category code is required."),
    variations: recordSchema,
    attributes: recordSchema
});

const getDefaultValue = (category: CategoryData | null, variations: Variation[], attributes: Attribute[]) => {
    const variationItemStates = variations
        .reduce((acc, v) => {
            acc[v.variationId] = "absent";
            return acc;
        }, {} as Record<number, OptionState>);

    const attributeItemStates = attributes
        .reduce((acc, a) => {
            acc[a.attributeId] = "absent";
            return acc;
        }, {} as Record<number, OptionState>);

    let current: CategoryData | undefined = category ?? undefined;
    while (current) {
        current.variationIds.forEach(v => {
            variationItemStates[v] = "present_in_parent";
        });
        current.attributeIds.forEach(a => {
            attributeItemStates[a] = "present_in_parent";
        });
        current = current.parentCategory;
    }

    return {
        name: "",
        code: "",
        variations: variationItemStates,
        attributes: attributeItemStates
    };
};

export interface AddCategoryFormRef {
    setCodeError: () => void;
}

const AddCategoryForm = React.forwardRef<AddCategoryFormRef, {
    parentCategory?: CategoryData | null;
    variations: Variation[];
    attributes: Attribute[];
    loading: boolean;
    onAdd: (data: CategoryData) => void;
    manageVariations: () => void;
    manageAttributes: () => void;
}>(function AddCategoryForm(
    { parentCategory, variations, attributes, loading, onAdd, manageVariations, manageAttributes },
    ref
) {
    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "", code: "", variations: {}, attributes: {} }
    });

    useImperativeHandle(ref, () => ({
        setCodeError: () => form.setError("code", {
            message: "This code is already taken. Please choose a different one."
        })
    }), [form]);

    useEffect(() => {
        form.reset(getDefaultValue(parentCategory ?? null, variations, attributes));
    }, [parentCategory, variations, attributes]);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(data => {
                onAdd({
                    name: data.name,
                    code: data.code,
                    variationIds: Object.entries(data.variations)
                        .filter(([, v]) => v === "present")
                        .map(([k]) => Number(k)),
                    attributeIds: Object.entries(data.attributes)
                        .filter(([, v]) => v === "present")
                        .map(([k]) => Number(k))
                });
            })}>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter category name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="code"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter category code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="variations"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Variations</FormLabel>
                                <FormControl>
                                    <FormMultiSelect {...field}
                                        items={variations.map(v => ({ id: v.variationId, name: v.name }))}
                                        onFooterClick={manageVariations}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="attributes"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attributes</FormLabel>
                                <FormControl>
                                    <FormMultiSelect {...field}
                                        items={attributes.map(a => ({ id: a.attributeId, name: a.name }))}
                                        onFooterClick={manageAttributes}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button disabled={loading} variant="default" type="submit" size="sm" className="w-full">
                    {loading && <Spinner />}
                    Save
                </Button>
            </form>
        </Form>
    );
});

export default AddCategoryForm;
