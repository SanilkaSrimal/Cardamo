"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, Camera, CheckCircle2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function ImageUpload({ onUpload, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = (file: File) => {
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) accept(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) accept(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={`group relative flex flex-col items-center overflow-hidden rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${
            dragging
              ? "border-brand-500 bg-brand-50 scale-[1.01]"
              : "border-gray-300 bg-gray-50/60 hover:border-brand-400 hover:bg-brand-50/60"
          }`}
        >
          <div className="absolute inset-0 dot-grid opacity-40" />

          <div className="relative">
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-brand-100 transition-transform duration-300 group-hover:scale-105 group-hover:ring-brand-300">
              <Upload
                className={`h-9 w-9 transition-colors ${
                  dragging ? "text-brand-600" : "text-gray-400 group-hover:text-brand-600"
                }`}
              />
            </span>
            <p className="text-lg font-bold text-gray-900 mb-1.5">
              {dragging ? "Drop your image here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG or JPEG — up to 10 MB</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Plain background", "Good lighting", "Sharp focus"].map((tip) => (
                <span
                  key={tip}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200"
                >
                  <CheckCircle2 size={12} className="text-brand-500" />
                  {tip}
                </span>
              ))}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-card">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-72 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-transparent" />

            <button
              onClick={clearFile}
              aria-label="Remove image"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-gray-700 backdrop-blur-sm shadow-lift transition-all hover:bg-red-600 hover:text-white"
            >
              <X size={18} />
            </button>

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-950/70 backdrop-blur-sm">
                <Loader2 className="h-9 w-9 animate-spin text-brand-300" />
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Analyzing
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <ImageIcon size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {fileName || "Uploaded image"}
                </p>
                <p className="text-xs text-gray-500">
                  {isLoading ? "Running AI inference…" : "Ready for analysis"}
                </p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <Camera size={14} /> Replace
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
}
