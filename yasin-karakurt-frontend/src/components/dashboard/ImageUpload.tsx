'use client';

import { useCallback, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ label, onFilesChange, maxFiles = 5 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const available = maxFiles - previews.length;
      if (available <= 0) return;

      const newFiles = Array.from(incoming)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, available);

      if (newFiles.length === 0) return;

      const newPreviews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      setPreviews((prev) => {
        const updated = [...prev, ...newPreviews];
        onFilesChange(updated.map((p) => p.file));
        return updated;
      });
    },
    [maxFiles, previews.length, onFilesChange],
  );

  const remove = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange(updated.map((p) => p.file));
      return updated;
    });
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const canAdd = previews.length < maxFiles;

  return (
    <div className="space-y-3">
      {label && <p className="text-sm text-ash/80 font-medium">{label}</p>}

      {/* Drop zone */}
      {canAdd && (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={[
            'flex flex-col items-center justify-center gap-3 rounded-2xl p-8 cursor-pointer',
            'border-2 border-dashed transition-all duration-300',
            isDragging
              ? 'border-sky-400 bg-sky-400/5 shadow-[0_0_20px_rgba(56,189,248,0.18)]'
              : 'border-sky-500/30 bg-white/[0.02] hover:border-sky-400/60 hover:bg-sky-400/[0.04]',
          ].join(' ')}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />

          <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-sky-400/15' : 'bg-white/5'}`}>
            <Upload
              size={22}
              className={isDragging ? 'text-sky-400' : 'text-sky-500/60'}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-white/70">
              Sürükle & bırak veya{' '}
              <span className="text-sky-400 font-medium">seç</span>
            </p>
            <p className="text-xs text-ash/40 mt-1">
              PNG · JPG · WEBP &nbsp;·&nbsp; Maks. {maxFiles} fotoğraf
            </p>
          </div>
        </label>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map(({ url }, i) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden group bg-charcoal"
            >
              {/* eslint-disable-next-line @next/next-eslint/no-img-element */}
              <img
                src={url}
                alt={`Önizleme ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Fotoğrafı kaldır"
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          ))}

          {!canAdd && (
            <div className="aspect-square rounded-xl bg-charcoal/60 border border-white/5 flex flex-col items-center justify-center gap-1">
              <ImageIcon size={18} className="text-ash/30" />
              <span className="text-ash/30 text-[10px] tracking-wide">Maks.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
