import { ApiResponse, ServiceFunction } from "@/types/api";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type DataFetchState<T> = {
    data?: T,
    hasError: boolean,
    isLoading: boolean,
};

export type ResponseHandler<R> = {
    apiResponsePromise: ApiResponse<R>,
    onSuccess: (callback: (res: R) => void) => ResponseHandler<R>,
    onError: (callback: (message: string) => void) => ResponseHandler<R>
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestFunction<T, R> = (...args: T extends any[]? T : [T]) => ResponseHandler<R>;

const useDataFetch = <T, R>(apiFunc: ServiceFunction<T, R>, options?: {
    defaultLoading?: boolean,
    defaultValue?: R,
}): {
    request: RequestFunction<T, R>,
} & DataFetchState<R> => {
    const [dataFetchState, setDataFetchState] = useState<DataFetchState<R>>({
        data: options?.defaultValue,
        hasError: false,
        isLoading: options?.defaultLoading ?? false
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = useCallback((...args: T extends any[] ? T : [T]) => {
        setDataFetchState(prev => ({...prev, hasError: false, isLoading: true}));
        const responseHandler = {
            onSuccess(_res: R) { void _res; },
            onError(message: string) { toast.error(message, { richColors: true }); }
        };

        const promise = apiFunc(...args).then(result => {
            let hasError = false;
            let data = options?.defaultValue;
            try {
                if (result.success) {
                    data = result.data;
                    responseHandler.onSuccess(data);
                } else {
                    hasError = true;
                    responseHandler.onError(result.error);
                }
            } catch (e) {
                hasError = true;
                if (e instanceof Error)
                    responseHandler.onError(e.message);
            }

            setDataFetchState({
                data, hasError,
                isLoading: false
            });
            return result;
        });

        return {
            apiResponsePromise: promise,
            onSuccess(callback: (res: R) => void) {
                responseHandler.onSuccess = callback;
                return this;
            },
            onError(callback: (message: string) => void) {
                responseHandler.onError = callback;
                return this;
            }
        }
    }, [apiFunc, options?.defaultValue]);

    return useMemo(() => ({ request, ...dataFetchState }), [dataFetchState, request]);
};

export default useDataFetch;
