import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import type { MediaFile, UploadProgress, ProcessingStatus } from '@floe/shared';

interface MediaUploadProps {
  onUpload?: (files: MediaFile[]) => void;
  onProgress?: (progress: UploadProgress) => void;
  onProcessingUpdate?: (status: ProcessingStatus) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function MediaUpload({
  onUpload,
  onProgress,
  onProcessingUpdate,
  accept = '*/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  disabled = false,
  className = ''
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    if (disabled || uploading) return;

    const fileArray = Array.from(files);

    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large (${file.size} bytes)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedFiles: MediaFile[] = [];

      for (const file of validFiles) {
        const mediaFile = await simulateUpload(file, {
          onProgress: (progress) => {
            setUploadProgress(progress);
            onProgress?.(progress);
          },
          onProcessingUpdate: (status) => {
            setProcessingStatus(status);
            onProcessingUpdate?.(status);
          }
        });

        uploadedFiles.push(mediaFile);
      }

      onUpload?.(uploadedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(null);
      setProcessingStatus(null);
    }
  }, [disabled, uploading, maxSize, onUpload, onProgress, onProcessingUpdate]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    e.target.value = '';
  }, [handleFileSelect]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-sm ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-lg text-center
          transition-colors duration-200 cursor-pointer
          ${isDragging
            ? 'border-text-primary-light dark:border-text-primary-dark bg-bg-secondary-light dark:bg-bg-secondary-dark'
            : 'border-border-light dark:border-border-dark hover:border-text-secondary-light dark:hover:border-text-secondary-dark'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: -1 }}
        />

        <div className="space-y-sm">
          <div className="text-lg">
            {uploading ? '◐' : '⊕'}
          </div>

          <div className="space-y-xs">
            <div className="text-sm text-text-primary-light dark:text-text-primary-dark">
              {uploading
                ? 'Processing...'
                : isDragging
                ? 'Drop files here'
                : 'Click to upload or drag files here'
              }
            </div>

            {!uploading && (
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Max size: {Math.round(maxSize / (1024 * 1024))}MB
                {multiple && ' • Multiple files supported'}
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary-light/80 dark:bg-bg-primary-dark/80">
            <div className="text-center space-y-sm">
              <div className="text-lg animate-spin">◐</div>

              {uploadProgress && (
                <div className="space-y-xs">
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {Math.round(uploadProgress.percentage)}%
                  </div>

                  <div className="w-32 h-px bg-border-light dark:bg-border-dark mx-auto">
                    <div
                      className="h-full bg-text-primary-light dark:bg-text-primary-dark transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {processingStatus && processingStatus.status === 'processing' && (
                <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                  {processingStatus.steps.find(s => s.status === 'processing')?.name || 'Processing...'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!uploading && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled}
          >
            Choose Files
          </Button>
        </div>
      )}
    </div>
  );
}

interface MediaPreviewProps {
  file: MediaFile;
  onRemove?: () => void;
  className?: string;
}

export function MediaPreview({
  file,
  onRemove,
  className = ''
}: MediaPreviewProps) {
  const isProcessing = file.processing.status === 'processing';
  const hasError = file.processing.status === 'failed';

  return (
    <div className={`relative group ${className}`}>
      <div className={`
        aspect-square rounded-lg overflow-hidden border border-border-light dark:border-border-dark
        ${isProcessing ? 'animate-pulse' : ''}
        ${hasError ? 'border-red-500' : ''}
      `}>
        {file.type === 'image' && (
          <img
            src={file.thumbnailUrl || file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {file.type === 'video' && (
          <div className="relative w-full h-full">
            {file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-bg-secondary-light dark:bg-bg-secondary-dark flex items-center justify-center">
                <span className="text-2xl">▶</span>
              </div>
            )}
            <div className="absolute bottom-xs right-xs bg-black/50 text-white text-xs px-xs py-1 rounded">
              Video
            </div>
          </div>
        )}

        {file.type === 'audio' && (
          <div className="w-full h-full bg-bg-secondary-light dark:bg-bg-secondary-dark flex items-center justify-center">
            <span className="text-2xl">♪</span>
          </div>
        )}

        {file.type === 'document' && (
          <div className="w-full h-full bg-bg-secondary-light dark:bg-bg-secondary-dark flex items-center justify-center">
            {file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-2xl">📄</span>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-bg-primary-light/80 dark:bg-bg-primary-dark/80 flex items-center justify-center">
            <div className="text-center space-y-xs">
              <div className="animate-spin">◐</div>
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {file.processing.progress}%
              </div>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="text-center space-y-xs">
              <div className="text-red-500">⚠</div>
              <div className="text-xs text-red-500">
                Failed
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-xs space-y-xs">
        <div className="text-xs text-text-primary-light dark:text-text-primary-dark truncate">
          {file.name}
        </div>

        <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
          {formatFileSize(file.size)}
        </div>

        {file.extractedText && (
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Text detected
          </div>
        )}
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-xs -right-xs bg-bg-primary-light dark:bg-bg-primary-dark border border-border-light dark:border-border-dark rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface MediaGalleryProps {
  files: MediaFile[];
  onRemove?: (fileId: string) => void;
  className?: string;
}

export function MediaGallery({
  files,
  onRemove,
  className = ''
}: MediaGalleryProps) {
  if (files.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm ${className}`}>
      {files.map((file) => (
        <MediaPreview
          key={file.id}
          file={file}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
        />
      ))}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function simulateUpload(
  file: File,
  options: {
    onProgress?: (progress: UploadProgress) => void;
    onProcessingUpdate?: (status: ProcessingStatus) => void;
  }
): Promise<MediaFile> {
  const mediaFile: MediaFile = {
    id: crypto.randomUUID(),
    name: file.name,
    type: getMediaType(file.type),
    mimeType: file.type,
    size: file.size,
    url: URL.createObjectURL(file),
    metadata: {
      originalName: file.name,
      uploadedBy: '',
      source: 'file'
    },
    processing: {
      status: 'processing',
      progress: 0,
      steps: [
        { name: 'Processing', status: 'processing', progress: 0 },
        { name: 'Uploading', status: 'pending', progress: 0 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const progress: UploadProgress = {
      loaded: (file.size * i) / 100,
      total: file.size,
      percentage: i,
      speed: 1024 * 100,
      eta: (100 - i) * 0.1
    };

    options.onProgress?.(progress);

    mediaFile.processing.progress = i;
    mediaFile.processing.steps[0].progress = i;
    options.onProcessingUpdate?.(mediaFile.processing);
  }

  mediaFile.processing.status = 'completed';
  mediaFile.processing.steps[0].status = 'completed';
  mediaFile.processing.steps[1].status = 'completed';
  mediaFile.processing.completedAt = new Date().toISOString();

  options.onProcessingUpdate?.(mediaFile.processing);

  return mediaFile;
}

function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'document';
  return 'unknown';
}