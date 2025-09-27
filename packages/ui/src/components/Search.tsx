'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { Button } from './Button';
import { Card } from './Card';
import { Grid } from './Grid';
import { LoadingState, EmptyState } from './Layout';
import { SearchEngine, FilterManager, type SearchOptions, type SearchResponse } from '@floe/shared';
import type { FilterGroup } from '@floe/shared';

interface SearchComponentProps {
  userId: string;
  onCardClick?: (cardId: string) => void;
  className?: string;
}

export function SearchComponent({ userId, onCardClick, className = '' }: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'created_at' | 'updated_at'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Initialize filters on mount
  useEffect(() => {
    FilterManager.getAvailableFilters(userId).then(setFilterGroups);
  }, [userId]);

  // Perform search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() && FilterManager.getActiveFilterCount(filterGroups) === 0) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchOptions: SearchOptions = {
        userId,
        query: searchQuery,
        filters: FilterManager.buildSearchFilters(filterGroups),
        sortBy,
        sortOrder,
        limit: 50
      };

      const response = await SearchEngine.search(searchOptions);
      setResults(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle search query changes
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    performSearch(newQuery);
  };

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: any) => {
    const updatedFilters = FilterManager.applyFilter(filterGroups, filterId, value);
    setFilterGroups(updatedFilters);
    performSearch(query);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = FilterManager.clearAllFilters(filterGroups);
    setFilterGroups(clearedFilters);
    performSearch(query);
  };

  // Handle sorting changes
  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder?: typeof sortOrder) => {
    setSortBy(newSortBy);
    if (newSortOrder) setSortOrder(newSortOrder);
    performSearch(query);
  };

  const activeFilterCount = FilterManager.getActiveFilterCount(filterGroups);
  const filterSummary = FilterManager.getFilterSummary(filterGroups);

  return (
    <div className={`space-y-lg ${className}`}>
      {/* Search bar */}
      <div className="relative">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search your knowledge..."
          autoFocus
          className="mb-md"
        />

        {/* Search controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-sm">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                handleSortChange(newSortBy, newSortOrder);
              }}
              className="text-sm bg-transparent border border-border-light dark:border-border-dark px-sm py-xs"
            >
              <option value="relevance-desc">Most relevant</option>
              <option value="created_at-desc">Newest first</option>
              <option value="created_at-asc">Oldest first</option>
              <option value="updated_at-desc">Recently updated</option>
            </select>
          </div>
        </div>

        {/* Active filter summary */}
        {filterSummary.length > 0 && (
          <div className="mt-sm">
            <div className="flex flex-wrap gap-xs">
              {filterSummary.map((summary, index) => (
                <span
                  key={index}
                  className="text-xs bg-selected-light dark:bg-selected-dark px-xs py-micro rounded-sm"
                >
                  {summary}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="border border-border-light dark:border-border-dark p-lg">
          <div className="space-y-lg">
            {filterGroups.map(group => (
              <FilterGroupComponent
                key={group.id}
                group={group}
                onChange={handleFilterChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      <div>
        {loading && <LoadingState message="Searching..." />}

        {error && (
          <EmptyState
            title="Search failed"
            description={error}
            action={
              <Button onClick={() => performSearch(query)}>
                Try again
              </Button>
            }
          />
        )}

        {results && !loading && (
          <div>
            {/* Results summary */}
            <div className="mb-lg">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {results.total === 0
                  ? 'No results found'
                  : `${results.total} result${results.total !== 1 ? 's' : ''} found in ${results.took}ms`
                }
                {results.query && (
                  <span> for "{results.query}"</span>
                )}
              </p>
            </div>

            {/* Results grid */}
            {results.results.length > 0 ? (
              <Grid>
                {results.results.map(result => (
                  <Card
                    key={result.id}
                    card={result as any} // Type conversion for compatibility
                    onPress={() => onCardClick?.(result.id)}
                  />
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No results found"
                description={
                  query
                    ? `No cards match your search for "${query}"`
                    : "Try adjusting your filters or search terms"
                }
              />
            )}
          </div>
        )}

        {/* No search performed yet */}
        {!results && !loading && !error && (
          <EmptyState
            title="Search your knowledge"
            description="Enter a search term or apply filters to find your cards"
          />
        )}
      </div>
    </div>
  );
}

interface FilterGroupComponentProps {
  group: FilterGroup;
  onChange: (filterId: string, value: any) => void;
}

function FilterGroupComponent({ group, onChange }: FilterGroupComponentProps) {
  const [expanded, setExpanded] = useState(group.expanded);

  return (
    <div className="space-y-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {group.name}
        </span>
        <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-sm pl-sm">
          {group.filters.map(filter => (
            <FilterComponent
              key={filter.id}
              filter={filter}
              onChange={(value) => onChange(filter.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterComponentProps {
  filter: any; // FilterGroup type
  onChange: (value: any) => void;
}

function FilterComponent({ filter, onChange }: FilterComponentProps) {
  switch (filter.type) {
    case 'boolean':
      return (
        <label className="flex items-center space-x-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filter.active && filter.value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
            {filter.name}
          </span>
        </label>
      );

    case 'single':
      return (
        <div>
          <label className="block text-sm text-text-primary-light dark:text-text-primary-dark mb-xs">
            {filter.name}
          </label>
          <select
            value={filter.value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="w-full text-sm bg-transparent border border-border-light dark:border-border-dark px-sm py-xs"
          >
            <option value="">All</option>
            {filter.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label} {option.count && `(${option.count})`}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiple':
      return (
        <div>
          <label className="block text-sm text-text-primary-light dark:text-text-primary-dark mb-xs">
            {filter.name}
          </label>
          <div className="space-y-xs max-h-32 overflow-y-auto">
            {filter.options?.map((option: any) => (
              <label key={option.value} className="flex items-center space-x-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(filter.value) && filter.value.includes(option.value)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(filter.value) ? filter.value : [];
                    const newValue = e.target.checked
                      ? [...currentValue, option.value]
                      : currentValue.filter((v: any) => v !== option.value);
                    onChange(newValue.length > 0 ? newValue : undefined);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  {option.label} {option.count && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}