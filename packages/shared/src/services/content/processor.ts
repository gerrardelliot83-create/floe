import { supabase } from '@floe/supabase';
import { AIProcessor } from '../ai/processor';
import { ContentExtractor, type ExtractedContent } from './extractor';
import { MobileUploadService, type UploadResponse } from '../uploadthing/mobile';
import type { Card, QuickCapture, CardType } from '../../types';

export interface ProcessContentOptions {
  userId: string;
  skipAI?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export interface ProcessedContent {
  card: Card;
  warnings?: string[];
}

export class ContentProcessor {
  private aiProcessor: AIProcessor;
  private uploadService?: MobileUploadService;

  constructor(uploadToken?: string) {
    this.aiProcessor = new AIProcessor();
    if (uploadToken) {
      this.uploadService = new MobileUploadService(uploadToken);
    }
  }

  async processQuickCapture(capture: QuickCapture, options: ProcessContentOptions): Promise<ProcessedContent> {
    try {
      switch (capture.type) {
        case 'note':
          return await this.processNote(capture.content, options);

        case 'link':
          return await this.processLink(capture.content.url, options);

        case 'files':
          return await this.processFiles(capture.content.files, options);

        default:
          throw new Error(`Unsupported capture type: ${capture.type}`);
      }
    } catch (error) {
      console.error('Failed to process quick capture:', error);
      throw error;
    }
  }

  async processNote(content: { content: string; title?: string }, options: ProcessContentOptions): Promise<ProcessedContent> {
    const cardData: Partial<Card> = {
      user_id: options.userId,
      type: 'note',
      title: content.title || this.extractTitleFromContent(content.content),
      content: ContentExtractor.cleanText(content.content),
      metadata: {
        wordCount: ContentExtractor.countWords ? ContentExtractor.countWords(content.content) : 0,
        createdBy: 'user'
      }
    };

    // Process with AI if not skipped
    if (!options.skipAI && content.content.length > 50) {
      try {
        const aiAnalysis = await this.aiProcessor.processContent(content.content, 'note');
        cardData.ai_tags = aiAnalysis.tags;
        cardData.ai_summary = aiAnalysis.summary;
        cardData.ai_entities = aiAnalysis.entities;
        cardData.ai_sentiment = aiAnalysis.sentiment;
        cardData.ai_category = aiAnalysis.category;
        cardData.ai_processed = true;
        cardData.ai_processed_at = new Date().toISOString();
      } catch (error) {
        console.warn('AI processing failed for note:', error);
      }
    }

    const { data: card, error } = await supabase
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save note: ${error.message}`);
    }

    return { card };
  }

  async processLink(url: string, options: ProcessContentOptions): Promise<ProcessedContent> {
    let extractedContent: ExtractedContent;

    try {
      extractedContent = await ContentExtractor.extractFromUrl(url);
    } catch (error) {
      console.warn('Content extraction failed:', error);
      // Create minimal card with just the URL
      extractedContent = {
        url,
        domain: new URL(url).hostname,
        type: 'link',
        metadata: {}
      };
    }

    const cardData: Partial<Card> = {
      user_id: options.userId,
      type: extractedContent.type as CardType,
      title: extractedContent.title,
      content: extractedContent.content,
      url: extractedContent.url,
      source_domain: extractedContent.domain,
      metadata: extractedContent.metadata
    };

    // Process with AI if not skipped and we have content
    if (!options.skipAI && extractedContent.content) {
      try {
        const aiAnalysis = await this.aiProcessor.processContent(extractedContent.content, cardData.type!);
        cardData.ai_tags = aiAnalysis.tags;
        cardData.ai_summary = aiAnalysis.summary;
        cardData.ai_entities = aiAnalysis.entities;
        cardData.ai_sentiment = aiAnalysis.sentiment;
        cardData.ai_category = aiAnalysis.category;
        cardData.ai_processed = true;
        cardData.ai_processed_at = new Date().toISOString();
      } catch (error) {
        console.warn('AI processing failed for link:', error);
      }
    }

    const { data: card, error } = await supabase
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save link: ${error.message}`);
    }

    const warnings: string[] = [];
    if (!extractedContent.title && !extractedContent.content) {
      warnings.push('Unable to extract content from this URL');
    }

    return { card, warnings };
  }

  async processFiles(files: File[], options: ProcessContentOptions): Promise<ProcessedContent> {
    if (!this.uploadService) {
      throw new Error('Upload service not configured');
    }

    const warnings: string[] = [];
    const cards: Card[] = [];

    for (const file of files) {
      try {
        const card = await this.processFile(file, options);
        cards.push(card);
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        warnings.push(`Failed to process ${file.name}: ${error.message}`);
      }
    }

    if (cards.length === 0) {
      throw new Error('Failed to process any files');
    }

    // Return the first card (for single file) or a combined result
    return {
      card: cards[0],
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private async processFile(file: File, options: ProcessContentOptions): Promise<Card> {
    const fileType = this.getFileType(file.type, file.name);
    let uploadResult: UploadResponse;

    try {
      // Upload file using appropriate method
      switch (fileType) {
        case 'image':
          uploadResult = await this.uploadService!.uploadImage(
            URL.createObjectURL(file),
            file.name
          );
          break;
        case 'document':
          uploadResult = await this.uploadService!.uploadDocument(
            URL.createObjectURL(file),
            file.name
          );
          break;
        case 'audio':
          uploadResult = await this.uploadService!.uploadAudio(
            URL.createObjectURL(file),
            file.name
          );
          break;
        case 'video':
          uploadResult = await this.uploadService!.uploadVideo(
            URL.createObjectURL(file),
            file.name
          );
          break;
        default:
          uploadResult = await this.uploadService!.uploadDocument(
            URL.createObjectURL(file),
            file.name
          );
      }
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const cardData: Partial<Card> = {
      user_id: options.userId,
      type: fileType as CardType,
      title: file.name,
      media_url: uploadResult.url,
      media_metadata: {
        fileName: file.name,
        fileSize: uploadResult.size,
        mimeType: file.type,
        uploadKey: uploadResult.key
      }
    };

    // For images, set thumbnail
    if (fileType === 'image') {
      cardData.thumbnail_url = uploadResult.url;
    }

    // Process with AI for supported file types
    if (!options.skipAI && (fileType === 'image' || fileType === 'document')) {
      try {
        if (fileType === 'image') {
          const imageAnalysis = await this.aiProcessor.analyzeImage(uploadResult.url);
          cardData.ai_tags = imageAnalysis.tags;
          cardData.ai_summary = imageAnalysis.scene;
          cardData.ai_colors = imageAnalysis.colors;
          cardData.content = imageAnalysis.text; // OCR text if any
        }
        // TODO: Add document AI processing when available

        cardData.ai_processed = true;
        cardData.ai_processed_at = new Date().toISOString();
      } catch (error) {
        console.warn(`AI processing failed for ${fileType}:`, error);
      }
    }

    const { data: card, error } = await supabase
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) {
      // If card creation fails, clean up uploaded file
      try {
        await this.uploadService!.deleteFile(uploadResult.key);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
      throw new Error(`Failed to save file card: ${error.message}`);
    }

    return card;
  }

  private getFileType(mimeType: string, fileName: string): string {
    // Check MIME type first
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';

    // Check file extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    const documentExts = ['doc', 'docx', 'txt', 'rtf'];

    if (extension && imageExts.includes(extension)) return 'image';
    if (extension && videoExts.includes(extension)) return 'video';
    if (extension && audioExts.includes(extension)) return 'audio';
    if (extension && documentExts.includes(extension)) return 'document';
    if (extension === 'pdf') return 'pdf';

    return 'document'; // Default fallback
  }

  private extractTitleFromContent(content: string): string {
    // Extract first line or sentence as title
    const firstLine = content.split('\n')[0].trim();
    if (firstLine && firstLine.length <= 100) {
      return firstLine;
    }

    // Extract first sentence
    const firstSentence = content.split(/[.!?]/)[0].trim();
    if (firstSentence && firstSentence.length <= 100) {
      return firstSentence;
    }

    // Fallback to truncated content
    return content.substring(0, 50).trim() + (content.length > 50 ? '...' : '');
  }

  // Batch processing for multiple items
  async processBatch(captures: QuickCapture[], options: ProcessContentOptions): Promise<ProcessedContent[]> {
    const results: ProcessedContent[] = [];
    const errors: Array<{ capture: QuickCapture; error: string }> = [];

    for (const capture of captures) {
      try {
        const result = await this.processQuickCapture(capture, options);
        results.push(result);
      } catch (error) {
        errors.push({
          capture,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (errors.length > 0) {
      console.warn('Some items failed to process:', errors);
    }

    return results;
  }
}