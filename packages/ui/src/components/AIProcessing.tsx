import React, { useState } from 'react';
import { Button } from './Button';
import type {
  AIProcessingResult,
  SmartOrganizationSuggestion,
  ContentEnhancement
} from '@floe/shared';

interface AIProcessingIndicatorProps {
  processing: boolean;
  result?: AIProcessingResult | null;
  error?: string | null;
  className?: string;
}

export function AIProcessingIndicator({
  processing,
  result,
  error,
  className = ''
}: AIProcessingIndicatorProps) {
  if (!processing && !result && !error) return null;

  return (
    <div className={`space-y-xs ${className}`}>
      {processing && (
        <div className="flex items-center space-x-xs text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <div className="animate-spin">◐</div>
          <span>AI processing...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500 flex items-center space-x-xs">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
          AI processed • {result.confidence > 0.8 ? 'High' : result.confidence > 0.5 ? 'Medium' : 'Low'} confidence
        </div>
      )}
    </div>
  );
}

interface AITagSuggestionsProps {
  suggestions: string[];
  onApply: (tags: string[]) => void;
  onDismiss: () => void;
  className?: string;
}

export function AITagSuggestions({
  suggestions,
  onApply,
  onDismiss,
  className = ''
}: AITagSuggestionsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (suggestions.length === 0) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    onApply(selectedTags);
    setSelectedTags([]);
  };

  return (
    <div className={`border border-border-light dark:border-border-dark rounded-lg p-sm space-y-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          AI suggested tags
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark hover:text-text-secondary-light dark:hover:text-text-secondary-dark"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap gap-xs">
        {suggestions.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`
              px-xs py-1 rounded text-xs border transition-colors
              ${selectedTags.includes(tag)
                ? 'bg-text-primary-light dark:bg-text-primary-dark text-bg-primary-light dark:text-bg-primary-dark border-text-primary-light dark:border-text-primary-dark'
                : 'bg-transparent text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark hover:border-text-secondary-light dark:hover:border-text-secondary-dark'
              }
            `}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex justify-end space-x-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={selectedTags.length === 0}
        >
          Apply ({selectedTags.length})
        </Button>
      </div>
    </div>
  );
}

interface SmartSpaceSuggestionsProps {
  suggestions: SmartOrganizationSuggestion[];
  onApply: (spaceIds: string[]) => void;
  onDismiss: () => void;
  className?: string;
}

export function SmartSpaceSuggestions({
  suggestions,
  onApply,
  onDismiss,
  className = ''
}: SmartSpaceSuggestionsProps) {
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  if (suggestions.length === 0) return null;

  const toggleSpace = (spaceId: string) => {
    setSelectedSpaces(prev =>
      prev.includes(spaceId)
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const handleApply = () => {
    onApply(selectedSpaces);
    setSelectedSpaces([]);
  };

  return (
    <div className={`border border-border-light dark:border-border-dark rounded-lg p-sm space-y-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          AI suggested smart spaces
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark hover:text-text-secondary-light dark:hover:text-text-secondary-dark"
        >
          ×
        </button>
      </div>

      <div className="space-y-xs">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.spaceId}
            className={`
              border rounded p-xs cursor-pointer transition-colors
              ${selectedSpaces.includes(suggestion.spaceId)
                ? 'bg-bg-secondary-light dark:bg-bg-secondary-dark border-text-primary-light dark:border-text-primary-dark'
                : 'border-border-light dark:border-border-dark hover:border-text-secondary-light dark:hover:border-text-secondary-dark'
              }
            `}
            onClick={() => toggleSpace(suggestion.spaceId)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                  {suggestion.spaceName}
                </div>
                <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                  {suggestion.reason}
                </div>
              </div>
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {Math.round(suggestion.confidence * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={selectedSpaces.length === 0}
        >
          Add to Spaces ({selectedSpaces.length})
        </Button>
      </div>
    </div>
  );
}

interface ContentEnhancementProps {
  enhancement: ContentEnhancement;
  onApply: (enhancement: Partial<ContentEnhancement>) => void;
  onDismiss: () => void;
  className?: string;
}

export function ContentEnhancement({
  enhancement,
  onApply,
  onDismiss,
  className = ''
}: ContentEnhancementProps) {
  const [selectedEnhancements, setSelectedEnhancements] = useState<{
    title: boolean;
    content: boolean;
    tags: boolean;
  }>({
    title: false,
    content: false,
    tags: false
  });

  const hasEnhancements = enhancement.improvedTitle ||
                          enhancement.structuredContent ||
                          (enhancement.additionalTags && enhancement.additionalTags.length > 0);

  if (!hasEnhancements) return null;

  const toggleEnhancement = (type: keyof typeof selectedEnhancements) => {
    setSelectedEnhancements(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleApply = () => {
    const applicableEnhancements: Partial<ContentEnhancement> = {};

    if (selectedEnhancements.title && enhancement.improvedTitle) {
      applicableEnhancements.improvedTitle = enhancement.improvedTitle;
    }

    if (selectedEnhancements.content && enhancement.structuredContent) {
      applicableEnhancements.structuredContent = enhancement.structuredContent;
    }

    if (selectedEnhancements.tags && enhancement.additionalTags) {
      applicableEnhancements.additionalTags = enhancement.additionalTags;
    }

    onApply(applicableEnhancements);
    setSelectedEnhancements({ title: false, content: false, tags: false });
  };

  return (
    <div className={`border border-border-light dark:border-border-dark rounded-lg p-sm space-y-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          AI content enhancements
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark hover:text-text-secondary-light dark:hover:text-text-secondary-dark"
        >
          ×
        </button>
      </div>

      <div className="space-y-sm">
        {enhancement.improvedTitle && (
          <div className="space-y-xs">
            <label className="flex items-center space-x-xs cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEnhancements.title}
                onChange={() => toggleEnhancement('title')}
                className="w-3 h-3"
              />
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Improved title
              </span>
            </label>
            <div className="text-xs text-text-primary-light dark:text-text-primary-dark pl-4">
              "{enhancement.improvedTitle}"
            </div>
          </div>
        )}

        {enhancement.structuredContent && (
          <div className="space-y-xs">
            <label className="flex items-center space-x-xs cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEnhancements.content}
                onChange={() => toggleEnhancement('content')}
                className="w-3 h-3"
              />
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Structured content
              </span>
            </label>
            <div className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark pl-4 max-h-20 overflow-y-auto">
              {enhancement.structuredContent.substring(0, 200)}...
            </div>
          </div>
        )}

        {enhancement.additionalTags && enhancement.additionalTags.length > 0 && (
          <div className="space-y-xs">
            <label className="flex items-center space-x-xs cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEnhancements.tags}
                onChange={() => toggleEnhancement('tags')}
                className="w-3 h-3"
              />
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Additional tags
              </span>
            </label>
            <div className="flex flex-wrap gap-xs pl-4">
              {enhancement.additionalTags.map((tag) => (
                <span
                  key={tag}
                  className="px-xs py-1 rounded text-xs bg-bg-secondary-light dark:bg-bg-secondary-dark text-text-secondary-light dark:text-text-secondary-dark"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={!Object.values(selectedEnhancements).some(Boolean)}
        >
          Apply Selected
        </Button>
      </div>
    </div>
  );
}

interface AIInsightsProps {
  insights: {
    mainTopics: string[];
    actionItems: string[];
    questions: string[];
    keyPoints: string[];
    entities: { type: string; value: string }[];
  };
  onDismiss: () => void;
  className?: string;
}

export function AIInsights({
  insights,
  onDismiss,
  className = ''
}: AIInsightsProps) {
  const hasInsights = insights.mainTopics.length > 0 ||
                     insights.actionItems.length > 0 ||
                     insights.questions.length > 0 ||
                     insights.keyPoints.length > 0 ||
                     insights.entities.length > 0;

  if (!hasInsights) return null;

  return (
    <div className={`border border-border-light dark:border-border-dark rounded-lg p-sm space-y-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          AI insights
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark hover:text-text-secondary-light dark:hover:text-text-secondary-dark"
        >
          ×
        </button>
      </div>

      <div className="space-y-sm text-xs">
        {insights.mainTopics.length > 0 && (
          <div>
            <div className="font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
              Main Topics
            </div>
            <div className="flex flex-wrap gap-xs">
              {insights.mainTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-xs py-1 rounded bg-bg-secondary-light dark:bg-bg-secondary-dark text-text-secondary-light dark:text-text-secondary-dark"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {insights.actionItems.length > 0 && (
          <div>
            <div className="font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
              Action Items
            </div>
            <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark">
              {insights.actionItems.map((item, index) => (
                <li key={index} className="flex items-start space-x-xs">
                  <span className="text-text-tertiary-light dark:text-text-tertiary-dark">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.questions.length > 0 && (
          <div>
            <div className="font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
              Questions
            </div>
            <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark">
              {insights.questions.map((question, index) => (
                <li key={index} className="flex items-start space-x-xs">
                  <span className="text-text-tertiary-light dark:text-text-tertiary-dark">?</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.keyPoints.length > 0 && (
          <div>
            <div className="font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
              Key Points
            </div>
            <ul className="space-y-1 text-text-secondary-light dark:text-text-secondary-dark">
              {insights.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-xs">
                  <span className="text-text-tertiary-light dark:text-text-tertiary-dark">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.entities.length > 0 && (
          <div>
            <div className="font-medium text-text-primary-light dark:text-text-primary-dark mb-xs">
              Entities
            </div>
            <div className="flex flex-wrap gap-xs">
              {insights.entities.map((entity, index) => (
                <span
                  key={index}
                  className="px-xs py-1 rounded bg-bg-secondary-light dark:bg-bg-secondary-dark text-text-secondary-light dark:text-text-secondary-dark"
                  title={entity.type}
                >
                  {entity.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}