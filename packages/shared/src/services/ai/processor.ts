import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from './config';
import type { CardType, AIAnalysis, Entity, ImageAnalysis } from '../../types';

export class AIProcessor {
  private anthropic: Anthropic;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: AI_CONFIG.anthropic.apiKey,
    });
  }

  async processContent(content: string, type: CardType): Promise<AIAnalysis> {
    // Check cache first
    const cacheKey = this.getCacheKey(content);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Run parallel AI tasks for efficiency
    const [tags, summary, entities, sentiment, category] = await Promise.all([
      this.generateTags(content, type),
      this.generateSummary(content),
      this.extractEntities(content),
      this.analyzeSentiment(content),
      this.categorizeContent(content, type)
    ]);

    const result: AIAnalysis = {
      tags,
      summary,
      entities,
      sentiment,
      category,
      processedAt: new Date()
    };

    // Cache result with expiry
    this.cache.set(cacheKey, result);
    setTimeout(() => this.cache.delete(cacheKey), AI_CONFIG.limits.cacheExpiryMs);

    return result;
  }

  private async generateTags(content: string, type: CardType): Promise<string[]> {
    const prompt = `Analyze this ${type} content and generate 5-8 relevant, specific tags.
Focus on key topics, concepts, and themes. Return as a JSON array of strings.

Content: ${content.substring(0, 2000)}

Return format: {"tags": ["tag1", "tag2", ...]}`;

    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.models.haiku, // Use Haiku for simple tasks
        max_tokens: 500,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const result = JSON.parse(responseText);
      return result.tags || [];
    } catch (error) {
      console.error('Error generating tags:', error);
      return [];
    }
  }

  private async generateSummary(content: string): Promise<string | undefined> {
    if (content.length < 200) return undefined; // Skip summary for short content

    const prompt = `Create a concise, informative summary of this content in 1-2 sentences.
Focus on the main points and key takeaways.

Content: ${content.substring(0, 4000)}`;

    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.models.completion, // Use Sonnet for quality
        max_tokens: 200,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      return response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : undefined;
    } catch (error) {
      console.error('Error generating summary:', error);
      return undefined;
    }
  }

  private async extractEntities(content: string): Promise<Entity[]> {
    const prompt = `Extract named entities from this text. Focus on important people, organizations, locations, dates, products, and events.

Content: ${content.substring(0, 3000)}

Return format: {"entities": [{"text": "entity name", "type": "PERSON|ORGANIZATION|LOCATION|DATE|PRODUCT|EVENT"}]}`;

    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.models.completion,
        max_tokens: 800,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const result = JSON.parse(responseText);
      return result.entities || [];
    } catch (error) {
      console.error('Error extracting entities:', error);
      return [];
    }
  }

  private async analyzeSentiment(content: string): Promise<number> {
    const prompt = `Analyze the sentiment of this content. Return a score from -1 (very negative) to 1 (very positive), with 0 being neutral.

Content: ${content.substring(0, 2000)}

Return format: {"sentiment": 0.5}`;

    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.models.haiku,
        max_tokens: 100,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const result = JSON.parse(responseText);
      return result.sentiment || 0;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 0;
    }
  }

  private async categorizeContent(content: string, type: CardType): Promise<string> {
    const prompt = `Categorize this ${type} content into one of these categories:
- Work & Productivity
- Learning & Education
- Health & Wellness
- Technology
- Creative & Design
- Personal
- Reference
- Entertainment
- News & Current Events
- Finance
- Travel
- Food & Recipes
- Other

Content: ${content.substring(0, 1500)}

Return format: {"category": "Technology"}`;

    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.models.haiku,
        max_tokens: 100,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const result = JSON.parse(responseText);
      return result.category || 'Other';
    } catch (error) {
      console.error('Error categorizing content:', error);
      return 'Other';
    }
  }

  async analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    const prompt = `Analyze this image and provide:
1. Main objects/subjects visible
2. Overall scene description
3. Suggested descriptive tags
4. Any visible text (if applicable)

Return as JSON with this structure:
{"objects": ["object1", "object2"], "scene": "description", "tags": ["tag1", "tag2"], "text": "any visible text"}`;

    try {
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.anthropic.models.completion,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: await this.getImageAsBase64(imageUrl)
                }
              }
            ]
          }
        ]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const result = JSON.parse(responseText);
      return {
        objects: result.objects || [],
        scene: result.scene || '',
        tags: result.tags || [],
        text: result.text,
        colors: [] // Color analysis could be added later
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        objects: [],
        scene: '',
        tags: [],
        colors: []
      };
    }
  }

  private async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  private getCacheKey(content: string): string {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Clean up cache periodically
  public clearCache(): void {
    this.cache.clear();
  }
}