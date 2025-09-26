'use client';

import React from 'react';
import type { Card as CardType } from '@floe/shared';

interface CardProps {
  card: CardType;
  onPress?: () => void;
  onLongPress?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function Card({ card, onPress, onLongPress, onPin, onDelete, className = '' }: CardProps) {
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    return past.toLocaleDateString();
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      note: 'NOTE',
      article: 'ARTICLE',
      image: 'IMAGE',
      video: 'VIDEO',
      pdf: 'PDF',
      quote: 'QUOTE',
      recipe: 'RECIPE',
      tweet: 'TWEET',
      product: 'PRODUCT',
      link: 'LINK',
      audio: 'AUDIO'
    };
    return typeLabels[type] || type.toUpperCase();
  };

  return (
    <article
      className={`card-minimal ${className}`}
      onClick={onPress}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress?.();
      }}
    >
      {/* Media preview - only for images/videos */}
      {card.thumbnail_url && (card.type === 'image' || card.type === 'video') && (
        <div className="mb-sm">
          <img
            src={card.thumbnail_url}
            alt={card.title || 'Content preview'}
            className="w-full h-auto max-h-96 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-xs">
        {/* Title */}
        {card.title && (
          <h2 className="text-base font-normal text-text-primary-light dark:text-text-primary-dark leading-tight">
            {card.title}
          </h2>
        )}

        {/* Content preview */}
        {card.content && (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            {card.content.length > 200
              ? `${card.content.substring(0, 200)}...`
              : card.content
            }
          </p>
        )}

        {/* URL preview */}
        {card.url && card.type !== 'note' && (
          <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
            {card.source_domain || new URL(card.url).hostname}
          </p>
        )}
      </div>

      {/* Metadata footer */}
      <div className="flex items-center justify-between mt-md pt-sm border-t border-border-light dark:border-border-dark">
        <div className="flex items-center space-x-sm">
          <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
            {getTypeLabel(card.type)}
          </span>
          {card.is_pinned && (
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              ∗
            </span>
          )}
        </div>

        <div className="flex items-center space-x-sm text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
          <span>{formatTimeAgo(card.created_at)}</span>
        </div>
      </div>

      {/* Tags - minimal display */}
      {(card.ai_tags.length > 0 || card.manual_tags.length > 0) && (
        <div className="mt-sm">
          <div className="flex flex-wrap gap-xs">
            {[...card.manual_tags, ...card.ai_tags.slice(0, 3)].slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase"
              >
                {tag}
              </span>
            ))}
            {(card.ai_tags.length + card.manual_tags.length) > 5 && (
              <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                +{(card.ai_tags.length + card.manual_tags.length) - 5}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}