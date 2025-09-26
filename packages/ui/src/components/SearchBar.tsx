'use client';

import React, { useState, useEffect } from 'react';
import { debounce } from '@floe/shared';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = 'Search...',
  initialValue = '',
  debounceMs = 300,
  className = '',
  autoFocus = false
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search function
  const debouncedSearch = debounce((searchQuery: string) => {
    onSearch(searchQuery);
  }, debounceMs);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          flex items-center transition-all duration-150
          border-b ${isFocused
            ? 'border-text-primary-light dark:border-text-primary-dark'
            : 'border-border-light dark:border-border-dark'
          }
        `}
      >
        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="
            flex-1
            bg-transparent
            text-base
            text-text-primary-light dark:text-text-primary-dark
            placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark
            py-sm
            outline-none
            font-light
          "
        />

        {/* Clear button - only show when there's content */}
        {query && (
          <button
            onClick={handleClear}
            className="
              ml-sm
              text-text-tertiary-light dark:text-text-tertiary-dark
              hover:text-text-primary-light dark:hover:text-text-primary-dark
              transition-colors duration-150
              text-sm
            "
          >
            ✕
          </button>
        )}
      </div>

      {/* Search hint - minimal and only when focused and empty */}
      {isFocused && !query && (
        <div className="absolute top-full mt-sm left-0 right-0">
          <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
            Search your cards, tags, and content
          </p>
        </div>
      )}
    </div>
  );
}

interface SearchSuggestion {
  type: 'recent' | 'tag' | 'content';
  value: string;
  count?: number;
}

interface SearchBarWithSuggestionsProps extends SearchBarProps {
  suggestions?: SearchSuggestion[];
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  showSuggestions?: boolean;
}

export function SearchBarWithSuggestions({
  suggestions = [],
  onSuggestionClick,
  showSuggestions = true,
  ...searchBarProps
}: SearchBarWithSuggestionsProps) {
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionClick?.(suggestion);
    setShowSuggestionsList(false);
  };

  return (
    <div className="relative">
      <SearchBar
        {...searchBarProps}
        onSearch={(query) => {
          searchBarProps.onSearch(query);
          setShowSuggestionsList(query.length === 0 && suggestions.length > 0);
        }}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute top-full mt-xs left-0 right-0 z-10">
          <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark py-sm">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="
                  w-full
                  text-left
                  px-md py-xs
                  hover:bg-hover-light dark:hover:bg-hover-dark
                  transition-colors duration-150
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    {suggestion.value}
                  </span>
                  <div className="flex items-center space-x-xs">
                    {suggestion.count && (
                      <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                        {suggestion.count}
                      </span>
                    )}
                    <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
                      {suggestion.type}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}