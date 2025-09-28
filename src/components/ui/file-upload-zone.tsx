import React, { useCallback, useState } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  accept?: string;
  disabled?: boolean;
}

export function FileUploadZone({ 
  onFileSelect, 
  maxFiles = 5, 
  maxSizeBytes = 100 * 1024 * 1024, // 100MB
  accept = "*/*",
  disabled = false 
}: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size === 0) {
        alert(`ファイル "${file.name}" は空のファイルです。暗号化されたファイルを選択してください。`);
        return false;
      }
      if (file.size > maxSizeBytes) {
        alert(`ファイル "${file.name}" は100MBを超えています`);
        return false;
      }
      return true;
    }).slice(0, maxFiles);

    setSelectedFiles(validFiles);
    onFileSelect(validFiles);
  }, [maxFiles, maxSizeBytes, onFileSelect]);

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  }, [selectedFiles, onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => {
          if (!disabled) {
            document.getElementById('file-input')?.click();
          }
        }}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
          }}
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium mb-2">
          ファイルをドロップまたはクリックして選択
        </p>
        <p className="text-sm text-gray-500">
          最大{maxFiles}ファイル、ファイルサイズ100MB以下
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-gray-900">選択されたファイル:</h3>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                disabled={disabled}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}