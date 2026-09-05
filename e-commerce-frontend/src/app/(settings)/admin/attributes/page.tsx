/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Spinner from "@/components/ui/spinner";
import useDataFetch from "@/hooks/use-data-fetch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Attribute } from "@/types/domains/attribute";
import { Pen, Plus, SquarePen, Trash } from "lucide-react";
import * as attributeServices from "@/services/attribute";
import { updateAttributes } from "@/store/slices/attributeSlice";
import AttributeForm from "./components/AttributeForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttributeSettingsPage() {
    const dispatch = useAppDispatch();
    const { items, loading, error } = useAppSelector(state => state.attributes);
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
    const [deletionTarget, setDeletionTarget] = useState<Attribute | null>(null);
    const addDialogRef = React.useRef<{ open(): void, close(): void }>(null);
    const deleteDialogRef = React.useRef<{ open(): void, close(): void }>(null);
    const createAttribute = useDataFetch(attributeServices.createAttribute);
    const updateAttribute = useDataFetch(attributeServices.updateAttribute);
    const deleteAttribute = useDataFetch(attributeServices.deleteAttribute);

    return (<>
        <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Attributes</h1>
            <div className="flex-1 flex gap-4">
                <div className="flex-[7] min-w-0 space-y-2 py-2">
                    {loading? [1, 2, 3].map(n => <div key={n} className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                            <div className="pl-2.5 min-w-0 flex items-center gap-1">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex gap-1">
                                <Skeleton className="w-12 h-4" />
                                <Skeleton className="w-4 h-4" />
                            </div>
                        </div>):
                        (!error && items.length) ? items.map(item => <div key={item.attributeId} className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
                            <div className="pl-2.5 min-w-0 flex items-center gap-1.5 font-medium">
                                <span className="text-gray-900 overflow-hidden whitespace-nowrap overflow-ellipsis">
                                    {item.name}
                                </span>
                                ·
                                <span className="text-muted-foreground">{item.type}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost"
                                    size={"none" as Parameters<typeof Button>[0]["size"]}
                                    className="px-2 h-6 text-sm"
                                    onClick={() => {
                                        setSelectedAttribute(item);
                                    }}
                                >
                                    <Pen style={{ width: '0.85rem', height: '0.85rem' }} className="text-gray-600" />
                                    <span className="text-gray-600">Edit</span>
                                </Button>
                                <Button variant="ghost"
                                    size={"none" as Parameters<typeof Button>[0]["size"]}
                                    className="px-1 h-6"
                                    onClick={() => {
                                        setDeletionTarget(item);
                                        deleteDialogRef.current?.open();
                                    }}
                                >
                                    <Trash className="w-4 h-4 text-gray-600" />
                                </Button>
                            </div>
                        </div>):
                        <div className="border rounded-md h-9 bg-background px-3.5 flex items-center text-gray-400">
                            No attributes created! Click the button below to create one now.
                        </div>
                    }
                    <div className="rounded-md cursor-pointer h-9 hover:bg-accent px-3.5 flex items-center gap-2 text-gray-600"
                        onClick={() => {
                            addDialogRef.current?.open();
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        <div className="font-medium text-base">Add Attribute</div>
                    </div>
                </div>
                <div className="sticky top-0 flex-[5] min-w-0 h-min py-2">
                    <div className="relative bg-card text-card-foreground rounded-md border p-6">
                        {selectedAttribute ?
                            <AttributeForm loading={updateAttribute.isLoading}
                                attribute={selectedAttribute}
                                onSubmit={data => updateAttribute.request(
                                        selectedAttribute?.attributeId, data
                                    ).onSuccess(res => {
                                        dispatch(updateAttributes(items.map(item => item.attributeId === res.attributeId ? res : item)));
                                        setSelectedAttribute(null);
                                    })
                                }
                            />:
                            <div className="min-h-64 flex flex-col items-center justify-center gap-2 text-gray-500">
                                <SquarePen className="w-8 h-8" />
                                <div className="text-lg text-center">Select an Attribute</div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

        <Dialog ref={addDialogRef}>
            <DialogContent className="gap-6" aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Add Attribute</DialogTitle>
                </DialogHeader>
                <AttributeForm
                    loading={createAttribute.isLoading}
                    onSubmit={data => createAttribute.request(data).onSuccess(res => {
                        dispatch(updateAttributes([...items, res]));
                        addDialogRef.current?.close();
                    })}
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={deleteDialogRef}>
            <DialogContent aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Delete Attribute</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to delete this attribute? It will delete all of its associations too.</div>
                <div className="grid grid-cols-2 gap-2">
                    <Button disabled={deleteAttribute.isLoading}
                        variant="secondary"
                        onClick={() => deleteDialogRef.current?.close()}
                    >
                        No
                    </Button>
                    <Button disabled={deleteAttribute.isLoading}
                        onClick={() => {
                            if (!deletionTarget)
                                return;
                            if (deletionTarget.attributeId === selectedAttribute?.attributeId)
                                setSelectedAttribute(null);

                            deleteAttribute.request(deletionTarget.attributeId).onSuccess(() => {
                                dispatch(updateAttributes(items.filter(item => item.attributeId !== deletionTarget!.attributeId)));
                                setDeletionTarget(null);
                                deleteDialogRef.current?.close();
                            });
                        }}
                    >
                        {deleteAttribute.isLoading && <Spinner />}
                        Yes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>)
}