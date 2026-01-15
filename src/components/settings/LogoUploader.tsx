import { useState, useRef } from "react";
import type {  DragEvent, ChangeEvent } from "react";

import { supabase } from "../../lib/supabaseClient";
import { Image as ImageIcon, UploadCloud } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function LogoUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (file: File) => {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const extension = file.name.split(".").pop() || "png";
      const fileName = `logo-${Date.now()}.${extension}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("[LogoUploader] upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      onChange(publicUrl);
    } catch (e: any) {
      console.error("[LogoUploader] error:", e);
      setError(e?.message ?? "Error uploading logo.");
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFiles(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFiles(file);
    }
  };

  const handleClickArea = () => {
    fileInputRef.current?.click();
  };

  const hasPreview = !!value;

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-emerald-400 bg-emerald-500/5"
            : "border-slate-700 bg-slate-900/60 hover:border-emerald-500/70"
        }`}
        onClick={handleClickArea}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="w-6 h-6 text-slate-400" />
          <p className="text-sm text-slate-100">
            {uploading
              ? "Uploading logo..."
              : "Click to choose an image or drag & drop here"}
          </p>
          <p className="text-xs text-slate-500">
            PNG, JPG o SVG. Se guardará en el bucket <code>images/settings</code>.
          </p>
        </div>
      </div>

      {hasPreview && (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center">
            <img
              src={value}
              alt="Current logo"
              className="max-h-12 max-w-12 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">Current logo URL:</p>
            <div className="text-[11px] text-slate-500 break-all bg-slate-950 border border-slate-800 rounded px-2 py-1">
              {value}
            </div>
          </div>
        </div>
      )}

      {!hasPreview && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ImageIcon className="w-4 h-4" />
          <span>No logo selected yet. The default logo will be used.</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}