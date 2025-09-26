import { uploadFiles, UTApi } from 'uploadthing/server';
import type {
  MediaStorage,
  MediaFile,
  MediaUploadOptions,
  UploadProgress,
  ProcessingStatus,
  MediaType
} from './types';
import { createMediaProcessor, getMediaType } from './processor';

export class UploadThingStorage implements MediaStorage {
  private utapi: UTApi;
  private processor = createMediaProcessor();

  constructor(apiKey: string) {
    this.utapi = new UTApi({ apiKey });
  }

  async upload(file: File, options: MediaUploadOptions = {}): Promise<MediaFile> {
    const {
      onProgress,
      onProcessingUpdate,
      generateThumbnail = true,
      extractText = true,
      optimize = true
    } = options;

    let uploadProgress: UploadProgress = {
      loaded: 0,
      total: file.size,
      percentage: 0,
      speed: 0,
      eta: 0
    };

    const mediaType = getMediaType(file.type);
    const mediaFile: MediaFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: mediaType,
      mimeType: file.type,
      size: file.size,
      url: '',
      metadata: {
        originalName: file.name,
        uploadedBy: '',
        source: 'file'
      },
      processing: {
        status: 'pending',
        progress: 0,
        steps: [
          { name: 'Processing media', status: 'pending', progress: 0 },
          { name: 'Uploading file', status: 'pending', progress: 0 },
          { name: 'Generating thumbnail', status: 'pending', progress: 0 },
          { name: 'Extracting text', status: 'pending', progress: 0 }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      mediaFile.processing.status = 'processing';
      onProcessingUpdate?.(mediaFile.processing);

      let processedFile = file;
      let thumbnail: Blob | undefined;
      let extractedText: string | undefined;

      if (mediaType === 'image') {
        mediaFile.processing.steps[0].status = 'processing';
        onProcessingUpdate?.(mediaFile.processing);

        const processed = await this.processor.processImage(file, {
          optimize,
          generateThumbnail,
          quality: 0.8,
          format: 'jpeg'
        });

        if (processed.processedFile) {
          processedFile = new File([processed.processedFile], file.name, { type: file.type });
        }
        thumbnail = processed.thumbnail;

        if (extractText) {
          try {
            const ocrResult = await this.processor.extractText(file);
            extractedText = ocrResult.text;
          } catch (error) {
            console.warn('OCR extraction failed:', error);
          }
        }

        mediaFile.processing.steps[0].status = 'completed';
        mediaFile.processing.steps[0].progress = 100;
        mediaFile.processing.progress = 25;
        onProcessingUpdate?.(mediaFile.processing);
      }

      if (mediaType === 'video') {
        mediaFile.processing.steps[0].status = 'processing';
        onProcessingUpdate?.(mediaFile.processing);

        const processed = await this.processor.processVideo(file, {
          generateThumbnail
        });

        thumbnail = processed.thumbnail;

        mediaFile.processing.steps[0].status = 'completed';
        mediaFile.processing.steps[0].progress = 100;
        mediaFile.processing.progress = 25;
        onProcessingUpdate?.(mediaFile.processing);
      }

      if (mediaType === 'document') {
        mediaFile.processing.steps[0].status = 'processing';
        onProcessingUpdate?.(mediaFile.processing);

        const processed = await this.processor.processDocument(file);
        extractedText = processed.extractedText;
        thumbnail = processed.thumbnail;

        mediaFile.processing.steps[0].status = 'completed';
        mediaFile.processing.steps[0].progress = 100;
        mediaFile.processing.progress = 25;
        onProcessingUpdate?.(mediaFile.processing);
      }

      mediaFile.processing.steps[1].status = 'processing';
      onProcessingUpdate?.(mediaFile.processing);

      const uploadResponse = await this.uploadWithProgress(processedFile, {
        onProgress: (progress) => {
          uploadProgress = progress;
          onProgress?.(progress);

          const step1Progress = (progress.percentage / 100) * 50;
          mediaFile.processing.steps[1].progress = step1Progress;
          mediaFile.processing.progress = 25 + (step1Progress / 2);
          onProcessingUpdate?.(mediaFile.processing);
        }
      });

      mediaFile.url = uploadResponse.url;
      mediaFile.processing.steps[1].status = 'completed';
      mediaFile.processing.steps[1].progress = 100;
      mediaFile.processing.progress = 50;
      onProcessingUpdate?.(mediaFile.processing);

      if (thumbnail) {
        mediaFile.processing.steps[2].status = 'processing';
        onProcessingUpdate?.(mediaFile.processing);

        const thumbnailFile = new File([thumbnail], `${mediaFile.id}_thumbnail.jpg`, {
          type: 'image/jpeg'
        });

        const thumbnailResponse = await this.utapi.uploadFiles(thumbnailFile);

        if (thumbnailResponse.data) {
          mediaFile.thumbnailUrl = thumbnailResponse.data.url;
        }

        mediaFile.processing.steps[2].status = 'completed';
        mediaFile.processing.steps[2].progress = 100;
        mediaFile.processing.progress = 75;
        onProcessingUpdate?.(mediaFile.processing);
      }

      if (extractedText) {
        mediaFile.processing.steps[3].status = 'processing';
        onProcessingUpdate?.(mediaFile.processing);

        mediaFile.extractedText = extractedText;

        mediaFile.processing.steps[3].status = 'completed';
        mediaFile.processing.steps[3].progress = 100;
      }

      mediaFile.processing.status = 'completed';
      mediaFile.processing.progress = 100;
      mediaFile.processing.completedAt = new Date().toISOString();
      onProcessingUpdate?.(mediaFile.processing);

      return mediaFile;

    } catch (error) {
      mediaFile.processing.status = 'failed';
      mediaFile.processing.error = error instanceof Error ? error.message : 'Upload failed';
      onProcessingUpdate?.(mediaFile.processing);

      throw error;
    }
  }

  async download(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/media/${fileId}`);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(fileId: string): Promise<void> {
    try {
      await this.utapi.deleteFiles(fileId);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const response = await this.utapi.getFileUrls(fileId);
      return response[0]?.url || '';
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async uploadWithProgress(
    file: File,
    options: { onProgress?: (progress: UploadProgress) => void }
  ): Promise<{ url: string; key: string }> {
    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    const formData = new FormData();
    formData.append('files', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000;
          const loadedDiff = event.loaded - lastLoaded;
          const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
          const eta = speed > 0 ? (event.total - event.loaded) / speed : 0;

          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: (event.loaded / event.total) * 100,
            speed,
            eta
          };

          options.onProgress?.(progress);

          lastLoaded = event.loaded;
          lastTime = now;
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.data[0]?.url || '',
              key: response.data[0]?.key || ''
            });
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/uploadthing');
      xhr.send(formData);
    });
  }
}

export class LocalMediaStorage implements MediaStorage {
  private processor = createMediaProcessor();

  async upload(file: File, options: MediaUploadOptions = {}): Promise<MediaFile> {
    const {
      onProgress,
      onProcessingUpdate,
      generateThumbnail = true,
      extractText = true,
      optimize = true
    } = options;

    const mediaType = getMediaType(file.type);
    const mediaFile: MediaFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: mediaType,
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
          { name: 'Processing media', status: 'processing', progress: 0 }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      let processed: any;

      if (mediaType === 'image') {
        processed = await this.processor.processImage(file, {
          optimize,
          generateThumbnail,
          quality: 0.8
        });
      } else if (mediaType === 'video') {
        processed = await this.processor.processVideo(file, {
          generateThumbnail
        });
      } else if (mediaType === 'document') {
        processed = await this.processor.processDocument(file);
      }

      if (processed?.thumbnail) {
        mediaFile.thumbnailUrl = URL.createObjectURL(processed.thumbnail);
      }

      if (processed?.extractedText) {
        mediaFile.extractedText = processed.extractedText;
      }

      if (extractText && mediaType === 'image') {
        try {
          const ocrResult = await this.processor.extractText(file);
          mediaFile.extractedText = ocrResult.text;
        } catch (error) {
          console.warn('OCR extraction failed:', error);
        }
      }

      mediaFile.processing.status = 'completed';
      mediaFile.processing.progress = 100;
      mediaFile.processing.steps[0].status = 'completed';
      mediaFile.processing.steps[0].progress = 100;
      mediaFile.processing.completedAt = new Date().toISOString();

      onProcessingUpdate?.(mediaFile.processing);

      return mediaFile;

    } catch (error) {
      mediaFile.processing.status = 'failed';
      mediaFile.processing.error = error instanceof Error ? error.message : 'Processing failed';
      onProcessingUpdate?.(mediaFile.processing);

      throw error;
    }
  }

  async download(fileId: string): Promise<Blob> {
    const response = await fetch(fileId);
    return await response.blob();
  }

  async delete(fileId: string): Promise<void> {
    URL.revokeObjectURL(fileId);
  }

  async generateSignedUrl(fileId: string): Promise<string> {
    return fileId;
  }
}

export function createMediaStorage(config?: { apiKey?: string }): MediaStorage {
  if (config?.apiKey) {
    return new UploadThingStorage(config.apiKey);
  }
  return new LocalMediaStorage();
}