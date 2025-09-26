import { Anthropic } from '@anthropic-ai/sdk';
import type { Card, SmartSpace } from '../../types';

export interface AIProcessingOptions {
  extractKeywords?: boolean;
  generateSummary?: boolean;
  suggestTags?: boolean;
  suggestSmartSpaces?: boolean;
  analyzeContent?: boolean;
  generateTitle?: boolean;
}

export interface AIProcessingResult {
  title?: string;
  summary?: string;
  keywords: string[];
  tags: string[];
  suggestedSpaces: string[];
  contentAnalysis?: {
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: 'simple' | 'moderate' | 'complex';
    category: string;
  };
  confidence: number;
  processingTime: number;
}

export interface SmartOrganizationSuggestion {
  spaceId: string;
  spaceName: string;
  confidence: number;
  reason: string;
}

export interface ContentEnhancement {
  improvedTitle?: string;
  structuredContent?: string;
  additionalTags?: string[];
  relatedTopics?: string[];
}

export class ClaudeAIService {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
    });
  }

  async processContent(
    content: string,
    existingCard?: Partial<Card>,
    options: AIProcessingOptions = {}
  ): Promise<AIProcessingResult> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.buildSystemPrompt(options);
      const userPrompt = this.buildUserPrompt(content, existingCard, options);

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const result = this.parseAIResponse(response.content[0]);
      const processingTime = Date.now() - startTime;

      return {
        ...result,
        processingTime,
        confidence: this.calculateConfidence(result, content)
      };

    } catch (error) {
      console.error('Claude AI processing failed:', error);

      const fallbackResult = this.generateFallbackResult(content);
      const processingTime = Date.now() - startTime;

      return {
        ...fallbackResult,
        processingTime,
        confidence: 0.3
      };
    }
  }

  async suggestSmartSpaceOrganization(
    card: Card,
    availableSpaces: SmartSpace[]
  ): Promise<SmartOrganizationSuggestion[]> {
    try {
      const systemPrompt = `You are an expert at organizing and categorizing content.
Given a content card and a list of available smart spaces, suggest which spaces would be most appropriate for this content.

Consider:
- Content topics and themes
- Existing space descriptions and purposes
- Content type and format
- Potential user intent

Return your response as a JSON array of suggestions with confidence scores and reasons.`;

      const userPrompt = `
Content to organize:
Title: ${card.title}
Content: ${card.content}
Type: ${card.type}
Tags: ${card.tags?.join(', ') || 'None'}

Available Smart Spaces:
${availableSpaces.map(space =>
  `- ${space.name}: ${space.description || 'No description'} (ID: ${space.id})`
).join('\n')}

Please suggest the top 3 most appropriate spaces for this content.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return this.parseOrganizationSuggestions(response.content[0], availableSpaces);

    } catch (error) {
      console.error('Smart space organization failed:', error);
      return [];
    }
  }

  async enhanceContent(
    content: string,
    type: string = 'note'
  ): Promise<ContentEnhancement> {
    try {
      const systemPrompt = `You are a content enhancement assistant.
Your goal is to improve content structure, clarity, and discoverability while maintaining the original meaning and intent.

For each piece of content:
1. Suggest an improved, clear, and descriptive title
2. Restructure content for better readability if needed
3. Suggest relevant tags for discoverability
4. Identify related topics that might be of interest

Be concise and preserve the user's voice and intent.`;

      const userPrompt = `
Content Type: ${type}
Content: ${content}

Please enhance this content and return your suggestions as JSON.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return this.parseContentEnhancement(response.content[0]);

    } catch (error) {
      console.error('Content enhancement failed:', error);
      return {};
    }
  }

  async generateSmartSpaceRules(
    spaceName: string,
    description: string,
    existingCards: Card[] = []
  ): Promise<{
    autoIncludeRules: string[];
    autoExcludeRules: string[];
    suggestedKeywords: string[];
  }> {
    try {
      const systemPrompt = `You are an expert at creating automated organization rules for knowledge management.
Given a smart space concept and example content, create rules that would automatically include or exclude content.

Rules should be:
- Specific enough to be actionable
- General enough to catch relevant content
- Clear and unambiguous

Return rules as JSON with arrays for inclusion/exclusion rules and suggested keywords.`;

      const userPrompt = `
Smart Space: ${spaceName}
Description: ${description}

Example Content:
${existingCards.slice(0, 5).map(card =>
  `- ${card.title}: ${card.content.substring(0, 100)}...`
).join('\n')}

Please generate organization rules for this space.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return this.parseSpaceRules(response.content[0]);

    } catch (error) {
      console.error('Smart space rule generation failed:', error);
      return {
        autoIncludeRules: [],
        autoExcludeRules: [],
        suggestedKeywords: []
      };
    }
  }

  async extractTextInsights(
    text: string,
    context?: { source: string; type: string }
  ): Promise<{
    mainTopics: string[];
    actionItems: string[];
    questions: string[];
    keyPoints: string[];
    entities: { type: string; value: string }[];
  }> {
    try {
      const systemPrompt = `You are a text analysis expert. Extract key insights from text content.

For each text, identify:
1. Main topics and themes
2. Action items or tasks mentioned
3. Questions that need answers
4. Key points or important information
5. Named entities (people, places, organizations, dates, etc.)

Be thorough but concise. Focus on actionable and useful insights.`;

      const userPrompt = `
${context ? `Context: ${context.source} (${context.type})` : ''}
Text: ${text}

Please analyze this text and extract insights as JSON.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      return this.parseTextInsights(response.content[0]);

    } catch (error) {
      console.error('Text insight extraction failed:', error);
      return {
        mainTopics: [],
        actionItems: [],
        questions: [],
        keyPoints: [],
        entities: []
      };
    }
  }

  private buildSystemPrompt(options: AIProcessingOptions): string {
    const tasks = [];

    if (options.generateTitle) tasks.push('generate a clear, descriptive title');
    if (options.generateSummary) tasks.push('create a concise summary');
    if (options.extractKeywords) tasks.push('extract relevant keywords');
    if (options.suggestTags) tasks.push('suggest helpful tags');
    if (options.suggestSmartSpaces) tasks.push('suggest organizational categories');
    if (options.analyzeContent) tasks.push('analyze content characteristics');

    return `You are an expert content analyst and organizer. Your task is to ${tasks.join(', ')}.

Be concise, accurate, and helpful. Focus on extracting meaningful information that will help with content organization and retrieval.

Return your response as valid JSON with the requested fields.`;
  }

  private buildUserPrompt(
    content: string,
    existingCard?: Partial<Card>,
    options: AIProcessingOptions = {}
  ): string {
    let prompt = `Content to analyze: ${content}`;

    if (existingCard?.title) {
      prompt += `\nExisting title: ${existingCard.title}`;
    }

    if (existingCard?.tags?.length) {
      prompt += `\nExisting tags: ${existingCard.tags.join(', ')}`;
    }

    const requestedFields = [];
    if (options.generateTitle) requestedFields.push('title');
    if (options.generateSummary) requestedFields.push('summary');
    if (options.extractKeywords) requestedFields.push('keywords (array)');
    if (options.suggestTags) requestedFields.push('tags (array)');
    if (options.suggestSmartSpaces) requestedFields.push('suggestedSpaces (array)');
    if (options.analyzeContent) requestedFields.push('contentAnalysis (object with topics, sentiment, complexity, category)');

    prompt += `\n\nPlease return JSON with: ${requestedFields.join(', ')}`;

    return prompt;
  }

  private parseAIResponse(content: any): Partial<AIProcessingResult> {
    try {
      const text = typeof content === 'string' ? content : content.text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        title: parsed.title,
        summary: parsed.summary,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        suggestedSpaces: Array.isArray(parsed.suggestedSpaces) ? parsed.suggestedSpaces : [],
        contentAnalysis: parsed.contentAnalysis
      };

    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        keywords: [],
        tags: [],
        suggestedSpaces: []
      };
    }
  }

  private parseOrganizationSuggestions(
    content: any,
    availableSpaces: SmartSpace[]
  ): SmartOrganizationSuggestion[] {
    try {
      const text = typeof content === 'string' ? content : content.text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed
        .filter((suggestion: any) => suggestion.spaceId && suggestion.confidence)
        .map((suggestion: any) => ({
          spaceId: suggestion.spaceId,
          spaceName: suggestion.spaceName || availableSpaces.find(s => s.id === suggestion.spaceId)?.name || 'Unknown',
          confidence: Math.min(1, Math.max(0, suggestion.confidence)),
          reason: suggestion.reason || 'No reason provided'
        }))
        .sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      console.error('Failed to parse organization suggestions:', error);
      return [];
    }
  }

  private parseContentEnhancement(content: any): ContentEnhancement {
    try {
      const text = typeof content === 'string' ? content : content.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {};
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        improvedTitle: parsed.improvedTitle,
        structuredContent: parsed.structuredContent,
        additionalTags: Array.isArray(parsed.additionalTags) ? parsed.additionalTags : [],
        relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : []
      };

    } catch (error) {
      console.error('Failed to parse content enhancement:', error);
      return {};
    }
  }

  private parseSpaceRules(content: any): {
    autoIncludeRules: string[];
    autoExcludeRules: string[];
    suggestedKeywords: string[];
  } {
    try {
      const text = typeof content === 'string' ? content : content.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return { autoIncludeRules: [], autoExcludeRules: [], suggestedKeywords: [] };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        autoIncludeRules: Array.isArray(parsed.autoIncludeRules) ? parsed.autoIncludeRules : [],
        autoExcludeRules: Array.isArray(parsed.autoExcludeRules) ? parsed.autoExcludeRules : [],
        suggestedKeywords: Array.isArray(parsed.suggestedKeywords) ? parsed.suggestedKeywords : []
      };

    } catch (error) {
      console.error('Failed to parse space rules:', error);
      return { autoIncludeRules: [], autoExcludeRules: [], suggestedKeywords: [] };
    }
  }

  private parseTextInsights(content: any): {
    mainTopics: string[];
    actionItems: string[];
    questions: string[];
    keyPoints: string[];
    entities: { type: string; value: string }[];
  } {
    try {
      const text = typeof content === 'string' ? content : content.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return { mainTopics: [], actionItems: [], questions: [], keyPoints: [], entities: [] };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        mainTopics: Array.isArray(parsed.mainTopics) ? parsed.mainTopics : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        entities: Array.isArray(parsed.entities) ? parsed.entities : []
      };

    } catch (error) {
      console.error('Failed to parse text insights:', error);
      return { mainTopics: [], actionItems: [], questions: [], keyPoints: [], entities: [] };
    }
  }

  private generateFallbackResult(content: string): Partial<AIProcessingResult> {
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = words.reduce((freq, word) => {
      if (word.length > 3) {
        freq[word] = (freq[word] || 0) + 1;
      }
      return freq;
    }, {} as Record<string, number>);

    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    return {
      keywords,
      tags: keywords.slice(0, 3),
      suggestedSpaces: [],
      summary: content.length > 200 ? content.substring(0, 200) + '...' : content
    };
  }

  private calculateConfidence(result: Partial<AIProcessingResult>, content: string): number {
    let confidence = 0.5;

    if (result.keywords && result.keywords.length > 0) confidence += 0.2;
    if (result.tags && result.tags.length > 0) confidence += 0.1;
    if (result.summary && result.summary.length > 10) confidence += 0.1;
    if (result.contentAnalysis) confidence += 0.1;

    const contentLength = content.length;
    if (contentLength < 50) confidence -= 0.2;
    else if (contentLength > 500) confidence += 0.1;

    return Math.min(1, Math.max(0, confidence));
  }
}