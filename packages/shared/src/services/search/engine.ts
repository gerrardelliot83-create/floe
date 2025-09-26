import { supabase } from '@floe/supabase';
import type { SearchResult } from '../../types';

export interface SearchOptions {
  userId: string;
  query: string;
  filters?: {
    type?: string[];
    tags?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
    isPinned?: boolean;
    isArchived?: boolean;
    domain?: string[];
    category?: string[];
  };
  sortBy?: 'relevance' | 'created_at' | 'updated_at' | 'accessed_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number; // milliseconds
  suggestions?: string[];
}

export class SearchEngine {
  private static readonly DEFAULT_LIMIT = 50;
  private static readonly MAX_LIMIT = 200;

  static async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    const limit = Math.min(options.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
    const offset = options.offset || 0;

    try {
      let results: SearchResult[] = [];
      let total = 0;

      if (options.query.trim()) {
        // Full-text search with filters
        const searchResults = await this.performFullTextSearch(options, limit, offset);
        results = searchResults.results;
        total = searchResults.total;
      } else {
        // Browse mode with filters
        const browseResults = await this.performBrowse(options, limit, offset);
        results = browseResults.results;
        total = browseResults.total;
      }

      // Log search for suggestions
      if (options.query.trim()) {
        await this.logSearch(options.userId, options.query, results.length);
      }

      const took = Date.now() - startTime;

      return {
        results,
        total,
        query: options.query,
        took,
        suggestions: await this.getSuggestions(options.userId, options.query)
      };
    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  private static async performFullTextSearch(
    options: SearchOptions,
    limit: number,
    offset: number
  ): Promise<{ results: SearchResult[]; total: number }> {
    // Build query for full-text search function
    const { data: results, error } = await supabase.rpc('search_cards', {
      search_query: options.query,
      user_uuid: options.userId,
      limit_count: limit
    });

    if (error) {
      throw new Error(`Full-text search failed: ${error.message}`);
    }

    // Apply additional filters
    let filteredResults = results || [];

    if (options.filters) {
      filteredResults = this.applyFilters(filteredResults, options.filters);
    }

    // Apply sorting
    filteredResults = this.applySorting(filteredResults, options.sortBy, options.sortOrder);

    // Apply pagination
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: filteredResults.length
    };
  }

  private static async performBrowse(
    options: SearchOptions,
    limit: number,
    offset: number
  ): Promise<{ results: SearchResult[]; total: number }> {
    let query = supabase
      .from('cards')
      .select(`
        id,
        title,
        content,
        type,
        thumbnail_url,
        created_at,
        updated_at,
        accessed_at,
        ai_tags,
        manual_tags,
        is_pinned,
        is_archived,
        source_domain,
        ai_category
      `)
      .eq('user_id', options.userId)
      .is('deleted_at', null);

    // Apply filters
    if (options.filters) {
      query = this.applyQueryFilters(query, options.filters);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: results, error, count } = await query;

    if (error) {
      throw new Error(`Browse query failed: ${error.message}`);
    }

    // Convert to SearchResult format
    const searchResults: SearchResult[] = (results || []).map(card => ({
      id: card.id,
      title: card.title,
      content: card.content,
      type: card.type,
      thumbnail_url: card.thumbnail_url,
      created_at: card.created_at,
      rank: 1.0 // Default rank for browse results
    }));

    return {
      results: searchResults,
      total: count || 0
    };
  }

  private static applyQueryFilters(query: any, filters: NonNullable<SearchOptions['filters']>) {
    if (filters.type?.length) {
      query = query.in('type', filters.type);
    }

    if (filters.isPinned !== undefined) {
      query = query.eq('is_pinned', filters.isPinned);
    }

    if (filters.isArchived !== undefined) {
      query = query.eq('is_archived', filters.isArchived);
    }

    if (filters.domain?.length) {
      query = query.in('source_domain', filters.domain);
    }

    if (filters.category?.length) {
      query = query.in('ai_category', filters.category);
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.from)
        .lte('created_at', filters.dateRange.to);
    }

    if (filters.tags?.length) {
      // This requires array operations - using overlaps for tags
      query = query.overlaps('ai_tags', filters.tags).overlaps('manual_tags', filters.tags);
    }

    return query;
  }

  private static applyFilters(results: SearchResult[], filters: NonNullable<SearchOptions['filters']>): SearchResult[] {
    return results.filter(result => {
      if (filters.type?.length && !filters.type.includes(result.type)) {
        return false;
      }

      // Additional client-side filtering if needed
      return true;
    });
  }

  private static applySorting(
    results: SearchResult[],
    sortBy?: string,
    sortOrder?: string
  ): SearchResult[] {
    if (sortBy === 'relevance' || !sortBy) {
      // Already sorted by rank from search
      return sortOrder === 'asc' ? results.reverse() : results;
    }

    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Vector similarity search
  static async findSimilar(
    cardId: string,
    userId: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    // First get the embedding of the reference card
    const { data: refCard, error: refError } = await supabase
      .from('cards')
      .select('embedding')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (refError || !refCard?.embedding) {
      throw new Error('Reference card not found or has no embedding');
    }

    // Find similar cards using vector similarity
    const { data: results, error } = await supabase.rpc('match_cards', {
      query_embedding: refCard.embedding,
      match_threshold: 0.7,
      match_count: limit,
      user_uuid: userId
    });

    if (error) {
      throw new Error(`Similarity search failed: ${error.message}`);
    }

    return (results || []).map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      type: result.type,
      thumbnail_url: null,
      created_at: new Date().toISOString(), // Will be filled from actual data
      rank: result.similarity
    }));
  }

  // Search suggestions based on history and content
  static async getSuggestions(userId: string, query: string): Promise<string[]> {
    if (query.length < 2) {
      // Return recent searches
      const { data: recent } = await supabase
        .from('search_sessions')
        .select('query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      return (recent || []).map(s => s.query);
    }

    // Get tag-based suggestions
    const { data: tags } = await supabase
      .from('cards')
      .select('ai_tags, manual_tags')
      .eq('user_id', userId)
      .limit(100);

    const allTags = new Set<string>();
    (tags || []).forEach(card => {
      [...(card.ai_tags || []), ...(card.manual_tags || [])].forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          allTags.add(tag);
        }
      });
    });

    return Array.from(allTags).slice(0, 5);
  }

  // Advanced search with complex queries
  static async advancedSearch(options: {
    userId: string;
    query?: string;
    must?: Array<{ field: string; value: any }>;
    should?: Array<{ field: string; value: any }>;
    mustNot?: Array<{ field: string; value: any }>;
    limit?: number;
  }): Promise<SearchResult[]> {
    // Build complex query based on boolean logic
    let query = supabase
      .from('cards')
      .select('*')
      .eq('user_id', options.userId)
      .is('deleted_at', null);

    // Apply must conditions (AND logic)
    if (options.must) {
      options.must.forEach(condition => {
        query = query.eq(condition.field, condition.value);
      });
    }

    // Apply must not conditions
    if (options.mustNot) {
      options.mustNot.forEach(condition => {
        query = query.not(condition.field, 'eq', condition.value);
      });
    }

    const { data: results, error } = await query.limit(options.limit || 50);

    if (error) {
      throw new Error(`Advanced search failed: ${error.message}`);
    }

    return (results || []).map(card => ({
      id: card.id,
      title: card.title,
      content: card.content,
      type: card.type,
      thumbnail_url: card.thumbnail_url,
      created_at: card.created_at,
      rank: 1.0
    }));
  }

  private static async logSearch(userId: string, query: string, resultsCount: number): Promise<void> {
    try {
      await supabase.from('search_sessions').insert({
        user_id: userId,
        query,
        results_count: resultsCount
      });
    } catch (error) {
      // Non-critical error, just log it
      console.warn('Failed to log search:', error);
    }
  }

  // Get search analytics for user
  static async getSearchAnalytics(userId: string, days: number = 30): Promise<{
    totalSearches: number;
    topQueries: Array<{ query: string; count: number }>;
    averageResults: number;
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions, error } = await supabase
      .from('search_sessions')
      .select('query, results_count')
      .eq('user_id', userId)
      .gte('created_at', since);

    if (error) {
      throw new Error(`Analytics query failed: ${error.message}`);
    }

    const queryCount: Record<string, number> = {};
    let totalResults = 0;

    (sessions || []).forEach(session => {
      queryCount[session.query] = (queryCount[session.query] || 0) + 1;
      totalResults += session.results_count;
    });

    const topQueries = Object.entries(queryCount)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSearches: sessions?.length || 0,
      topQueries,
      averageResults: sessions?.length ? totalResults / sessions.length : 0
    };
  }
}