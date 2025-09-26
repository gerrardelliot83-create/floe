'use client';

import React from 'react';
import type { SmartSpace as SmartSpaceType } from '@floe/shared';

interface SmartSpaceCardProps {
  smartSpace: SmartSpaceType;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SmartSpaceCard({
  smartSpace,
  onPress,
  onEdit,
  onDelete,
  className = ''
}: SmartSpaceCardProps) {
  const getIconSymbol = (icon: string) => {
    const iconMap: Record<string, string> = {
      folder: '□',
      clock: '○',
      image: '◇',
      document: '◈',
      note: '◉',
      star: '★',
      briefcase: '◆',
      book: '◎',
      heart: '♡',
      tag: '#',
      search: '○',
      recent: '○',
      archive: '□'
    };
    return iconMap[icon] || '○';
  };

  return (
    <div
      className={`
        card-minimal cursor-pointer
        hover:bg-hover-light dark:hover:bg-hover-dark
        transition-colors duration-150
        ${className}
      `}
      onClick={onPress}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-sm mb-xs">
            <span className="text-lg text-text-primary-light dark:text-text-primary-dark">
              {getIconSymbol(smartSpace.icon)}
            </span>
            <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark">
              {smartSpace.name}
            </h3>
          </div>

          {smartSpace.description && (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-sm">
              {smartSpace.description}
            </p>
          )}

          <div className="flex items-center space-x-md">
            <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
              {smartSpace.cards_count} {smartSpace.cards_count === 1 ? 'CARD' : 'CARDS'}
            </span>

            {smartSpace.is_default && (
              <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
                DEFAULT
              </span>
            )}

            {!smartSpace.is_active && (
              <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
                INACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Action menu - minimal */}
        <div className="flex items-center space-x-xs ml-sm">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="
                text-text-tertiary-light dark:text-text-tertiary-dark
                hover:text-text-primary-light dark:hover:text-text-primary-dark
                transition-colors duration-150
                text-sm
              "
            >
              ·
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SmartSpaceGridProps {
  smartSpaces: SmartSpaceType[];
  onSpaceClick?: (smartSpace: SmartSpaceType) => void;
  onSpaceEdit?: (smartSpace: SmartSpaceType) => void;
  onSpaceDelete?: (smartSpace: SmartSpaceType) => void;
  className?: string;
}

export function SmartSpaceGrid({
  smartSpaces,
  onSpaceClick,
  onSpaceEdit,
  onSpaceDelete,
  className = ''
}: SmartSpaceGridProps) {
  // Separate default and custom spaces
  const defaultSpaces = smartSpaces.filter(space => space.is_default);
  const customSpaces = smartSpaces.filter(space => !space.is_default);

  return (
    <div className={`space-y-xl ${className}`}>
      {/* Default spaces */}
      {defaultSpaces.length > 0 && (
        <div>
          <h2 className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase mb-md">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {defaultSpaces.map((space) => (
              <SmartSpaceCard
                key={space.id}
                smartSpace={space}
                onPress={() => onSpaceClick?.(space)}
                onEdit={() => onSpaceEdit?.(space)}
                onDelete={() => onSpaceDelete?.(space)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom spaces */}
      {customSpaces.length > 0 && (
        <div>
          <h2 className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase mb-md">
            Custom Spaces
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {customSpaces.map((space) => (
              <SmartSpaceCard
                key={space.id}
                smartSpace={space}
                onPress={() => onSpaceClick?.(space)}
                onEdit={() => onSpaceEdit?.(space)}
                onDelete={() => onSpaceDelete?.(space)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {smartSpaces.length === 0 && (
        <div className="text-center py-xl">
          <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-sm">
            No smart spaces yet. They'll appear automatically as you add content.
          </p>
        </div>
      )}
    </div>
  );
}