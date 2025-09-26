export interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  extractedText?: string;
  metadata: MediaMetadata;
  processing: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'unknown';

export interface MediaMetadata {
  originalName: string;
  uploadedBy: string;
  source: 'camera' | 'gallery' | 'file' | 'drag-drop' | 'paste';
  location?: {
    latitude: number;
    longitude: number;
  };
  device?: {
    model: string;
    os: string;
  };
  exif?: Record<string, any>;
  colorProfile?: string;
  compression?: string;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  steps: ProcessingStep[];
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  optimize?: boolean;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface VideoProcessingOptions {
  generateThumbnail?: boolean;
  thumbnailTime?: number;
  compress?: boolean;
  quality?: 'low' | 'medium' | 'high';
  maxDuration?: number;
  extractAudio?: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  words: OCRWord[];
  blocks: OCRBlock[];
  metadata: {
    processingTime: number;
    engine: string;
    version: string;
  };
}

export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  words: OCRWord[];
}

export interface MediaProcessor {
  processImage(file: File, options?: ImageProcessingOptions): Promise<ProcessedMedia>;
  processVideo(file: File, options?: VideoProcessingOptions): Promise<ProcessedMedia>;
  processAudio(file: File): Promise<ProcessedMedia>;
  processDocument(file: File): Promise<ProcessedMedia>;
  extractText(file: File): Promise<OCRResult>;
  generateThumbnail(file: File, size?: number): Promise<Blob>;
}

export interface ProcessedMedia {
  originalFile: File;
  processedFile?: Blob;
  thumbnail?: Blob;
  extractedText?: string;
  metadata: MediaMetadata;
  processing: ProcessingStatus;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  eta: number;
}

export interface MediaUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onProcessingUpdate?: (status: ProcessingStatus) => void;
  generateThumbnail?: boolean;
  extractText?: boolean;
  optimize?: boolean;
}

export interface MediaStorage {
  upload(file: File, options?: MediaUploadOptions): Promise<MediaFile>;
  download(fileId: string): Promise<Blob>;
  delete(fileId: string): Promise<void>;
  generateSignedUrl(fileId: string, expiresIn?: number): Promise<string>;
}

export interface ThumbnailGenerator {
  generateImageThumbnail(file: File | Blob, size: number): Promise<Blob>;
  generateVideoThumbnail(file: File | Blob, time?: number): Promise<Blob>;
  generateDocumentThumbnail(file: File | Blob): Promise<Blob>;
}

export interface MediaCompressor {
  compressImage(file: File, quality: number): Promise<Blob>;
  compressVideo(file: File, quality: 'low' | 'medium' | 'high'): Promise<Blob>;
  compressAudio(file: File, bitrate: number): Promise<Blob>;
}