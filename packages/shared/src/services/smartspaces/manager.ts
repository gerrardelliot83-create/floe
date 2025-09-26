import { supabase } from '@floe/supabase';
import type { SmartSpace, Card } from '../../types';

export interface SmartSpaceRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface SmartSpaceRules {
  conditions: SmartSpaceRule[];
  logic: 'AND' | 'OR';
}

export interface CreateSmartSpaceOptions {
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  rules: SmartSpaceRules;
}

export interface UpdateSmartSpaceOptions {
  spaceId: string;
  userId: string;
  name?: string;
  description?: string;
  icon?: string;
  rules?: SmartSpaceRules;
}

export class SmartSpacesManager {
  // Create a new smart space
  static async createSmartSpace(options: CreateSmartSpaceOptions): Promise<SmartSpace> {
    try {
      const { data: space, error } = await supabase
        .from('smart_spaces')
        .insert({
          user_id: options.userId,
          name: options.name,
          description: options.description,
          icon: options.icon || 'folder',
          rules: options.rules
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create smart space: ${error.message}`);
      }

      // Trigger initial organization
      await this.organizeCards(space.id, options.userId);

      return space;
    } catch (error) {
      console.error('Smart space creation failed:', error);
      throw error;
    }
  }

  // Update an existing smart space
  static async updateSmartSpace(options: UpdateSmartSpaceOptions): Promise<SmartSpace> {
    try {
      const updateData: any = {};

      if (options.name) updateData.name = options.name;
      if (options.description !== undefined) updateData.description = options.description;
      if (options.icon) updateData.icon = options.icon;
      if (options.rules) updateData.rules = options.rules;

      const { data: space, error } = await supabase
        .from('smart_spaces')
        .update(updateData)
        .eq('id', options.spaceId)
        .eq('user_id', options.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update smart space: ${error.message}`);
      }

      // Re-organize cards if rules changed
      if (options.rules) {
        await this.organizeCards(options.spaceId, options.userId);
      }

      return space;
    } catch (error) {
      console.error('Smart space update failed:', error);
      throw error;
    }
  }

  // Delete a smart space
  static async deleteSmartSpace(spaceId: string, userId: string): Promise<void> {
    try {
      // First, remove this space from all cards that contain it
      const { error: rpcError } = await supabase.rpc('remove_smart_space_from_all_cards', {
        space_id_param: spaceId,
        user_id_param: userId
      });

      if (rpcError) {
        throw new Error(`Failed to remove space from cards: ${rpcError.message}`);
      }

      // Then delete the space
      const { error } = await supabase
        .from('smart_spaces')
        .delete()
        .eq('id', spaceId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete smart space: ${error.message}`);
      }
    } catch (error) {
      console.error('Smart space deletion failed:', error);
      throw error;
    }
  }

  // Get all smart spaces for a user
  static async getUserSmartSpaces(userId: string): Promise<SmartSpace[]> {
    try {
      const { data: spaces, error } = await supabase
        .from('smart_spaces')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch smart spaces: ${error.message}`);
      }

      return spaces || [];
    } catch (error) {
      console.error('Failed to get user smart spaces:', error);
      throw error;
    }
  }

  // Get cards in a smart space
  static async getSmartSpaceCards(spaceId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Card[]> {
    try {
      const { data: cards, error } = await supabase
        .from('cards')
        .select(`
          id, title, content, type, thumbnail_url, created_at, updated_at,
          ai_tags, manual_tags, is_pinned, source_domain, ai_category
        `)
        .eq('user_id', userId)
        .contains('smart_space_ids', [spaceId])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch smart space cards: ${error.message}`);
      }

      return cards || [];
    } catch (error) {
      console.error('Failed to get smart space cards:', error);
      throw error;
    }
  }

  // Organize cards into smart spaces based on rules
  static async organizeCards(spaceId?: string, userId?: string): Promise<void> {
    try {
      let spacesToProcess: SmartSpace[] = [];

      if (spaceId && userId) {
        // Process specific space
        const { data: space, error } = await supabase
          .from('smart_spaces')
          .select('*')
          .eq('id', spaceId)
          .eq('user_id', userId)
          .single();

        if (error || !space) {
          throw new Error('Smart space not found');
        }

        spacesToProcess = [space];
      } else if (userId) {
        // Process all spaces for user
        spacesToProcess = await this.getUserSmartSpaces(userId);
      } else {
        throw new Error('Must provide either spaceId+userId or userId');
      }

      for (const space of spacesToProcess) {
        await this.organizeCardsForSpace(space);
      }
    } catch (error) {
      console.error('Card organization failed:', error);
      throw error;
    }
  }

  private static async organizeCardsForSpace(space: SmartSpace): Promise<void> {
    try {
      // Get all cards for the user
      const { data: allCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', space.user_id)
        .is('deleted_at', null);

      if (cardsError) {
        throw new Error(`Failed to fetch cards: ${cardsError.message}`);
      }

      const cards = allCards || [];
      const matchingCardIds: string[] = [];
      const nonMatchingCardIds: string[] = [];

      // Evaluate each card against the space rules
      for (const card of cards) {
        const matches = await this.evaluateCardAgainstRules(card, space.rules as SmartSpaceRules);

        if (matches) {
          matchingCardIds.push(card.id);
        } else if (card.smart_space_ids?.includes(space.id)) {
          // Card no longer matches but is in this space
          nonMatchingCardIds.push(card.id);
        }
      }

      // Update smart space assignments in a single atomic operation
      if (matchingCardIds.length > 0 || nonMatchingCardIds.length > 0) {
        const { error: batchError } = await supabase.rpc('batch_update_smart_space_cards', {
          space_id_param: space.id,
          user_id_param: space.user_id,
          add_card_ids: matchingCardIds,
          remove_card_ids: nonMatchingCardIds
        });

        if (batchError) {
          throw new Error(`Failed to update smart space assignments: ${batchError.message}`);
        }
      }

      console.log(`Organized ${matchingCardIds.length} cards into space "${space.name}"`);
    } catch (error) {
      console.error(`Failed to organize cards for space ${space.name}:`, error);
      throw error;
    }
  }

  // Evaluate if a card matches smart space rules
  private static async evaluateCardAgainstRules(card: Card, rules: SmartSpaceRules): Promise<boolean> {
    if (!rules.conditions || rules.conditions.length === 0) {
      return false; // No rules means no automatic inclusion
    }

    const results = await Promise.all(
      rules.conditions.map(condition => this.evaluateCondition(card, condition))
    );

    // Apply logic
    if (rules.logic === 'AND') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }

  private static async evaluateCondition(card: Card, condition: SmartSpaceRule): Promise<boolean> {
    const { field, operator, value } = condition;
    let cardValue: any;

    // Extract field value from card
    switch (field) {
      case 'type':
        cardValue = card.type;
        break;
      case 'title':
        cardValue = card.title?.toLowerCase();
        break;
      case 'content':
        cardValue = card.content?.toLowerCase();
        break;
      case 'ai_tags':
        cardValue = card.ai_tags || [];
        break;
      case 'manual_tags':
        cardValue = card.manual_tags || [];
        break;
      case 'ai_category':
        cardValue = card.ai_category;
        break;
      case 'source_domain':
        cardValue = card.source_domain;
        break;
      case 'is_pinned':
        cardValue = card.is_pinned;
        break;
      case 'is_archived':
        cardValue = card.is_archived;
        break;
      case 'created_at':
        cardValue = new Date(card.created_at);
        break;
      default:
        return false;
    }

    // Apply operator
    switch (operator) {
      case 'equals':
        return cardValue === value;

      case 'not_equals':
        return cardValue !== value;

      case 'contains':
        if (Array.isArray(cardValue)) {
          return cardValue.some(item =>
            typeof item === 'string' ? item.toLowerCase().includes(value.toLowerCase()) : item === value
          );
        }
        return typeof cardValue === 'string' ? cardValue.includes(value.toLowerCase()) : false;

      case 'not_contains':
        if (Array.isArray(cardValue)) {
          return !cardValue.some(item =>
            typeof item === 'string' ? item.toLowerCase().includes(value.toLowerCase()) : item === value
          );
        }
        return typeof cardValue === 'string' ? !cardValue.includes(value.toLowerCase()) : true;

      case 'greater_than':
        if (cardValue instanceof Date && typeof value === 'string') {
          return cardValue > new Date(value);
        }
        return cardValue > value;

      case 'less_than':
        if (cardValue instanceof Date && typeof value === 'string') {
          return cardValue < new Date(value);
        }
        return cardValue < value;

      default:
        return false;
    }
  }

  // Get default smart spaces configuration
  static getDefaultSmartSpaces(): Omit<CreateSmartSpaceOptions, 'userId'>[] {
    return [
      {
        name: 'Recent',
        description: 'Cards added in the last 7 days',
        icon: 'clock',
        rules: {
          conditions: [
            {
              field: 'created_at',
              operator: 'greater_than',
              value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          logic: 'AND'
        }
      },
      {
        name: 'Pinned',
        description: 'All pinned items',
        icon: 'pin',
        rules: {
          conditions: [
            {
              field: 'is_pinned',
              operator: 'equals',
              value: true
            }
          ],
          logic: 'AND'
        }
      },
      {
        name: 'Images',
        description: 'All images and visual content',
        icon: 'image',
        rules: {
          conditions: [
            {
              field: 'type',
              operator: 'equals',
              value: 'image'
            }
          ],
          logic: 'AND'
        }
      },
      {
        name: 'Articles',
        description: 'All web articles and long-form content',
        icon: 'document',
        rules: {
          conditions: [
            {
              field: 'type',
              operator: 'equals',
              value: 'article'
            }
          ],
          logic: 'AND'
        }
      },
      {
        name: 'Notes',
        description: 'All personal notes and thoughts',
        icon: 'note',
        rules: {
          conditions: [
            {
              field: 'type',
              operator: 'equals',
              value: 'note'
            }
          ],
          logic: 'AND'
        }
      }
    ];
  }

  // Create default smart spaces for a new user
  static async createDefaultSmartSpaces(userId: string): Promise<SmartSpace[]> {
    const defaultSpaces = this.getDefaultSmartSpaces();
    const createdSpaces: SmartSpace[] = [];

    for (const spaceConfig of defaultSpaces) {
      try {
        const space = await this.createSmartSpace({
          ...spaceConfig,
          userId
        });
        createdSpaces.push(space);
      } catch (error) {
        console.error(`Failed to create default space "${spaceConfig.name}":`, error);
      }
    }

    return createdSpaces;
  }

  // Refresh all smart spaces for a user (useful after bulk operations)
  static async refreshUserSmartSpaces(userId: string): Promise<void> {
    try {
      await this.organizeCards(undefined, userId);
      console.log('Successfully refreshed all smart spaces');
    } catch (error) {
      console.error('Failed to refresh smart spaces:', error);
      throw error;
    }
  }
}