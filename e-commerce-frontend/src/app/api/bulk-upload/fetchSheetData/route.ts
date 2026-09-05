import { NextRequest, NextResponse } from "next/server";

async function fetchTab(sheetId: string, tabName: string, accessToken: string): Promise<string[][]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Tab "${tabName}" not found in the sheet.`);
    }
    const data = await res.json();
    return (data.values as string[][]) || [];
}

function parseTab(values: string[][]): Record<string, string>[] {
    if (values.length < 2) return [];
    const headers = values[0].map((h) => h.trim());
    return values
        .slice(1)
        .filter((row) => row.some((cell) => cell?.trim()))
        .map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((header, i) => {
                obj[header] = (row[i] ?? "").trim();
            });
            return obj;
        });
}

export async function POST(req: NextRequest) {
    try {
        const { sheetId, accessToken } = await req.json();

        if (!sheetId || !accessToken) {
            return NextResponse.json({ error: "Missing sheetId or accessToken." }, { status: 400 });
        }

        let productsValues: string[][] = [];
        let variantsValues: string[][] = [];

        try {
            productsValues = await fetchTab(sheetId, "products", accessToken);
        } catch (e: unknown) {
            return NextResponse.json(
                { error: `Could not read "products" tab: ${e instanceof Error ? e.message : "unknown error"}` },
                { status: 400 }
            );
        }

        try {
            variantsValues = await fetchTab(sheetId, "variants", accessToken);
        } catch (e: unknown) {
            return NextResponse.json(
                { error: `Could not read "variants" tab: ${e instanceof Error ? e.message : "unknown error"}` },
                { status: 400 }
            );
        }

        return NextResponse.json({
            products: parseTab(productsValues),
            variants: parseTab(variantsValues),
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unexpected error reading sheet." },
            { status: 500 }
        );
    }
}
