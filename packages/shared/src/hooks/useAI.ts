import { useState, useCallback, useRef } from 'react';
import { ClaudeAIService } from '../services/ai/claude';
import type {
  AIProcessingOptions,
  AIProcessingResult,
  SmartOrganizationSuggestion,
  ContentEnhancement
} from '../services/ai/claude';
import type { Card, SmartSpace } from '../types';

export interface UseAIOptions {
  apiKey: string;
  autoProcess?: boolean;
  processingDelay?: number;
}

export interface UseAIReturn {
  // Processing state
  processing: boolean;
  error: string | null;

  // Content processing
  processContent: (
    content: string,
    existingCard?: Partial<Card>,
    options?: AIProcessingOptions
  ) => Promise<AIProcessingResult | null>;

  // Smart organization
  suggestSpaces: (
    card: Card,
    availableSpaces: SmartSpace[]
  ) => Promise<SmartOrganizationSuggestion[]>;

  // Content enhancement
  enhanceContent: (
    content: string,
    type?: string
  ) => Promise<ContentEnhancement | null>;

  // Text analysis
  extractInsights: (
    text: string,
    context?: { source: string; type: string }
  ) => Promise<{
    mainTopics: string[];
    actionItems: string[];
    questions: string[];
    keyPoints: string[];
    entities: { type: string; value: string }[];
  } | null>;

  // Smart space rules
  generateSpaceRules: (
    spaceName: string,
    description: string,
    existingCards?: Card[]
  ) => Promise<{
    autoIncludeRules: string[];
    autoExcludeRules: string[];
    suggestedKeywords: string[];
  } | null>;

  // Auto-processing
  enableAutoProcessing: (enabled: boolean) => void;
  isAutoProcessingEnabled: boolean;
}

export function useAI(options: UseAIOptions): UseAIReturn {
  const { apiKey, autoProcess = false, processingDelay = 1000 } = options;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoProcessingEnabled, setIsAutoProcessingEnabled] = useState(autoProcess);

  const claudeServiceRef = useRef<ClaudeAIService | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout>();

  if (!claudeServiceRef.current && apiKey) {
    claudeServiceRef.current = new ClaudeAIService(apiKey);
  }

  const processContent = useCallback(async (
    content: string,
    existingCard?: Partial<Card>,
    processingOptions?: AIProcessingOptions
  ): Promise<AIProcessingResult | null> => {
    if (!claudeServiceRef.current) {
      setError('AI service not initialized');
      return null;
    }

    try {
      setProcessing(true);
      setError(null);

      const result = await claudeServiceRef.current.processContent(
        content,
        existingCard,
        processingOptions
      );

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Content processing failed';
      setError(errorMessage);
      console.error('Content processing error:', err);
      return null;

    } finally {
      setProcessing(false);
    }
  }, []);

  const suggestSpaces = useCallback(async (
    card: Card,
    availableSpaces: SmartSpace[]
  ): Promise<SmartOrganizationSuggestion[]> => {
    if (!claudeServiceRef.current) {
      setError('AI service not initialized');
      return [];
    }

    try {
      setProcessing(true);
      setError(null);

      const suggestions = await claudeServiceRef.current.suggestSmartSpaceOrganization(
        card,
        availableSpaces
      );

      return suggestions;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Space suggestion failed';
      setError(errorMessage);
      console.error('Space suggestion error:', err);
      return [];

    } finally {
      setProcessing(false);
    }
  }, []);

  const enhanceContent = useCallback(async (
    content: string,
    type: string = 'note'
  ): Promise<ContentEnhancement | null> => {
    if (!claudeServiceRef.current) {
      setError('AI service not initialized');
      return null;
    }

    try {
      setProcessing(true);
      setError(null);

      const enhancement = await claudeServiceRef.current.enhanceContent(content, type);

      return enhancement;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Content enhancement failed';
      setError(errorMessage);
      console.error('Content enhancement error:', err);
      return null;

    } finally {
      setProcessing(false);
    }
  }, []);

  const extractInsights = useCallback(async (
    text: string,
    context?: { source: string; type: string }
  ) => {
    if (!claudeServiceRef.current) {
      setError('AI service not initialized');
      return null;
    }

    try {
      setProcessing(true);
      setError(null);

      const insights = await claudeServiceRef.current.extractTextInsights(text, context);

      return insights;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Insight extraction failed';
      setError(errorMessage);
      console.error('Insight extraction error:', err);
      return null;

    } finally {
      setProcessing(false);
    }
  }, []);

  const generateSpaceRules = useCallback(async (
    spaceName: string,
    description: string,
    existingCards: Card[] = []
  ) => {
    if (!claudeServiceRef.current) {
      setError('AI service not initialized');
      return null;
    }

    try {
      setProcessing(true);
      setError(null);

      const rules = await claudeServiceRef.current.generateSmartSpaceRules(
        spaceName,
        description,
        existingCards
      );

      return rules;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rule generation failed';
      setError(errorMessage);
      console.error('Rule generation error:', err);
      return null;

    } finally {
      setProcessing(false);
    }
  }, []);

  const enableAutoProcessing = useCallback((enabled: boolean) => {
    setIsAutoProcessingEnabled(enabled);
  }, []);

  return {
    processing,
    error,
    processContent,
    suggestSpaces,
    enhanceContent,
    extractInsights,
    generateSpaceRules,
    enableAutoProcessing,
    isAutoProcessingEnabled
  };
}

// Hook for auto-processing content with debouncing
export function useAutoAI(
  content: string,
  options: UseAIOptions & {
    enabled?: boolean;
    processingOptions?: AIProcessingOptions;
  }
): {
  result: AIProcessingResult | null;
  processing: boolean;
  error: string | null;
} {
  const { enabled = true, processingOptions, processingDelay = 2000 } = options;
  const [result, setResult] = useState<AIProcessingResult | null>(null);

  const { processContent, processing, error } = useAI(options);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedProcess = useCallback(async () => {
    if (!enabled || !content.trim() || content.length < 10) {
      setResult(null);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const processedResult = await processContent(content, undefined, processingOptions);
      setResult(processedResult);
    }, processingDelay);
  }, [content, enabled, processContent, processingOptions, processingDelay]);

  // Process content when it changes
  React.useEffect(() => {
    debouncedProcess();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedProcess]);

  return {
    result,
    processing,
    error
  };
}

// Hook for smart space suggestions
export function useSmartSpaceSuggestions(
  card: Card | null,
  availableSpaces: SmartSpace[],
  options: UseAIOptions & { enabled?: boolean }
): {
  suggestions: SmartOrganizationSuggestion[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const { enabled = true } = options;
  const [suggestions, setSuggestions] = useState<SmartOrganizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const { suggestSpaces, error } = useAI(options);

  const refresh = useCallback(async () => {
    if (!enabled || !card || availableSpaces.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const newSuggestions = await suggestSpaces(card, availableSpaces);
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Failed to get space suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, card, availableSpaces, suggestSpaces]);

  // Auto-refresh when card or spaces change
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    suggestions,
    loading,
    error,
    refresh
  };
}