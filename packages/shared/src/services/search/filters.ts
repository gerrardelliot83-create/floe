import type { CardType } from '../../types';

export interface SearchFilter {
  id: string;
  name: string;
  type: 'single' | 'multiple' | 'range' | 'boolean';
  options?: Array<{ value: string; label: string; count?: number }>;
  value?: any;
  active: boolean;
}

export interface FilterGroup {
  id: string;
  name: string;
  filters: SearchFilter[];
  expanded: boolean;
}

export class FilterManager {
  // Get available filters based on user's content
  static async getAvailableFilters(userId: string): Promise<FilterGroup[]> {
    try {
      // In a real implementation, this would query the database
      // to get actual counts for each filter option
      const filters: FilterGroup[] = [
        {
          id: 'content',
          name: 'Content Type',
          expanded: true,
          filters: [
            {
              id: 'type',
              name: 'Type',
              type: 'multiple',
              options: [
                { value: 'note', label: 'Notes' },
                { value: 'article', label: 'Articles' },
                { value: 'image', label: 'Images' },
                { value: 'video', label: 'Videos' },
                { value: 'pdf', label: 'PDFs' },
                { value: 'link', label: 'Links' },
                { value: 'quote', label: 'Quotes' },
                { value: 'recipe', label: 'Recipes' },
                { value: 'tweet', label: 'Tweets' },
                { value: 'product', label: 'Products' },
                { value: 'audio', label: 'Audio' }
              ],
              active: false
            }
          ]
        },
        {
          id: 'organization',
          name: 'Organization',
          expanded: true,
          filters: [
            {
              id: 'isPinned',
              name: 'Pinned',
              type: 'boolean',
              active: false
            },
            {
              id: 'isArchived',
              name: 'Archived',
              type: 'boolean',
              active: false
            }
          ]
        },
        {
          id: 'time',
          name: 'Time Range',
          expanded: false,
          filters: [
            {
              id: 'dateRange',
              name: 'Date Range',
              type: 'range',
              options: [
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom Range' }
              ],
              active: false
            }
          ]
        },
        {
          id: 'source',
          name: 'Source',
          expanded: false,
          filters: [
            {
              id: 'domain',
              name: 'Domain',
              type: 'multiple',
              options: [], // Will be populated dynamically
              active: false
            }
          ]
        },
        {
          id: 'ai',
          name: 'AI Analysis',
          expanded: false,
          filters: [
            {
              id: 'category',
              name: 'Category',
              type: 'multiple',
              options: [
                { value: 'Work & Productivity', label: 'Work & Productivity' },
                { value: 'Learning & Education', label: 'Learning & Education' },
                { value: 'Health & Wellness', label: 'Health & Wellness' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Creative & Design', label: 'Creative & Design' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Reference', label: 'Reference' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'News & Current Events', label: 'News & Current Events' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Travel', label: 'Travel' },
                { value: 'Food & Recipes', label: 'Food & Recipes' },
                { value: 'Other', label: 'Other' }
              ],
              active: false
            },
            {
              id: 'sentiment',
              name: 'Sentiment',
              type: 'single',
              options: [
                { value: 'positive', label: 'Positive' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'negative', label: 'Negative' }
              ],
              active: false
            }
          ]
        }
      ];

      return filters;
    } catch (error) {
      console.error('Failed to get available filters:', error);
      return [];
    }
  }

  // Convert filter state to search options
  static buildSearchFilters(filterGroups: FilterGroup[]): any {
    const filters: any = {};

    filterGroups.forEach(group => {
      group.filters.forEach(filter => {
        if (!filter.active || !filter.value) return;

        switch (filter.id) {
          case 'type':
            filters.type = Array.isArray(filter.value) ? filter.value : [filter.value];
            break;

          case 'isPinned':
            filters.isPinned = filter.value;
            break;

          case 'isArchived':
            filters.isArchived = filter.value;
            break;

          case 'dateRange':
            filters.dateRange = this.parseDateRange(filter.value);
            break;

          case 'domain':
            filters.domain = Array.isArray(filter.value) ? filter.value : [filter.value];
            break;

          case 'category':
            filters.category = Array.isArray(filter.value) ? filter.value : [filter.value];
            break;

          case 'sentiment':
            // Convert sentiment to numeric range
            switch (filter.value) {
              case 'positive':
                filters.sentimentRange = { min: 0.1, max: 1.0 };
                break;
              case 'negative':
                filters.sentimentRange = { min: -1.0, max: -0.1 };
                break;
              case 'neutral':
                filters.sentimentRange = { min: -0.1, max: 0.1 };
                break;
            }
            break;
        }
      });
    });

    return filters;
  }

  private static parseDateRange(value: string): { from: string; to: string } | undefined {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (value) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;

      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        break;

      default:
        return undefined;
    }

    return {
      from: from.toISOString(),
      to: to.toISOString()
    };
  }

  // Get popular tags for tag filter
  static async getPopularTags(userId: string, limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    try {
      // This would be implemented with proper aggregation in production
      const tagCounts: Record<string, number> = {};

      // Simulate tag counting - in real implementation, use SQL aggregation
      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get popular tags:', error);
      return [];
    }
  }

  // Get popular domains for domain filter
  static async getPopularDomains(userId: string, limit: number = 10): Promise<Array<{ domain: string; count: number }>> {
    try {
      // Similar to tags, this would use proper SQL aggregation
      return [];
    } catch (error) {
      console.error('Failed to get popular domains:', error);
      return [];
    }
  }

  // Apply a single filter
  static applyFilter(filterGroups: FilterGroup[], filterId: string, value: any): FilterGroup[] {
    return filterGroups.map(group => ({
      ...group,
      filters: group.filters.map(filter =>
        filter.id === filterId
          ? { ...filter, value, active: value !== undefined && value !== null }
          : filter
      )
    }));
  }

  // Clear all filters
  static clearAllFilters(filterGroups: FilterGroup[]): FilterGroup[] {
    return filterGroups.map(group => ({
      ...group,
      filters: group.filters.map(filter => ({
        ...filter,
        value: undefined,
        active: false
      }))
    }));
  }

  // Clear a single filter
  static clearFilter(filterGroups: FilterGroup[], filterId: string): FilterGroup[] {
    return filterGroups.map(group => ({
      ...group,
      filters: group.filters.map(filter =>
        filter.id === filterId
          ? { ...filter, value: undefined, active: false }
          : filter
      )
    }));
  }

  // Get active filter count
  static getActiveFilterCount(filterGroups: FilterGroup[]): number {
    return filterGroups.reduce((count, group) =>
      count + group.filters.filter(filter => filter.active).length, 0
    );
  }

  // Get filter summary for display
  static getFilterSummary(filterGroups: FilterGroup[]): string[] {
    const summary: string[] = [];

    filterGroups.forEach(group => {
      group.filters.forEach(filter => {
        if (!filter.active || !filter.value) return;

        switch (filter.type) {
          case 'boolean':
            if (filter.value) {
              summary.push(filter.name);
            }
            break;

          case 'single':
            const singleOption = filter.options?.find(opt => opt.value === filter.value);
            if (singleOption) {
              summary.push(`${filter.name}: ${singleOption.label}`);
            }
            break;

          case 'multiple':
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              const labels = filter.value
                .map(val => filter.options?.find(opt => opt.value === val)?.label || val)
                .slice(0, 3);
              const more = filter.value.length > 3 ? ` +${filter.value.length - 3}` : '';
              summary.push(`${filter.name}: ${labels.join(', ')}${more}`);
            }
            break;

          case 'range':
            summary.push(`${filter.name}: ${filter.value}`);
            break;
        }
      });
    });

    return summary;
  }
}