"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CategoryTree, CategoryDetails } from "@/types/domains/category";
import { Variation } from "@/types/domains/variation";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { ProductPayload } from "@/types/domains/product";
import { extractConsonants } from "@/lib/utils";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import { FileSpreadsheet, Upload, CheckCircle2, XCircle, AlertCircle, HardDrive } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "uploading" | "success" | "failed";

interface ValidatedProduct {
    sheetId: string;
    rowIndex: number;
    title: string;
    categoryName: string;
    shippingName: string;
    variantCount: number;
    errors: string[];
    payload: ProductPayload | null;
    uploadStatus: UploadStatus;
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

function flattenCategoryTree(tree: CategoryTree[]): { categoryId: number; name: string; path: string }[] {
    const result: { categoryId: number; name: string; path: string }[] = [];
    function walk(nodes: CategoryTree[]) {
        nodes.forEach((node) => {
            result.push({ categoryId: node.categoryId, name: node.name, path: node.path });
            if (node.subcategories?.length) walk(node.subcategories);
        });
    }
    walk(tree);
    return result;
}

function resolveCategory(
    value: string,
    flatCategories: { categoryId: number; name: string; path: string }[]
): { categoryId: number | null; error: string | null } {
    const normalized = value.toLowerCase().trim().replace(/\s*>\s*/g, " > ");

    // Try exact leaf name match
    const leafMatches = flatCategories.filter((c) => c.name.toLowerCase().trim() === normalized);
    if (leafMatches.length === 1) return { categoryId: leafMatches[0].categoryId, error: null };

    // Try path suffix match (handles "Canvas > Abstract" disambiguation)
    const pathMatches = flatCategories.filter((c) =>
        c.path.toLowerCase().replace(/\s*>\s*/g, " > ").endsWith(normalized)
    );
    if (pathMatches.length === 1) return { categoryId: pathMatches[0].categoryId, error: null };
    if (pathMatches.length > 1) {
        return {
            categoryId: null,
            error: `Category "${value}" is ambiguous. Found in: ${pathMatches.map((m) => m.path).join(", ")}. Use a more specific name.`,
        };
    }

    // Ambiguous leaf match
    if (leafMatches.length > 1) {
        return {
            categoryId: null,
            error: `Category "${value}" is ambiguous. Found in: ${leafMatches.map((m) => m.path).join(", ")}. Use a more specific name.`,
        };
    }

    return { categoryId: null, error: `Category "${value}" not found.` };
}

function collectFromCategoryChain(details: CategoryDetails): {
    variationIds: number[];
    attributes: { attributeId: number; name: string; type: string; allowedValues: string[] }[];
    categoryCode: string;
    categoryName: string;
} {
    const variationIdSet = new Set<number>();
    const attributeMap = new Map<number, { attributeId: number; name: string; type: string; allowedValues: string[] }>();
    let current: CategoryDetails | undefined = details;
    while (current) {
        current.variations.forEach((v) => variationIdSet.add(v.variationId));
        current.attributes.forEach((a) =>
            attributeMap.set(a.attributeId, {
                attributeId: a.attributeId,
                name: a.name,
                type: a.type,
                allowedValues: a.allowedValues ?? [],
            })
        );
        current = current.parentCategory;
    }
    return {
        variationIds: Array.from(variationIdSet).sort(),
        attributes: Array.from(attributeMap.values()),
        categoryCode: details.code,
        categoryName: details.name,
    };
}

async function resolveProducts(
    sheetProducts: Record<string, string>[],
    sheetVariants: Record<string, string>[],
    categoryTree: CategoryTree[],
    shippingMethods: ShippingMethod[],
    variations: Variation[]
): Promise<ValidatedProduct[]> {
    // ── Build reference maps ──────────────────────────────────────────────────
    const flatCategories = flattenCategoryTree(categoryTree);

    const shippingMap = new Map<string, number>();
    shippingMethods.forEach((sm) => shippingMap.set(sm.name.toLowerCase().trim(), sm.shippingMethodId));

    const variationMap = new Map<string, Variation>();
    variations.forEach((v) => variationMap.set(v.name.toLowerCase().trim(), v));

    // ── Detect duplicate IDs in Tab 1 ────────────────────────────────────────
    const idCounts = new Map<string, number>();
    sheetProducts.forEach((row) => {
        const id = row["id"]?.trim() ?? "";
        idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    });

    // ── Group Tab 2 rows by productId (O(n), built once) ─────────────────────
    const variantsByProductId = new Map<string, Record<string, string>[]>();
    sheetVariants.forEach((row) => {
        const pid = row["productId"]?.trim() ?? "";
        if (!variantsByProductId.has(pid)) variantsByProductId.set(pid, []);
        variantsByProductId.get(pid)!.push(row);
    });

    // Warn about orphan Tab 2 rows
    const tab1Ids = new Set(sheetProducts.map((r) => r["id"]?.trim() ?? ""));
    const orphans: string[] = [];
    variantsByProductId.forEach((_, pid) => {
        if (pid && !tab1Ids.has(pid)) orphans.push(pid);
    });
    if (orphans.length > 0) {
        toast.warning(`Tab 2 has rows with unknown productId(s): ${orphans.join(", ")}`);
    }

    // ── Resolve categories and fetch CategoryDetails (deduplicated, parallel) ─
    const uniqueCategoryValues = [...new Set(sheetProducts.map((r) => r["category"]?.trim() ?? "").filter(Boolean))];
    const categoryResolutionMap = new Map<string, { categoryId: number | null; error: string | null }>();
    uniqueCategoryValues.forEach((val) => {
        categoryResolutionMap.set(val, resolveCategory(val, flatCategories));
    });

    const uniqueCategoryIds = new Set<number>();
    categoryResolutionMap.forEach((res) => {
        if (res.categoryId) uniqueCategoryIds.add(res.categoryId);
    });

    const categoryDetailsMap = new Map<number, CategoryDetails>();
    await Promise.all(
        Array.from(uniqueCategoryIds).map(async (categoryId) => {
            try {
                const res = await fetch("/api/forward", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: `/categories/${categoryId}`, method: "GET" }),
                });
                if (res.ok) {
                    const details: CategoryDetails = await res.json();
                    categoryDetailsMap.set(categoryId, details);
                }
            } catch {
                // will surface as missing details downstream
            }
        })
    );

    // ── Process each product row ──────────────────────────────────────────────
    const results: ValidatedProduct[] = [];

    for (let i = 0; i < sheetProducts.length; i++) {
        const row = sheetProducts[i];
        const errors: string[] = [];

        const sheetId    = row["id"]?.trim() ?? "";
        const title      = row["title"]?.trim() ?? "";
        const desc       = row["description"]?.trim() ?? "";
        const catValue   = row["category"]?.trim() ?? "";
        const shipValue  = row["shippingMethod"]?.trim() ?? "";
        const starred    = row["starred"]?.toLowerCase().trim() === "true";
        const imageRaw   = row["imageUrls"]?.trim() ?? "";

        // Required field checks
        if (!sheetId)    errors.push("'id' column is empty.");
        if (!title)      errors.push("'title' column is empty.");
        if (!desc)       errors.push("'description' column is empty.");
        if (!catValue)   errors.push("'category' column is empty.");
        if (!shipValue)  errors.push("'shippingMethod' column is empty.");

        // Duplicate ID check
        if (sheetId && (idCounts.get(sheetId) ?? 0) > 1) {
            errors.push(`Duplicate id "${sheetId}" — ids must be unique across Tab 1.`);
        }

        // Resolve category
        const catRes = catValue ? categoryResolutionMap.get(catValue) : null;
        const categoryId = catRes?.categoryId ?? null;
        if (catRes?.error) errors.push(catRes.error);

        // Resolve shipping method
        let shippingMethodId: number | null = null;
        if (shipValue) {
            const smId = shippingMap.get(shipValue.toLowerCase());
            if (smId === undefined) errors.push(`Shipping method "${shipValue}" not found.`);
            else shippingMethodId = smId;
        }

        // Parse images
        const images = imageRaw
            ? imageRaw.split(",").map((url, idx) => ({ imageUrl: url.trim(), isDefault: idx === 0 })).filter((img) => img.imageUrl)
            : [];

        // Auto-generate product code
        const code = extractConsonants(title).toUpperCase();

        // Get category details and collect inherited variations + attributes
        const categoryDetails = categoryId ? categoryDetailsMap.get(categoryId) : null;
        let expectedVariationIds: number[] = [];
        let expectedAttributes: { attributeId: number; name: string; type: string; allowedValues: string[] }[] = [];
        let categoryCode = "";
        let categoryName = catValue;

        if (categoryDetails) {
            const chain = collectFromCategoryChain(categoryDetails);
            expectedVariationIds = chain.variationIds;
            expectedAttributes   = chain.attributes;
            categoryCode         = chain.categoryCode;
            categoryName         = chain.categoryName;
        }

        // Resolve attributes from attr_ columns
        const attributes: { attributeId: number; value: string }[] = [];
        if (categoryDetails) {
            expectedAttributes.forEach((attr) => {
                const colKey = `attr_${attr.name}`;
                const val = row[colKey]?.trim() ?? "";
                if (attr.type === "ENUMERATED" && val && !attr.allowedValues.includes(val)) {
                    errors.push(
                        `attr_${attr.name}: "${val}" is not valid. Allowed values: ${attr.allowedValues.join(", ")}.`
                    );
                }
                if (val) attributes.push({ attributeId: attr.attributeId, value: val });
            });
        }

        // Find variant rows for this product (O(1) lookup)
        const variantRows = variantsByProductId.get(sheetId) ?? [];
        if (sheetId && variantRows.length === 0 && !errors.some((e) => e.includes("'id' column"))) {
            errors.push(`No variant rows found in Tab 2 for id "${sheetId}".`);
        }

        // Resolve variants
        const variants: ProductPayload["variants"] = [];

        if (variantRows.length > 0 && categoryDetails) {
            const fixedCols = new Set(["productId", "price", "qty", "disabled"]);
            const allVariationCols = Object.keys(variantRows[0]).filter((k) => !fixedCols.has(k));

            // Expected variation names for THIS product's category only
            const expectedVarNames = expectedVariationIds
                .map((vId) => variations.find((v) => v.variationId === vId)?.name)
                .filter(Boolean) as string[];

            // Only use columns that belong to this product's category — ignore the rest
            // This allows mixed-category sheets where different products have different variation columns
            const variationCols = allVariationCols.filter((col) =>
                expectedVarNames.some((n) => n.toLowerCase() === col.toLowerCase())
            );

            // Only check for MISSING expected columns — extra columns are fine (they belong to other categories)
            expectedVarNames.forEach((name) => {
                if (!allVariationCols.some((c) => c.toLowerCase() === name.toLowerCase())) {
                    errors.push(`Tab 2 is missing column "${name}" required by category "${categoryName}".`);
                }
            });

            // Process each variant row
            const seenCombos = new Set<string>();

            for (let vi = 0; vi < variantRows.length; vi++) {
                const vRow = variantRows[vi];
                const price = parseFloat(vRow["price"] ?? "");
                const qty   = parseInt(vRow["qty"] ?? "");
                const disabled = vRow["disabled"]?.toLowerCase().trim() === "true";

                if (isNaN(price) || price < 0) {
                    errors.push(`Variant row ${vi + 1} (id "${sheetId}"): invalid price "${vRow["price"]}".`);
                    continue;
                }
                if (isNaN(qty) || qty < 0) {
                    errors.push(`Variant row ${vi + 1} (id "${sheetId}"): invalid qty "${vRow["qty"]}".`);
                    continue;
                }

                const variationOptionIds: number[] = [];
                const optCodes: string[] = [];
                let hasError = false;

                for (const colName of variationCols) {
                    const optValue = vRow[colName]?.trim() ?? "";
                    const variation = variations.find((v) => v.name.toLowerCase() === colName.toLowerCase());
                    if (!variation) continue;

                    const option = variation.variationOptions.find(
                        (o) => o.name.toLowerCase() === optValue.toLowerCase()
                    );
                    if (!option) {
                        errors.push(
                            `Variant row ${vi + 1}: "${optValue}" is not a valid option for "${colName}". ` +
                            `Valid: ${variation.variationOptions.map((o) => o.name).join(", ")}.`
                        );
                        hasError = true;
                        break;
                    }
                    variationOptionIds.push(option.variationOptionId);
                    optCodes.push(option.code);
                }
                if (hasError) continue;

                // Duplicate combo check
                const comboKey = [...variationOptionIds].sort().join("-");
                if (seenCombos.has(comboKey)) {
                    const desc = variationCols.map((col) => `${col}:${vRow[col]}`).join(", ");
                    errors.push(`Duplicate variant combination for id "${sheetId}": ${desc}.`);
                    continue;
                }
                seenCombos.add(comboKey);

                // Auto-generate SKU
                const sku = [categoryCode, code, ...optCodes].filter(Boolean).join("-");

                variants.push({ sku, price, quantityInStock: qty, disabled, variationOptionIds });
            }
        }

        // Assemble payload only when there are no errors
        const payload: ProductPayload | null =
            errors.length === 0
                ? {
                      title,
                      code,
                      description: desc,
                      starred,
                      status: true,
                      categoryId: categoryId!,
                      shippingMethodId: shippingMethodId ?? undefined,
                      images,
                      variants,
                      attributes,
                  }
                : null;

        results.push({
            sheetId,
            rowIndex: i + 1,
            title,
            categoryName,
            shippingName: shipValue,
            variantCount: variants.length,
            errors,
            payload,
            uploadStatus: "idle",
        });
    }

    return results;
}

// ─── Local Excel parser ───────────────────────────────────────────────────────

function parseExcelFile(file: File): Promise<{ products: Record<string, string>[]; variants: Record<string, string>[] }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });

                const productsSheetName = workbook.SheetNames.find(
                    (n) => n.toLowerCase().trim() === "products"
                );
                const variantsSheetName = workbook.SheetNames.find(
                    (n) => n.toLowerCase().trim() === "variants"
                );

                if (!productsSheetName) {
                    reject(new Error('No sheet named "products" found in the Excel file.'));
                    return;
                }

                const toRows = (sheetName: string): Record<string, string>[] => {
                    const sheet = workbook.Sheets[sheetName];
                    const rows: Record<string, string>[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
                    if (rows.length < 2) return [];
                    const headers = (rows[0] as unknown as string[]).map((h) => String(h).trim());
                    return rows
                        .slice(1)
                        .filter((row) => (row as unknown as string[]).some((cell) => String(cell).trim()))
                        .map((row) => {
                            const obj: Record<string, string> = {};
                            headers.forEach((header, i) => {
                                obj[header] = String((row as unknown as string[])[i] ?? "").trim();
                            });
                            return obj;
                        });
                };

                resolve({
                    products: toRows(productsSheetName),
                    variants: variantsSheetName ? toRows(variantsSheetName) : [],
                });
            } catch (err) {
                reject(err instanceof Error ? err : new Error("Failed to parse Excel file."));
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkUploadPage() {
    const [openPicker, authResponse] = useDrivePicker();
    const authRef = useRef(authResponse);
    useEffect(() => { authRef.current = authResponse; }, [authResponse]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isValidating, setIsValidating] = useState(false);
    const [isUploading, setIsUploading]   = useState(false);
    const [products, setProducts]         = useState<ValidatedProduct[]>([]);

    const readyCount  = products.filter((p) => p.errors.length === 0).length;
    const errorCount  = products.filter((p) => p.errors.length > 0).length;
    const hasProducts = products.length > 0;

    // ── Shared: validate parsed rows against the backend ──────────────────────
    const validateAndSet = useCallback(async (sheetProducts: Record<string, string>[], sheetVariants: Record<string, string>[]) => {
        if (!sheetProducts.length) { toast.error('No rows found in the "products" sheet/tab.'); return; }

        const [catRes, shipRes, varRes] = await Promise.all([
            fetch("/api/forward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: "/categories", method: "GET" }),
            }),
            fetch("/api/forward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: "/shipping-methods", method: "GET" }),
            }),
            fetch("/api/forward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: "/variations", method: "GET" }),
            }),
        ]);

        if (!catRes.ok || !shipRes.ok || !varRes.ok) {
            toast.error("Failed to load reference data from the backend.");
            return;
        }

        const [categoryTree, shippingMethods, variations]: [CategoryTree[], ShippingMethod[], Variation[]] =
            await Promise.all([catRes.json(), shipRes.json(), varRes.json()]);

        const validated = await resolveProducts(sheetProducts, sheetVariants, categoryTree, shippingMethods, variations);
        setProducts(validated);
    }, []);

    // ── Load & validate from Google Drive ─────────────────────────────────────
    const loadAndValidate = useCallback(async (sheetId: string, accessToken: string) => {
        setIsValidating(true);
        setProducts([]);
        try {
            const sheetRes = await fetch("/api/bulk-upload/fetchSheetData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sheetId, accessToken }),
            });
            const sheetJson = await sheetRes.json();
            if (sheetJson.error) { toast.error(sheetJson.error); return; }
            await validateAndSet(sheetJson.products ?? [], sheetJson.variants ?? []);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Unexpected error during validation.");
        } finally {
            setIsValidating(false);
        }
    }, [validateAndSet]);

    // ── Load & validate from local Excel file ─────────────────────────────────
    const handleLocalFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset so the same file can be re-selected
        e.target.value = "";

        setIsValidating(true);
        setProducts([]);
        try {
            const { products: sheetProducts, variants: sheetVariants } = await parseExcelFile(file);
            await validateAndSet(sheetProducts, sheetVariants);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to parse Excel file.");
        } finally {
            setIsValidating(false);
        }
    }, [validateAndSet]);

    // ── Open Drive picker ──────────────────────────────────────────────────────
    const handleSelectSheet = useCallback(() => {
        openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
            token: authRef.current?.access_token,
            viewId: "SPREADSHEETS",
            viewMimeTypes: "application/vnd.google-apps.spreadsheet",
            supportDrives: true,
            callbackFunction(data) {
                if (data.action !== "picked") return;
                const sheetId = data.docs[0].id;
                const token = authRef.current?.access_token;
                if (!token) { toast.error("No Google access token. Please try again."); return; }
                loadAndValidate(sheetId, token);
            },
        });
    }, [openPicker, loadAndValidate]);

    // ── Upload ─────────────────────────────────────────────────────────────────
    const handleUpload = useCallback(async () => {
        const toUpload = products.filter((p) => p.errors.length === 0 && p.uploadStatus === "idle");
        if (!toUpload.length) return;

        setIsUploading(true);

        // Mark all ready as uploading
        setProducts((prev) =>
            prev.map((p) =>
                p.errors.length === 0 && p.uploadStatus === "idle"
                    ? { ...p, uploadStatus: "uploading" }
                    : p
            )
        );

        await Promise.all(
            toUpload.map(async (product) => {
                try {
                    const res = await fetch("/api/forward", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            path: "/products",
                            method: "POST",
                            body: product.payload,
                        }),
                    });
                    const uploadStatus: UploadStatus = res.ok ? "success" : "failed";
                    setProducts((prev) =>
                        prev.map((p) => (p.sheetId === product.sheetId ? { ...p, uploadStatus } : p))
                    );
                } catch {
                    setProducts((prev) =>
                        prev.map((p) => (p.sheetId === product.sheetId ? { ...p, uploadStatus: "failed" } : p))
                    );
                }
            })
        );

        setIsUploading(false);
    }, [products]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Hidden file input for local Excel upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleLocalFile}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Products</h1>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isValidating || isUploading}
                        variant="outline"
                        className="gap-2"
                    >
                        <HardDrive className="size-4" />
                        Upload Excel from Device
                    </Button>
                    <Button
                        onClick={handleSelectSheet}
                        disabled={isValidating || isUploading}
                        variant="outline"
                        className="gap-2"
                    >
                        {isValidating ? <Spinner className="size-4" /> : <FileSpreadsheet className="size-4" />}
                        {isValidating ? "Validating…" : "Select Sheet from Google Drive"}
                    </Button>
                </div>
            </div>

            {/* Instructions */}
            {!hasProducts && !isValidating && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">How to format your spreadsheet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Use <strong>Select Sheet from Google Drive</strong> to pick a Google Sheet, or <strong>Upload Excel from Device</strong> to upload a local <code>.xlsx</code> / <code>.xls</code> file.
                            Either way the file must have exactly two sheets/tabs named <strong>products</strong> and <strong>variants</strong>.
                        </p>

                        <div>
                            <p className="font-medium text-foreground mb-1">Tab 1 — products</p>
                            <code className="block bg-muted rounded p-2 text-xs">
                                id | title | description | category | shippingMethod | starred | imageUrls | attr_&#123;AttributeName&#125; …
                            </code>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li><strong>id</strong> — any unique value per row (e.g. 1, 2, 3). Never stored in the database.</li>
                                <li><strong>category</strong> — leaf category name (e.g. <em>Abstract</em>). If ambiguous, add parent path (e.g. <em>Canvas &gt; Abstract</em>).</li>
                                <li><strong>shippingMethod</strong> — exact name as shown in the admin panel.</li>
                                <li><strong>starred</strong> — true / false.</li>
                                <li><strong>imageUrls</strong> — comma-separated Google Drive image URLs.</li>
                                <li><strong>attr_&#123;name&#125;</strong> — one column per attribute that the category requires (e.g. <em>attr_Material</em>).</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-medium text-foreground mb-1">Tab 2 — variants</p>
                            <code className="block bg-muted rounded p-2 text-xs">
                                productId | &#123;VariationName&#125; … | price | qty | disabled
                            </code>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li><strong>productId</strong> — matches the <em>id</em> from Tab 1.</li>
                                <li>Variation columns (e.g. <em>Size</em>, <em>Frame</em>) — exact variation name, one column each.</li>
                                <li>Values must match exact option names (e.g. <em>Small</em>, <em>Framed</em>).</li>
                                <li>One row per variant combination.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Validation results table */}
            {hasProducts && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">
                            Validation Results — {products.length} product{products.length !== 1 ? "s" : ""}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm">
                            {readyCount > 0 && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="size-4" /> {readyCount} ready
                                </span>
                            )}
                            {errorCount > 0 && (
                                <span className="flex items-center gap-1 text-red-600">
                                    <XCircle className="size-4" /> {errorCount} error{errorCount !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Shipping</TableHead>
                                        <TableHead className="w-24">Variants</TableHead>
                                        <TableHead className="w-28">Status</TableHead>
                                        <TableHead>Errors / Info</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((p) => (
                                        <TableRow key={p.sheetId || p.rowIndex}>
                                            <TableCell className="text-muted-foreground">{p.rowIndex}</TableCell>
                                            <TableCell className="font-mono text-xs">{p.sheetId}</TableCell>
                                            <TableCell className="font-medium max-w-48 truncate">{p.title || <span className="text-muted-foreground italic">empty</span>}</TableCell>
                                            <TableCell className="text-sm">{p.categoryName || "—"}</TableCell>
                                            <TableCell className="text-sm">{p.shippingName || "—"}</TableCell>
                                            <TableCell className="text-center">{p.variantCount}</TableCell>
                                            <TableCell>
                                                {p.uploadStatus === "uploading" && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Spinner className="size-3" /> Uploading
                                                    </Badge>
                                                )}
                                                {p.uploadStatus === "success" && (
                                                    <Badge className="bg-green-600 gap-1">
                                                        <CheckCircle2 className="size-3" /> Uploaded
                                                    </Badge>
                                                )}
                                                {p.uploadStatus === "failed" && (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <XCircle className="size-3" /> Failed
                                                    </Badge>
                                                )}
                                                {p.uploadStatus === "idle" && p.errors.length === 0 && (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>
                                                )}
                                                {p.uploadStatus === "idle" && p.errors.length > 0 && (
                                                    <Badge variant="destructive">Error</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {p.errors.length > 0 ? (
                                                    <ul className="space-y-0.5">
                                                        {p.errors.map((err, ei) => (
                                                            <li key={ei} className="flex items-start gap-1 text-xs text-red-600">
                                                                <AlertCircle className="size-3 mt-0.5 shrink-0" />
                                                                {err}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload button */}
            {hasProducts && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isValidating || isUploading}
                            className="gap-2"
                        >
                            <HardDrive className="size-4" />
                            Re-upload from Device
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleSelectSheet}
                            disabled={isValidating || isUploading}
                            className="gap-2"
                        >
                            {isValidating ? <Spinner className="size-4" /> : <FileSpreadsheet className="size-4" />}
                            {isValidating ? "Validating…" : "Re-select from Drive"}
                        </Button>
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || readyCount === 0}
                        className="gap-2"
                    >
                        {isUploading ? <Spinner className="size-4" /> : <Upload className="size-4" />}
                        {isUploading ? "Uploading…" : `Upload ${readyCount} Product${readyCount !== 1 ? "s" : ""}`}
                    </Button>
                </div>
            )}
        </div>
    );
}
