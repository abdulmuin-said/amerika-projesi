"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import useDrivePicker from "react-google-drive-picker";

import { BannerImage } from "@/types/domains/bannerImage";
import * as bannerImagesService from "@/services/bannerImages";

export default function BannerImagesAdminPage() {
  const [makeDefault, setMakeDefault] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openPicker, authResponse] = useDrivePicker();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<BannerImage[]>([]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await bannerImagesService.getAllBannerImages();
      if (!res.success) {
        toast.error(res.error, { richColors: true });
        return;
      }
      setRows(res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const createFromUploadedUrl = useCallback(
    async (uploadedUrl: string) => {
      const createRes = await bannerImagesService.createBannerImage({
        imageUrl: uploadedUrl,
        isDefault: makeDefault,
      });
      if (!createRes.success) {
        toast.error(createRes.error, { richColors: true });
        return;
      }
      toast.success("Banner image created", { richColors: true });
      await refresh();
    },
    [makeDefault]
  );

  const handleDeviceUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      // Reset so same file can be re-selected
      e.target.value = "";

      setFile(f);
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("folder", "banners");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error((json && typeof json.error === "string" && json.error) || "Cloudinary upload failed", { richColors: true });
          return;
        }
        const uploadedUrl = json && typeof json.url === "string" ? json.url : null;
        if (!uploadedUrl?.startsWith("http")) {
          toast.error("Upload succeeded but invalid url returned.", { richColors: true });
          return;
        }
        setPreviewSrc(uploadedUrl);
        await createFromUploadedUrl(uploadedUrl);
      } finally {
        setIsUploading(false);
      }
    },
    [createFromUploadedUrl]
  );

  const handleOpenPicker = useCallback(() => {
    try {
      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
        token: authResponse?.access_token,
        viewId: "DOCS_IMAGES",
        multiselect: false,
        supportDrives: true,
        viewMimeTypes: "image/png,image/jpeg,image/jpg,image/gif,image/webp",
        callbackFunction: async (data) => {
          if (!(data.action === "picked" && data.docs && data.docs.length > 0)) return;
          const picked = data.docs[0];
          const fileId = picked.id;
          if (!fileId) return;

          const driveViewUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;

          setIsUploading(true);
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: driveViewUrl, folder: "banners" }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              toast.error((json && typeof json.error === "string" && json.error) || "Cloudinary upload failed", { richColors: true });
              return;
            }
            const uploadedUrl = json && typeof json.url === "string" ? json.url : null;
            if (!uploadedUrl?.startsWith("http")) {
              toast.error("Upload succeeded but invalid url returned.", { richColors: true });
              return;
            }
            setPreviewSrc(uploadedUrl);
            await createFromUploadedUrl(uploadedUrl);
          } finally {
            setIsUploading(false);
          }
        },
      });
    } catch {
      toast.error("Failed to open Google Drive picker. Please try again.");
    }
  }, [openPicker, authResponse, createFromUploadedUrl]);

  const setAsDefault = async (bannerImageId: number) => {
    const res = await bannerImagesService.updateBannerImage(bannerImageId, { isDefault: true });
    if (!res.success) {
      toast.error(res.error, { richColors: true });
      return;
    }
    toast.success("Default updated", { richColors: true });
    await refresh();
  };

  const remove = async (bannerImageId: number) => {
    const res = await bannerImagesService.deleteBannerImage(bannerImageId);
    if (!res.success) {
      toast.error(res.error, { richColors: true });
      return;
    }
    toast.success("Deleted", { richColors: true });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-white border flex items-center justify-center">
            <ImageIcon className="size-5 text-gray-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banner Images</h1>
            <p className="text-sm text-muted-foreground">Upload to storage, then create banner records.</p>
          </div>
        </div>

        <Button onClick={refresh} variant="outline" className="gap-2" disabled={isLoading}>
          {isLoading ? <Spinner className="size-4" /> : <RefreshCw className="size-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload + create banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Make default</p>
                <p className="text-xs text-muted-foreground">Create ke time default set.</p>
              </div>
              <Switch checked={makeDefault} onCheckedChange={setMakeDefault} />
            </div>

            <div className="space-y-3">
              <Label>Upload Source</Label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                className="hidden"
                onChange={handleDeviceUpload}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Upload from Device tile */}
                <div
                  className={`border bg-accent rounded-md h-32 flex flex-col justify-center items-center gap-2 cursor-pointer transition-opacity ${
                    isUploading ? "opacity-50 pointer-events-none" : "hover:bg-accent/80"
                  }`}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Spinner />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload from Device</p>
                    </>
                  )}
                </div>

                {/* Google Drive tile */}
                <div
                  className={`border bg-accent rounded-md h-32 flex flex-col justify-center items-center gap-2 cursor-pointer transition-opacity ${
                    isUploading ? "opacity-50 pointer-events-none" : "hover:bg-accent/80"
                  }`}
                  onClick={isUploading ? undefined : handleOpenPicker}
                >
                  <Plus className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Select from Google Drive</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Selected image uploads to Cloudinary and then creates a record in <span className="font-mono">/banner-images</span>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewSrc && !previewUrl ? (
              <div className="rounded-lg border bg-muted/40 h-60 flex items-center justify-center text-sm text-muted-foreground">
                Upload/select an image to preview
              </div>
            ) : (
              <div className="relative w-full h-60 rounded-lg border overflow-hidden bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc ?? previewUrl ?? ""}
                  alt="Banner preview"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.jpeg";
                  }}
                />
                <div className="absolute inset-0 bg-black/10" aria-hidden />
              </div>
            )}
            <Separator />
            <div className="text-xs text-muted-foreground">
              Preview matches the shop hero <span className="font-mono">HERO_RIGHT</span> (object-cover + overlay).
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All banner images</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="w-28">Image</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-28">Default</TableHead>
                  <TableHead className="w-52 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                      {isLoading ? "Loading…" : "No banner images found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.bannerImageId}>
                      <TableCell className="font-mono text-xs">{r.bannerImageId}</TableCell>
                      <TableCell>
                        <div className="h-14 w-24 rounded-md overflow-hidden border bg-muted/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.imageUrl}
                            alt={`Banner ${r.bannerImageId}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-image.jpeg";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs break-all text-muted-foreground">{r.imageUrl}</TableCell>
                      <TableCell>
                        {r.isDefault ? (
                          <span className="text-xs font-medium text-green-700">Yes</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!r.isDefault && (
                            <Button size="sm" variant="outline" onClick={() => void setAsDefault(r.bannerImageId)}>
                              Set default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => void remove(r.bannerImageId)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

