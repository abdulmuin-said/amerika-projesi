/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
// /app/admin/categories/page.tsx
"use client";

import React, { useCallback, useRef, useState } from "react";
import CategoryTreeNode from "./components/CategoryTreeNode";
import { CategoryDetails, CategoryDTO, CategoryTree } from "@/types/domains/category";
import AddCategoryForm, { AddCategoryFormRef } from "./components/AddCategoryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, SquarePen } from "lucide-react";
import EditCategoryForm, { EditCategoryFormRef } from "./components/EditCategoryForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCategories } from "@/store/slices/categorySlice";
import CategoryTreeSkeleton from "./components/CategoryTreeSkeleton";
import useDataFetch from "@/hooks/use-data-fetch";
import * as categoryServices from "@/services/category";
import Spinner from "@/components/ui/spinner";
import { ServiceResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { categoriesUnionSelector } from "@/store/selectors";
import { toast } from "sonner";

type CategoryData = React.ComponentProps<typeof EditCategoryForm>["category"] & {};

const categoryDetailsMap = new Map<number, CategoryData>();

export default function AdminCategoryPage() {
   const addDialogRef = React.useRef<{ open: () => void; close: () => void }>(null);
   const deleteDialogRef = React.useRef<{ open: () => void; close: () => void }>(null);
   const addFormRef = useRef<AddCategoryFormRef>(null);
   const editFormRef = useRef<EditCategoryFormRef>(null);
   const [targetParent, setTargetParent] = useState<CategoryData | null>(null);
   const [deletionTarget, setDeletionTarget] = useState<CategoryTree | null>(null);
   const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

   const dispatch = useAppDispatch();
   const { categories, variations, attributes, loading, error } = useAppSelector(categoriesUnionSelector);
   const router = useRouter();

   const createCategory = useDataFetch(categoryServices.createCategory);
   const updateCategory = useDataFetch(categoryServices.updateCategory);
   const getCategory = useDataFetch(categoryServices.getCategoryById);
   const deleteCategory = useDataFetch(categoryServices.deleteCategory);

   const onCreateCategorySuccess = useCallback(
      (res: ServiceResponse<typeof categoryServices.createCategory>) => {
         const parent = res.parentCategory;
         categoryDetailsMap.set(res.categoryId, {
            categoryId: res.categoryId,
            name: res.name,
            code: res.code,
            parentCategory: parent ? categoryDetailsMap.get(parent?.categoryId) : undefined,
            variationIds: res.variations.map((v) => v.variationId),
            attributeIds: res.attributes.map((a) => a.attributeId),
         });
         if (!targetParent) {
            dispatch(
               updateCategories([
                  ...categories,
                  {
                     categoryId: res.categoryId,
                     name: res.name,
                     path: `${categories.length}`,
                     subcategories: [],
                  },
               ])
            );
            addDialogRef.current?.close();
            return;
         }
         dispatch(
            updateCategories(
               transformByParentStack(categories, targetParent, (list, index) => {
                  const node = list[index];
                  node.subcategories.push({
                     categoryId: res.categoryId,
                     name: res.name,
                     path: `${node.path}.${node.subcategories.length}`,
                     subcategories: [],
                  });
               })
            )
         );

         setTargetParent(null);
         addDialogRef.current?.close();
      },
      [categories, targetParent]
   );
   const onUpdateCategorySuccess = useCallback(
      (res: ServiceResponse<typeof categoryServices.updateCategory>) => {
         if (!selectedCategory) return;

         const categoryDetails = categoryDetailsMap.get(selectedCategory.categoryId)!;
         categoryDetails.name = res.name;
         categoryDetails.code = res.code;
         categoryDetails.imageUrl = res.imageUrl;
         categoryDetails.variationIds = res.variations.map((v) => v.variationId);
         categoryDetails.attributeIds = res.attributes.map((a) => a.attributeId);

         dispatch(
            updateCategories(
               transformByParentStack(categories, selectedCategory, (list, index) => {
                  list[index] = {
                     ...list[index],
                     name: res.name,
                  };
               })
            )
         );
         setSelectedCategory(null);
         toast("The category has been updated successfully.", { icon: null, richColors: true });
      },
      [categories, selectedCategory]
   );

   const onSelectCategory = useCallback(
      (id: number) => {
         if (categoryDetailsMap.has(id)) setSelectedCategory(categoryDetailsMap.get(id)!);
         else getCategory.request(id).onSuccess((res) => setSelectedCategory(registerCategoryDetails(res)));
      },
      [getCategory.request]
   );

   const onAddCategory = useCallback(
      (node: CategoryTree) => {
         if (categoryDetailsMap.has(node.categoryId)) {
            const details = categoryDetailsMap.get(node.categoryId)!;
            setSelectedCategory(details);
            setTargetParent(details);
         } else {
            getCategory.request(node.categoryId).onSuccess((res) => {
               const details = registerCategoryDetails(res);
               setSelectedCategory(details);
               setTargetParent(details);
            });
         }
         addDialogRef.current?.open();
      },
      [getCategory.request]
   );

   const onDeleteCategory = useCallback((node: CategoryTree) => {
      setDeletionTarget(node);
      deleteDialogRef.current?.open();
   }, []);

   const goToVariationSettings = useCallback(() => {
      router.push(`/admin/variations`);
   }, [router]);
   const goToAttributeSettings = useCallback(() => {
      router.push(`/admin/attributes`);
   }, [router]);

   return (
      <>
         <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <div className="flex-1 flex gap-4">
               <div className="flex-[7] min-w-0 py-2 space-y-2">
                  {loading ? (
                     <CategoryTreeSkeleton />
                  ) : !error && categories.length ? (
                     categories.map((cat) => (
                        <CategoryTreeNode
                           key={cat.categoryId}
                           node={cat}
                           onSelectCategory={onSelectCategory}
                           onAddSubcategory={onAddCategory}
                           onDeleteCategory={onDeleteCategory}
                        />
                     ))
                  ) : (
                     <div className="border rounded-md h-9 bg-background px-3.5 flex items-center text-gray-400">
                        No categories created! Click the button below to create one now.
                     </div>
                  )}
                  <div
                     className="rounded-md cursor-pointer h-9 hover:bg-accent px-3.5 flex items-center gap-2 text-gray-600"
                     onClick={() => {
                        setTargetParent(null);
                        addDialogRef.current?.open();
                     }}
                  >
                     <Plus className="w-4 h-4" />
                     <div className="font-medium text-base">Add Category</div>
                  </div>
               </div>
               <div className="sticky top-0 flex-[5] min-w-0 h-min py-2">
                  <div className="relative bg-card text-card-foreground rounded-md border p-6">
                     {selectedCategory || getCategory.isLoading ? (
                        <EditCategoryForm
                           ref={editFormRef}
                           loading={updateCategory.isLoading}
                           category={selectedCategory}
                           variations={variations}
                           attributes={attributes}
                           onSubmit={(data) =>
                              selectedCategory &&
                              updateCategory.request(selectedCategory?.categoryId, data)
                                 .onSuccess(onUpdateCategorySuccess)
                                 .onError((msg) => {
                                    if (msg.includes("category_code_key") || msg.includes("duplicate key")) {
                                       editFormRef.current?.setCodeError();
                                    } else {
                                       toast.error(msg);
                                    }
                                 })
                           }
                           manageVariations={goToVariationSettings}
                           manageAttributes={goToAttributeSettings}
                        />
                     ) : (
                        <div className="min-h-64 flex flex-col items-center justify-center gap-2 text-gray-500">
                           <SquarePen className="w-8 h-8" />
                           <div className="text-lg text-center">Select a Category</div>
                        </div>
                     )}
                     {getCategory.isLoading && (
                        <div className="bg-white/50 absolute top-0 left-0 w-full h-full flex justify-center items-center">
                           <Spinner />
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <Dialog ref={addDialogRef}>
            <DialogContent className="gap-6" aria-describedby="">
               <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
               </DialogHeader>
               <AddCategoryForm
                  ref={addFormRef}
                  parentCategory={targetParent}
                  variations={variations}
                  attributes={attributes}
                  loading={getCategory.isLoading || createCategory.isLoading}
                  onAdd={(data) => {
                     const payload: CategoryDTO = { ...data };
                     if (targetParent) payload.parentCategoryId = targetParent.categoryId;

                     createCategory.request(payload)
                        .onSuccess(onCreateCategorySuccess)
                        .onError((msg) => {
                           if (msg.includes("category_code_key") || msg.includes("duplicate key")) {
                              addFormRef.current?.setCodeError();
                           } else {
                              toast.error(msg);
                           }
                        });
                  }}
                  manageVariations={goToVariationSettings}
                  manageAttributes={goToAttributeSettings}
               />
            </DialogContent>
         </Dialog>

         <Dialog ref={deleteDialogRef}>
            <DialogContent aria-describedby="">
               <DialogHeader>
                  <DialogTitle>Delete Category</DialogTitle>
               </DialogHeader>
               <div>Are you sure you want to delete this category? It will delete all of its subcategories too.</div>
               <div className="grid grid-cols-2 gap-2">
                  <Button
                     disabled={deleteCategory.isLoading}
                     variant="secondary"
                     onClick={() => deleteDialogRef.current?.close()}
                  >
                     No
                  </Button>
                  <Button
                     disabled={deleteCategory.isLoading}
                     onClick={() => {
                        if (!deletionTarget) return;
                        if (deletionTarget.categoryId === selectedCategory?.categoryId) setSelectedCategory(null);

                        deleteCategory.request(deletionTarget.categoryId).onSuccess(() => {
                           if (!deletionTarget) return;

                           dispatch(updateCategories(removeCategoryByPath(categories, deletionTarget.path)));

                           setDeletionTarget(null);
                           deleteDialogRef.current?.close();
                        });
                     }}
                  >
                     {deleteCategory.isLoading && <Spinner />}
                     Yes
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      </>
   );
}

function addCategoryNode(tree: CategoryTree[], parentPath: string, newNode: Omit<CategoryTree, "path">): CategoryTree[] {
   if (!parentPath)
      return [
         ...tree,
         {
            ...newNode,
            path: `${tree.length}`,
         },
      ];

   return transformByPath(tree, parentPath, (list, index) => {
      const subcategories = list[index].subcategories;
      subcategories.push({
         ...newNode,
         path: `${parentPath}.${subcategories.length}`,
      });
   });
}

function removeCategoryByPath(tree: CategoryTree[], targetPath: string): CategoryTree[] {
   return transformByPath(tree, targetPath, (list, index) => list.splice(index, 1));
}

function transformByParentStack(
   tree: CategoryTree[],
   categoryData: CategoryData,
   action: (list: CategoryTree[], targetIndex: number) => void
): CategoryTree[] {
   let current: CategoryData | undefined = categoryData;
   const stack = [current.categoryId];
   while (current?.parentCategory) {
      stack.push(current.parentCategory.categoryId);
      current = current.parentCategory;
   }

   let tempTree = tree;
   while (true) {
      const id = stack.pop();
      const nodeIndex = tempTree.findIndex((cat) => cat.categoryId === id);
      if (nodeIndex === -1) return tree;

      const node = tempTree[nodeIndex];
      tempTree[nodeIndex] = {
         ...node,
      };
      if (stack.length) {
         tempTree = node.subcategories;
         continue;
      }
      action(tempTree, nodeIndex);
      break;
   }

   return [...tree];
}

function transformByPath(
   tree: CategoryTree[],
   path: string,
   action: (list: CategoryTree[], targetIndex: number) => void
): CategoryTree[] {
   const regexp = /\d+(?:\.\d+)*/;
   let tempTree = tree;
   if (!path || !regexp.test(path)) return tree;

   const pathParts = path.split(".");

   let level = 0;
   let i = 0;
   while (i < tempTree.length) {
      const node = tempTree[i];
      if (!regexp.test(node.path)) {
         i++;
         continue;
      }

      const nodePathParts = node.path.split(".");
      if (nodePathParts[nodePathParts.length - 1] !== pathParts[level]) {
         i++;
         continue;
      }

      tempTree[i] = {
         ...node,
      };

      if (level === pathParts.length - 1) {
         action(tempTree, i);
         break;
      }
      level++;
      i = 0;
      tempTree = node.subcategories;
   }

   return [...tree];
}

function registerCategoryDetails(categoryDetails: CategoryDetails): CategoryData {
   const { categoryId } = categoryDetails;
   if (categoryDetailsMap.has(categoryId)) return categoryDetailsMap.get(categoryId)!;

   const details = {
      ...categoryDetails,
      categoryId: categoryId,
      parentCategory: categoryDetails.parentCategory ? registerCategoryDetails(categoryDetails.parentCategory) : undefined,
      variationIds: categoryDetails.variations.map((v) => v.variationId),
      attributeIds: categoryDetails.attributes.map((a) => a.attributeId),
   };
   categoryDetailsMap.set(categoryId, details);
   return details;
}
