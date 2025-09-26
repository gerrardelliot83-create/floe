import { extractDomain, isValidUrl, getCardTypeFromUrl } from '../../utils';

export interface ExtractedContent {
  title?: string;
  content?: string;
  description?: string;
  url: string;
  domain: string;
  type: string;
  metadata: {
    author?: string;
    publishedAt?: string;
    readingTime?: number;
    wordCount?: number;
    language?: string;
    tags?: string[];
    image?: string;
  };
}

export class ContentExtractor {
  private static readonly READABILITY_ENDPOINT = '/api/content/extract';

  static async extractFromUrl(url: string): Promise<ExtractedContent> {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    const domain = extractDomain(url);
    const type = getCardTypeFromUrl(url);

    try {
      // For special domains, use their APIs
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        return await this.extractYouTubeVideo(url);
      }

      if (domain.includes('twitter.com') || domain.includes('x.com')) {
        return await this.extractTweet(url);
      }

      if (domain.includes('github.com')) {
        return await this.extractGitHub(url);
      }

      // For articles and general content, use readability
      return await this.extractArticle(url);
    } catch (error) {
      console.error('Content extraction failed:', error);

      // Fallback: return basic metadata
      return {
        url,
        domain,
        type,
        metadata: {}
      };
    }
  }

  private static async extractArticle(url: string): Promise<ExtractedContent> {
    try {
      // In a real implementation, this would call a backend service
      // that uses Mozilla's Readability.js or similar
      const response = await fetch(this.READABILITY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        title: data.title,
        content: data.textContent,
        description: data.excerpt,
        url,
        domain: extractDomain(url),
        type: 'article',
        metadata: {
          author: data.byline,
          publishedAt: data.publishedTime,
          readingTime: this.calculateReadingTime(data.textContent),
          wordCount: this.countWords(data.textContent),
          language: data.lang || 'en',
          image: data.leadImageUrl
        }
      };
    } catch (error) {
      // Fallback: extract basic info from URL
      return this.createFallbackContent(url, 'article');
    }
  }

  private static async extractYouTubeVideo(url: string): Promise<ExtractedContent> {
    try {
      // Extract video ID from URL
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // In production, you'd use YouTube Data API
      // For now, return structured data based on URL
      return {
        title: 'YouTube Video', // Would be fetched from API
        content: 'Video content description', // Would be fetched from API
        url,
        domain: 'youtube.com',
        type: 'video',
        metadata: {
          author: 'Channel Name', // Would be fetched from API
          publishedAt: new Date().toISOString(),
          readingTime: 0,
          wordCount: 0
        }
      };
    } catch (error) {
      return this.createFallbackContent(url, 'video');
    }
  }

  private static async extractTweet(url: string): Promise<ExtractedContent> {
    try {
      // Extract tweet ID from URL
      const tweetId = this.extractTweetId(url);
      if (!tweetId) {
        throw new Error('Invalid Twitter URL');
      }

      // In production, you'd use Twitter API v2
      return {
        title: 'Tweet', // Would be derived from content
        content: 'Tweet content', // Would be fetched from API
        url,
        domain: extractDomain(url),
        type: 'tweet',
        metadata: {
          author: 'Username', // Would be fetched from API
          publishedAt: new Date().toISOString(),
          readingTime: 1,
          wordCount: 0 // Would be calculated from content
        }
      };
    } catch (error) {
      return this.createFallbackContent(url, 'tweet');
    }
  }

  private static async extractGitHub(url: string): Promise<ExtractedContent> {
    try {
      // GitHub URLs can be repos, issues, PRs, etc.
      const pathParts = new URL(url).pathname.split('/').filter(Boolean);

      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repo = pathParts[1];

        return {
          title: `${owner}/${repo}`,
          content: 'GitHub repository', // Would fetch README or description
          url,
          domain: 'github.com',
          type: 'article',
          metadata: {
            author: owner,
            publishedAt: new Date().toISOString()
          }
        };
      }

      return this.createFallbackContent(url, 'article');
    } catch (error) {
      return this.createFallbackContent(url, 'article');
    }
  }

  private static createFallbackContent(url: string, type: string): ExtractedContent {
    const domain = extractDomain(url);

    return {
      title: domain || 'Untitled',
      url,
      domain,
      type,
      metadata: {}
    };
  }

  private static extractYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  private static extractTweetId(url: string): string | null {
    const match = url.match(/twitter\.com\/\w+\/status\/(\d+)|x\.com\/\w+\/status\/(\d+)/);
    return match ? (match[1] || match[2]) : null;
  }

  private static calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  static countWords(text: string): number {
    return text ? text.trim().split(/\s+/).length : 0;
  }

  // Text cleaning utilities
  static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\r\n]+/g, '\n') // Normalize line breaks
      .trim();
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Try to break at sentence boundary
    const sentences = text.split(/[.!?]+/);
    let result = '';

    for (const sentence of sentences) {
      if ((result + sentence).length > maxLength - 3) break;
      result += sentence + '.';
    }

    return result || text.substring(0, maxLength - 3) + '...';
  }
}