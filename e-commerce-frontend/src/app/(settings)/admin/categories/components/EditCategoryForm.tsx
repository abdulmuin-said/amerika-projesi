/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useEffect, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Variation } from "@/types/domains/variation";
import { Attribute } from "@/types/domains/attribute";
import FormMultiSelect from "./FormMultiSelect";
import { extractConsonants } from "@/lib/utils";
import useDrivePicker from "react-google-drive-picker";
import { toast } from "sonner";

interface CategoryData {
   categoryId: number;
   name: string;
   code: string;
   parentCategory?: CategoryData;
   variationIds: number[];
   attributeIds: number[];
   imageUrl?: string;
}

const optionStates = ["present", "absent", "present_in_parent"] as const;
type OptionState = (typeof optionStates)[number];

const recordSchema = z.record(
   z.string().transform((k) => Number(k)),
   z.enum(optionStates)
);

const categorySchema = z.object({
   name: z.string().trim().nonempty("Category name is required."),
   code: z.string().trim().nonempty("Category code is required."),
   variations: recordSchema,
   attributes: recordSchema,
   imageUrl: z.string().optional(),
});

const getDefaultValue = (category: CategoryData | null, variations: Variation[], attributes: Attribute[]) => {
   const variationItemStates = variations.reduce((acc, v) => {
      acc[v.variationId] = "absent";
      return acc;
   }, {} as Record<number, OptionState>);

   const attributeItemStates = attributes.reduce((acc, a) => {
      acc[a.attributeId] = "absent";
      return acc;
   }, {} as Record<number, OptionState>);

   if (category) {
      category.variationIds.forEach((v) => {
         variationItemStates[v] = "present";
      });
      category.attributeIds.forEach((a) => {
         attributeItemStates[a] = "present";
      });
   }

   let current = category?.parentCategory;
   while (current) {
      current.variationIds.forEach((v) => {
         variationItemStates[v] = "present_in_parent";
      });
      current.attributeIds.forEach((a) => {
         attributeItemStates[a] = "present_in_parent";
      });
      current = current.parentCategory;
   }

   return {
      name: category?.name || "",
      code: category?.code || "",
      variations: variationItemStates,
      attributes: attributeItemStates,
      imageUrl: category?.imageUrl || "",
   };
};

export interface EditCategoryFormRef {
   setCodeError: () => void;
}

const EditCategoryForm = React.forwardRef<EditCategoryFormRef, {
   category: CategoryData | null;
   loading?: boolean;
   variations: Variation[];
   attributes: Attribute[];
   onSubmit: (data: Partial<Omit<CategoryData, "categoryId" | "parentCategory">>) => void;
   manageVariations: () => void;
   manageAttributes: () => void;
}>(function EditCategoryForm({
   category,
   loading = false,
   variations,
   attributes,
   onSubmit,
   manageVariations,
   manageAttributes,
}, ref) {
   const [openPicker, authResponse] = useDrivePicker();
   const fileInputRef = React.useRef<HTMLInputElement>(null);
   const [isUploading, setIsUploading] = useState(false);
   const form = useForm<z.infer<typeof categorySchema>>({
      resolver: zodResolver(categorySchema),
      defaultValues: {
         name: "",
         code: "",
         variations: {},
         attributes: {},
         imageUrl: "",
      },
   });

   useImperativeHandle(ref, () => ({
      setCodeError: () => form.setError("code", {
         message: "This code is already taken. Please choose a different one."
      })
   }), [form]);

   useEffect(() => {
      form.reset(getDefaultValue(category, variations, attributes));
   }, [category, variations, attributes]);

   const handleOpenPicker = useCallback(() => {
      try {
         openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
            token: authResponse?.access_token,
            viewId: "DOCS_IMAGES",
            multiselect: false,
            supportDrives: true,
            showUploadView: true,
            viewMimeTypes: "image/png,image/jpeg,image/jpg,image/gif,image/webp",

            callbackFunction(data) {
               if (!(data.action === "picked" && data.docs && data.docs.length > 0)) return;
               const file = data.docs[0];
               const fileId = file.id;
               const imageUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;
               form.setValue("imageUrl", imageUrl, { shouldDirty: true });
            },
         });
      } catch {
         toast.error("Failed to open Google Drive picker. Please try again.");
      }
   }, [openPicker, authResponse, form]);

   const handleDeviceUpload = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
         if (!file) return;

         // Reset so same file can be re-selected
         e.target.value = "";

         setIsUploading(true);
         try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "categories");

            const res = await fetch("/api/upload", {
               method: "POST",
               body: formData,
            });

            if (!res.ok) {
               const body = await res.json().catch(() => ({}));
               throw new Error(body.error || "Upload failed");
            }
            const { url } = await res.json();
            if (!url?.startsWith("http")) throw new Error("Invalid response");

            form.setValue("imageUrl", url, { shouldDirty: true });
            toast.success("Image uploaded successfully!");
         } catch {
            toast.error("Failed to upload image. Please try again.");
         } finally {
            setIsUploading(false);
         }
      },
      [form]
   );

   return (
      <Form {...form}>
         <form
            className="space-y-6"
            onSubmit={form.handleSubmit((data) => {
               const submitData: Parameters<typeof onSubmit>[0] = {};
               const dirtyFields = form.formState.dirtyFields;
               if (dirtyFields.name) submitData.name = data.name;
               if (dirtyFields.code) submitData.code = data.code;
               if (dirtyFields.variations)
                  submitData.variationIds = Object.entries(data.variations)
                     .filter(([, v]) => v === "present")
                     .map(([k]) => Number(k));
               if (dirtyFields.attributes)
                  submitData.attributeIds = Object.entries(data.attributes)
                     .filter(([, v]) => v === "present")
                     .map(([k]) => Number(k));
               if (dirtyFields.imageUrl) submitData.imageUrl = data.imageUrl;
               onSubmit(submitData);
            })}
         >
            <div className="space-y-4">
               <FormField
                  control={form.control}
                  name="name"
                  disabled={loading}
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                           <Input
                              placeholder="Enter category name"
                              {...field}
                              onChange={(e) => {
                                 const newValue = e.target.value;
                                 field.onChange(newValue);
                                 form.setValue("code", extractConsonants(newValue).toUpperCase(), { shouldDirty: true });
                              }}
                              onBlur={() => field.onChange(field.value.trim())}
                           />
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
                           <Input
                              placeholder="Enter category code"
                              {...field}
                              onBlur={() => field.onChange(field.value.trim())}
                           />
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
                           <FormMultiSelect
                              {...field}
                              items={variations.map((v) => ({ id: v.variationId, name: v.name }))}
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
                           <FormMultiSelect
                              {...field}
                              items={attributes.map((a) => ({ id: a.attributeId, name: a.name }))}
                              onFooterClick={manageAttributes}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleDeviceUpload}
               />
               <FormField
                  control={form.control}
                  name="imageUrl"
                  disabled={loading}
                  render={() => {
                     const image = form.watch("imageUrl");
                     return (
                        <FormItem>
                           <FormLabel>Image</FormLabel>
                           <FormControl>
                              {image ? (
                                 <div className="h-60 flex align-center justify-center relative w-full ">
                                    <Image
                                       src={image}
                                       alt="Category image"
                                       width={100}
                                       height={100}
                                       style={{ maxWidth: "none" }}
                                       className="object-contain rounded-md w-full"
                                       onError={(e) => {
                                          (e.target as HTMLImageElement).src = "/placeholder-image.jpeg";
                                       }}
                                    ></Image>
                                    <div className="absolute inset-0">
                                       <div
                                          className="absolute top-3 right-3 pointer-events-auto p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 cursor-pointer"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             form.setValue("imageUrl", "", { shouldDirty: true });
                                          }}
                                          aria-label="Delete image"
                                       >
                                          <Trash2 className="w-5 h-5 text-red-600" />
                                       </div>
                                       <div
                                          className="absolute top-13 right-3 transform pointer-events-auto p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 cursor-pointer"
                                          onClick={(e) => {
                                             if (!loading && !isUploading) fileInputRef.current?.click();
                                          }}
                                          aria-label="Update image"
                                       >
                                          <RefreshCcw className="w-5 h-5 text-blue-600" />
                                       </div>
                                    </div>
                                 </div>
                              ) : (
                                 <div className="flex flex-col sm:flex-row gap-3">
                                    <div
                                       className="border bg-accent rounded-md flex-1 flex flex-col justify-center items-center gap-2 cursor-pointer py-8"
                                       onClick={() => {
                                          if (!loading && !isUploading) fileInputRef.current?.click();
                                       }}
                                    >
                                       <Plus className="size-8 text-muted-foreground" />
                                       <p className="text-sm text-muted-foreground">{isUploading ? "Uploading..." : "Upload from Device"}</p>
                                    </div>
                                    <div
                                       className={`border bg-accent rounded-md flex-1 flex flex-col justify-center items-center gap-2 cursor-pointer py-8 transition-opacity ${loading ? "opacity-50 pointer-events-none" : "hover:bg-accent/80"
                                          }`}
                                       onClick={loading ? undefined : handleOpenPicker}
                                    >
                                       <Plus className="size-8 text-muted-foreground" />
                                       <p className="text-sm text-muted-foreground">Select from Google Drive</p>
                                    </div>
                                 </div>
                              )}
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     );
                  }}
               />
            </div>
            <Button disabled={loading || !form.formState.isDirty} variant="default" type="submit" size="sm" className="w-full">
               Save
            </Button>
         </form>
      </Form>
   );
});

export default EditCategoryForm;
