'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUpload({ value = [], onChange, multiple = false, maxFiles = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesToUpload = Array.from(files).slice(0, maxFiles - preview.length);
    if (filesToUpload.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (multiple) {
        filesToUpload.forEach((file) => {
          formData.append('files', file);
        });
        
        // Debug: verificar que los archivos se agregaron
        const formDataEntries = Array.from(formData.entries());
        console.log('FormData entries count:', formDataEntries.length);
        formDataEntries.forEach(([key, value]) => {
          console.log(`FormData key: ${key}, value type:`, value instanceof File ? `File: ${(value as File).name}` : typeof value);
        });
        
        const response = await api.post('/upload/multiple', formData);
        const newUrls = response.data.map((file: any) => file.url);
        const updated = [...preview, ...newUrls];
        setPreview(updated);
        onChange(updated);
      } else {
        formData.append('file', filesToUpload[0]);
        
        // Debug: verificar que el archivo se agregó
        const formDataEntries = Array.from(formData.entries());
        console.log('FormData entries count:', formDataEntries.length);
        formDataEntries.forEach(([key, value]) => {
          console.log(`FormData key: ${key}, value type:`, value instanceof File ? `File: ${(value as File).name}` : typeof value);
        });
        
        const response = await api.post('/upload/single', formData);
        const updated = [response.data.url];
        setPreview(updated);
        onChange(updated);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al subir la imagen';
      alert(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = preview.filter((_, i) => i !== index);
    setPreview(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {preview.map((url, index) => (
          <div key={index} className="relative group">
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
              <img 
                src={url.startsWith('http') ? url : (url.startsWith('/uploads/') ? `http://localhost:4000${url}` : url)} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {preview.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Subir</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

