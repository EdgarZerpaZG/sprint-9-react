import { useState, useCallback } from "react";
import { uploadImageToSupabase, MAX_IMAGE_SIZE } from "../../utils/uploadImage";
import { getPublicImageUrl } from "../../utils/images";

type Props = {
  path: string;
  alt?: string;
  folder?: string;
  onChange: (data: { path: string; alt?: string }) => void;
};

export default function ImageBlockEditor({
  path,
  alt,
  folder = "home",
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError("File is too large. Max size is 2MB.");
        return;
      }

      try {
        setUploading(true);
        const uploadedPath = await uploadImageToSupabase(file, folder);
        onChange({ path: uploadedPath, alt });
      } catch (e: any) {
        console.error("[ImageBlockEditor] upload error:", e);
        setError(e.message ?? "Error uploading image.");
      } finally {
        setUploading(false);
      }
    },
    [alt, folder, onChange]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const imageUrl = path ? getPublicImageUrl(path) : null;

  return (
    <div className="space-y-2">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "border border-dashed rounded px-3 py-4 text-sm text-slate-300 flex flex-col items-center gap-2",
          isDraggingOver ? "border-emerald-500 bg-slate-900/60" : "border-slate-700"
        ].join(" ")}
      >
        <p className="text-xs text-slate-400">
          Drag & drop an image here, or click to select a file. Max 2MB.
        </p>

        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs">
          {uploading ? "Uploading..." : "Choose file"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>

        {error && (
          <p className="text-xs text-red-400 mt-1">
            {error}
          </p>
        )}
      </div>

      {/* Preview */}
      {imageUrl && (
        <div className="space-y-1">
          <img
            src={imageUrl}
            alt={alt || ""}
            className="max-w-full rounded border border-slate-800"
            loading="lazy"
          />
          <button
            type="button"
            onClick={() => onChange({ path: "", alt })}
            className="text-xs text-red-300 hover:text-red-200 mt-1"
          >
            Remove image
          </button>
        </div>
      )}

      {/* Alt text */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Alt text
        </label>
        <input
          type="text"
          value={alt ?? ""}
          onChange={(e) => onChange({ path, alt: e.target.value })}
          placeholder="Short description for accessibility and SEO"
          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
        />
      </div>
    </div>
  );
}