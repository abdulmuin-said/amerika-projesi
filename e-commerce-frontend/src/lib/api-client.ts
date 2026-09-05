import { ApiResponse, ContentType } from "@/types/api";

interface Options {
    params?: Record<string, unknown>;
    data?: unknown;
};

class ApiClient {
    private baseURL: string;
    private headers: Record<string, string>;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
        this.headers = {};
    }

    public setHeader(key: string, value: string) {
        this.headers[key] = value;
    }
    public appendHeader(key: string, value: string) {
        this.headers[key] = value;
        return this;
    }
    public removeHeader(key: string) {
        delete this.headers[key];
    }

    private async request<T>(method: string, endpoint: string, requestOptions: Options, contentType: ContentType): ApiResponse<T> {
        const safeParseResponseBody = async (response: Response): Promise<unknown> => {
            const text = await response.text();
            if (!text) return undefined;
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        };

        const params: Record<string, string> = {};
        if (requestOptions.params)
            Object.entries(requestOptions.params)
                .filter(([, value]) => value !== undefined && value !== null)
                .forEach(([key, value]) => params[key] = String(value));

        const url = `${this.baseURL}${endpoint}?${new URLSearchParams(params).toString()}`;
        const headers = {...this.headers};
        headers['Content-Type'] = contentType;

        const options: {
            method: string;
            path: string;
            headers?: HeadersInit;
            body?: BodyInit;
        } = {
            method,
            path: url,
            headers
        };
        if (requestOptions.data)
            options.body = requestOptions.data as BodyInit;

        try {
            const response = await fetch('/api/forward', {
                method: 'POST',
                body: JSON.stringify(options)
            });
            if (!response.ok)
                return safeParseResponseBody(response)
                    .then((data) => {
                        const message =
                            (data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string')
                                ? (data as { message: string }).message
                                : typeof data === 'string' && data.trim()
                                    ? data
                                    : `Request failed (${response.status})`;
                        return {
                            success: false,
                            error: message,
                        };
                    });

            if (contentType === ContentType.JSON && response.headers.get("content-type")?.includes(ContentType.JSON))
                return response.text()
                    .then(text => {
                        try {
                            return JSON.parse(text);
                        } catch {
                            return text;
                        }
                    })
                    .then(data => ({
                        data,
                        success: true
                    }));

            if (contentType === ContentType.TEXT)
                return response.text()
                    .then(text => ({
                        data: text as T,
                        success: true
                    }));

            const blob = await response.blob();
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    resolve(base64String);
                }
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            return {
                data: base64Data as T,
                success: true
            };
        } catch (error) {
            throw error;
        }
    }

    public get<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('GET', endpoint, options, contentType);
    }

    public post<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('POST', endpoint, options, contentType);
    }

    public put<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('PUT', endpoint, options, contentType);
    }

    public patch<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('PATCH', endpoint, options, contentType);
    }

    public delete<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('DELETE', endpoint, options, contentType);
    }
}

export default ApiClient;