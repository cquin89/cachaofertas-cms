import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  accept?: string[];
  maxSizeMb?: number;
}

export function ImageUploader({
  value,
  onChange,
  className,
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeMb = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`El archivo supera el límite de ${maxSizeMb} MB`);
        return;
      }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post<ApiResponse<{ url: string }>>(
          '/admin/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        onChange(res.data.data.url);
        toast.success('Imagen subida correctamente');
      } catch {
        toast.error('Error al subir la imagen');
      } finally {
        setUploading(false);
      }
    },
    [maxSizeMb, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, mime) => ({ ...acc, [mime]: [] }), {}),
    maxFiles: 1,
    disabled: uploading,
  });

  if (value) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg border border-warm-200', className)}>
        <img src={value} alt="Preview" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          title="Quitar imagen"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
        isDragActive
          ? 'border-primary-400 bg-primary-50'
          : 'border-warm-300 bg-warm-50 hover:border-primary-300 hover:bg-primary-50/40',
        uploading && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <>
          <Loader2 size={24} className="animate-spin text-primary-500" />
          <span className="text-xs text-warm-500">Subiendo…</span>
        </>
      ) : isDragActive ? (
        <>
          <Upload size={24} className="text-primary-400" />
          <span className="text-xs font-medium text-primary-600">Suelta la imagen aquí</span>
        </>
      ) : (
        <>
          <ImageIcon size={24} className="text-warm-400" />
          <div className="text-center">
            <span className="text-xs font-medium text-warm-600">
              Arrastra una imagen o{' '}
              <span className="text-primary-500">haz clic para seleccionar</span>
            </span>
            <p className="mt-0.5 text-[10px] text-warm-400">
              {accept.map((a) => a.split('/')[1].toUpperCase()).join(', ')} — máx. {maxSizeMb} MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}
