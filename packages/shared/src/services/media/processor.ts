import type {
  MediaProcessor,
  ProcessedMedia,
  ImageProcessingOptions,
  VideoProcessingOptions,
  OCRResult,
  ProcessingStatus,
  MediaType,
  MediaMetadata
} from './types';

export class WebMediaProcessor implements MediaProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
    }
  }

  async processImage(file: File, options: ImageProcessingOptions = {}): Promise<ProcessedMedia> {
    const processing: ProcessingStatus = {
      status: 'processing',
      progress: 0,
      steps: [
        { name: 'Loading image', status: 'processing', progress: 0 },
        { name: 'Resizing', status: 'pending', progress: 0 },
        { name: 'Optimizing', status: 'pending', progress: 0 },
        { name: 'Generating thumbnail', status: 'pending', progress: 0 }
      ]
    };

    try {
      const img = new Image();
      const imgUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      processing.steps[0].status = 'completed';
      processing.steps[0].progress = 100;
      processing.progress = 25;

      let processedFile: Blob | undefined;
      let thumbnail: Blob | undefined;

      if (options.resize) {
        processing.steps[1].status = 'processing';
        processedFile = await this.resizeImage(img, options);
        processing.steps[1].status = 'completed';
        processing.steps[1].progress = 100;
        processing.progress = 50;
      }

      if (options.optimize) {
        processing.steps[2].status = 'processing';
        const quality = options.quality || 0.8;
        processedFile = await this.optimizeImage(processedFile ? processedFile : file, quality, options.format);
        processing.steps[2].status = 'completed';
        processing.steps[2].progress = 100;
        processing.progress = 75;
      }

      if (options.generateThumbnail) {
        processing.steps[3].status = 'processing';
        const thumbnailSize = options.thumbnailSize || 150;
        thumbnail = await this.generateImageThumbnail(file, thumbnailSize);
        processing.steps[3].status = 'completed';
        processing.steps[3].progress = 100;
      }

      processing.status = 'completed';
      processing.progress = 100;
      processing.completedAt = new Date().toISOString();

      URL.revokeObjectURL(imgUrl);

      return {
        originalFile: file,
        processedFile,
        thumbnail,
        metadata: this.extractImageMetadata(file),
        processing
      };

    } catch (error) {
      processing.status = 'failed';
      processing.error = error instanceof Error ? error.message : 'Image processing failed';

      return {
        originalFile: file,
        metadata: this.extractImageMetadata(file),
        processing
      };
    }
  }

  async processVideo(file: File, options: VideoProcessingOptions = {}): Promise<ProcessedMedia> {
    const processing: ProcessingStatus = {
      status: 'processing',
      progress: 0,
      steps: [
        { name: 'Loading video', status: 'processing', progress: 0 },
        { name: 'Generating thumbnail', status: 'pending', progress: 0 },
        { name: 'Extracting metadata', status: 'pending', progress: 0 }
      ]
    };

    try {
      const video = document.createElement('video');
      const videoUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve;
        video.onerror = reject;
        video.src = videoUrl;
      });

      processing.steps[0].status = 'completed';
      processing.steps[0].progress = 100;
      processing.progress = 33;

      let thumbnail: Blob | undefined;

      if (options.generateThumbnail) {
        processing.steps[1].status = 'processing';
        const thumbnailTime = options.thumbnailTime || video.duration / 2;
        thumbnail = await this.generateVideoThumbnail(video, thumbnailTime);
        processing.steps[1].status = 'completed';
        processing.steps[1].progress = 100;
        processing.progress = 66;
      }

      processing.steps[2].status = 'processing';
      const metadata = this.extractVideoMetadata(file, video);
      processing.steps[2].status = 'completed';
      processing.steps[2].progress = 100;
      processing.progress = 100;
      processing.status = 'completed';
      processing.completedAt = new Date().toISOString();

      URL.revokeObjectURL(videoUrl);

      return {
        originalFile: file,
        thumbnail,
        metadata,
        processing
      };

    } catch (error) {
      processing.status = 'failed';
      processing.error = error instanceof Error ? error.message : 'Video processing failed';

      return {
        originalFile: file,
        metadata: this.extractVideoMetadata(file),
        processing
      };
    }
  }

  async processAudio(file: File): Promise<ProcessedMedia> {
    const processing: ProcessingStatus = {
      status: 'processing',
      progress: 0,
      steps: [
        { name: 'Extracting metadata', status: 'processing', progress: 0 }
      ]
    };

    try {
      const metadata = this.extractAudioMetadata(file);
      processing.steps[0].status = 'completed';
      processing.steps[0].progress = 100;
      processing.progress = 100;
      processing.status = 'completed';
      processing.completedAt = new Date().toISOString();

      return {
        originalFile: file,
        metadata,
        processing
      };

    } catch (error) {
      processing.status = 'failed';
      processing.error = error instanceof Error ? error.message : 'Audio processing failed';

      return {
        originalFile: file,
        metadata: this.extractAudioMetadata(file),
        processing
      };
    }
  }

  async processDocument(file: File): Promise<ProcessedMedia> {
    const processing: ProcessingStatus = {
      status: 'processing',
      progress: 0,
      steps: [
        { name: 'Extracting text', status: 'processing', progress: 0 },
        { name: 'Generating thumbnail', status: 'pending', progress: 0 }
      ]
    };

    try {
      let extractedText: string | undefined;
      let thumbnail: Blob | undefined;

      if (file.type === 'application/pdf') {
        processing.steps[0].status = 'processing';
        extractedText = await this.extractTextFromPDF(file);
        processing.steps[0].status = 'completed';
        processing.steps[0].progress = 100;
        processing.progress = 50;

        processing.steps[1].status = 'processing';
        thumbnail = await this.generateDocumentThumbnail(file);
        processing.steps[1].status = 'completed';
        processing.steps[1].progress = 100;
      }

      processing.progress = 100;
      processing.status = 'completed';
      processing.completedAt = new Date().toISOString();

      return {
        originalFile: file,
        thumbnail,
        extractedText,
        metadata: this.extractDocumentMetadata(file),
        processing
      };

    } catch (error) {
      processing.status = 'failed';
      processing.error = error instanceof Error ? error.message : 'Document processing failed';

      return {
        originalFile: file,
        metadata: this.extractDocumentMetadata(file),
        processing
      };
    }
  }

  async extractText(file: File): Promise<OCRResult> {
    if (!this.isImageFile(file)) {
      throw new Error('OCR is only supported for image files');
    }

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();

      const startTime = Date.now();
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const processingTime = Date.now() - startTime;

      return {
        text: data.text,
        confidence: data.confidence,
        language: 'eng',
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          boundingBox: {
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0
          }
        })),
        blocks: data.blocks.map(block => ({
          text: block.text,
          confidence: block.confidence,
          boundingBox: {
            x: block.bbox.x0,
            y: block.bbox.y0,
            width: block.bbox.x1 - block.bbox.x0,
            height: block.bbox.y1 - block.bbox.y0
          },
          words: block.words?.map(word => ({
            text: word.text,
            confidence: word.confidence,
            boundingBox: {
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0
            }
          })) || []
        })),
        metadata: {
          processingTime,
          engine: 'tesseract.js',
          version: '4.0'
        }
      };

    } catch (error) {
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateThumbnail(file: File, size: number = 150): Promise<Blob> {
    if (this.isImageFile(file)) {
      return this.generateImageThumbnail(file, size);
    } else if (this.isVideoFile(file)) {
      return this.generateVideoThumbnailFromFile(file);
    } else if (this.isDocumentFile(file)) {
      return this.generateDocumentThumbnail(file);
    }

    throw new Error('Unsupported file type for thumbnail generation');
  }

  private async resizeImage(img: HTMLImageElement, options: ImageProcessingOptions): Promise<Blob> {
    const { resize } = options;
    if (!resize) return Promise.reject(new Error('Resize options not provided'));

    let { width, height } = resize;
    const { fit = 'cover' } = resize;

    if (!width && !height) {
      width = img.naturalWidth;
      height = img.naturalHeight;
    } else if (!width) {
      width = (img.naturalWidth * height!) / img.naturalHeight;
    } else if (!height) {
      height = (img.naturalHeight * width) / img.naturalWidth;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve!, 'image/png');
    });
  }

  private async optimizeImage(file: File | Blob, quality: number, format?: string): Promise<Blob> {
    const img = new Image();
    const imgUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgUrl;
    });

    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;
    this.ctx.drawImage(img, 0, 0);

    const mimeType = format ? `image/${format}` : 'image/jpeg';

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve!, mimeType, quality);
    });
  }

  private async generateImageThumbnail(file: File, size: number): Promise<Blob> {
    const img = new Image();
    const imgUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgUrl;
    });

    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let width = size;
    let height = size;

    if (aspectRatio > 1) {
      height = size / aspectRatio;
    } else {
      width = size * aspectRatio;
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(img, 0, 0, width, height);

    URL.revokeObjectURL(imgUrl);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve!, 'image/jpeg', 0.8);
    });
  }

  private async generateVideoThumbnail(video: HTMLVideoElement, time: number): Promise<Blob> {
    video.currentTime = time;

    await new Promise((resolve) => {
      video.onseeked = resolve;
    });

    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;
    this.ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve!, 'image/jpeg', 0.8);
    });
  }

  private async generateVideoThumbnailFromFile(file: File): Promise<Blob> {
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = reject;
      video.src = videoUrl;
    });

    const thumbnail = await this.generateVideoThumbnail(video, video.duration / 2);
    URL.revokeObjectURL(videoUrl);

    return thumbnail;
  }

  private async generateDocumentThumbnail(file: File): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = 200;
    canvas.height = 260;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText('Document', 10, 30);
    ctx.fillText(file.name, 10, 50);

    return new Promise((resolve) => {
      canvas.toBlob(resolve!, 'image/jpeg', 0.8);
    });
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return '';
    }
  }

  private extractImageMetadata(file: File): MediaMetadata {
    return {
      originalName: file.name,
      uploadedBy: '',
      source: 'file',
      device: {
        model: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        os: navigator.platform
      }
    };
  }

  private extractVideoMetadata(file: File, video?: HTMLVideoElement): MediaMetadata {
    return {
      originalName: file.name,
      uploadedBy: '',
      source: 'file',
      device: {
        model: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        os: navigator.platform
      }
    };
  }

  private extractAudioMetadata(file: File): MediaMetadata {
    return {
      originalName: file.name,
      uploadedBy: '',
      source: 'file',
      device: {
        model: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        os: navigator.platform
      }
    };
  }

  private extractDocumentMetadata(file: File): MediaMetadata {
    return {
      originalName: file.name,
      uploadedBy: '',
      source: 'file',
      device: {
        model: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        os: navigator.platform
      }
    };
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  private isAudioFile(file: File): boolean {
    return file.type.startsWith('audio/');
  }

  private isDocumentFile(file: File): boolean {
    return file.type === 'application/pdf' ||
           file.type.startsWith('text/') ||
           file.type.includes('document');
  }
}

export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/') || mimeType.includes('document')) {
    return 'document';
  }
  return 'unknown';
}

export function createMediaProcessor(): MediaProcessor {
  return new WebMediaProcessor();
}