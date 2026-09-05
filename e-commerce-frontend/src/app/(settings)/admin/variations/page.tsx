"use client"
import React, { useCallback, useState } from 'react';
import VariationItem from './components/VariationItem';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import VariationItemsSkeleton from './components/VariationItemsSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VariationForm from './components/VariationForm';
import { Variation, VariationUpdationPayload } from '@/types/domains/variation';
import * as variationServices from '@/services/variation';
import useDataFetch from '@/hooks/use-data-fetch';
import { updateVariations } from '@/store/slices/variationSlice';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

export default function VariationSettingsPage() {
    const dispatch = useAppDispatch();
    const { items, loading, error } = useAppSelector(state => state.variations);
    const addVariationRef = React.useRef<{ open(): void, close(): void }>(null);
    const editVariationRef = React.useRef<{ open(): void, close(): void }>(null);
    const deleteDialogRef = React.useRef<{ open(): void, close(): void }>(null);
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
    const [deletionTarget, setDeletionTarget] = useState<Variation | null>(null);
    const addVariation = useDataFetch(variationServices.createVariation);
    const editVariation = useDataFetch(variationServices.updateVariation);
    const deleteVariation = useDataFetch(variationServices.deleteVariation);

    const onEdit = useCallback((variation: Variation) => {
        setSelectedVariation(variation);
        editVariationRef.current?.open();
    }, []);

    const onDelete = useCallback((variation: Variation) => {
        setDeletionTarget(variation);
        deleteDialogRef.current?.open();
    }, []);

    return <>
        <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Variations</h1>
            <div className="max-w-md py-2 space-y-2">
                {loading ?
                    <VariationItemsSkeleton /> :
                    (!error && items.length) ? items.map(item => <VariationItem key={item.variationId}
                        variation={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />):
                    <div className="border rounded-md h-9 bg-background px-3.5 flex items-center text-gray-400">
                        No variations created! Click the button below to create one now.
                    </div>
                }
                <div className="rounded-md cursor-pointer h-9 hover:bg-accent px-3.5 flex items-center gap-2 text-gray-600"
                    onClick={() => addVariationRef.current?.open()}
                >
                    <Plus className="w-4 h-4" />
                    <div className="font-medium text-base">Add Variation</div>
                </div>
            </div>
        </div>

        <Dialog ref={addVariationRef}>
            <DialogContent className='gap-6' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Add Variation</DialogTitle>
                </DialogHeader>
                <VariationForm
                    loading={addVariation.isLoading}
                    onSubmit={data => addVariation.request({
                            name: data.name,
                            variationOptions: data.variationOptions.map(item => ({
                                name: item.name,
                                code: item.code
                            }))
                        }).onSuccess(res => {
                            dispatch(updateVariations([...items, res]));
                            addVariationRef.current?.close();
                        })
                    }
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={editVariationRef}>
            <DialogContent className='gap-6' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Edit Variation</DialogTitle>
                </DialogHeader>
                <VariationForm
                    variation={selectedVariation!}
                    loading={editVariation.isLoading}
                    onSubmit={(data: VariationUpdationPayload) => editVariation
                        .request(selectedVariation!.variationId, data)
                        .onSuccess(res => {
                            dispatch(updateVariations(items.map(item => item.variationId === res.variationId? res : item)));
                            setSelectedVariation(null);
                            editVariationRef.current?.close();
                        })
                    }
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={deleteDialogRef}>
            <DialogContent aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Delete Variation</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to delete this variation? It will delete all its associations too.</div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => deleteDialogRef.current?.close()}>No</Button>
                    <Button onClick={() => {
                        deleteVariation.request(deletionTarget!.variationId)
                            .onSuccess(() => {
                                dispatch(updateVariations(items.filter(item => item.variationId !== deletionTarget!.variationId)));
                                setDeletionTarget(null);
                                deleteDialogRef.current?.close();
                            });
                    }}>
                        {deleteVariation.isLoading && <Spinner />}
                        Yes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>;
};
